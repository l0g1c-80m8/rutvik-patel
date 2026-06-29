function initPageScripts() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('is-open');
            mobileMenuBtn.textContent = open ? 'CLOSE' : 'MENU';
        });
    }

    // Smooth scrolling for in-page anchors. Uses getBoundingClientRect()+scrollY
    // (not offsetTop) because each section sits inside a position:relative
    // custom element (e.g. <research-section>), which would make offsetTop
    // measure ~0 against the host instead of the document.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });

            if (mobileMenu && mobileMenu.classList.contains('is-open')) {
                mobileMenu.classList.remove('is-open');
                if (mobileMenuBtn) mobileMenuBtn.textContent = 'MENU';
            }
        });
    });

    const navbar = document.querySelector('nav.tlm-nav') || document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            const y = window.pageYOffset || document.documentElement.scrollTop;
            navbar.classList.toggle('scrolled', y > 24);
        });
    }

    // Highlight nav link for the section currently in view.
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            document.querySelectorAll('.tlm-nav-links a').forEach(link => {
                link.classList.toggle('is-active', link.dataset.section === entry.target.id);
            });
        });
    }, { rootMargin: '-100px 0px -66% 0px' });
    sections.forEach(s => navObserver.observe(s));

    initAmbientAudio();

    // Back-to-top button — bottom-right. Visible after 300px of scroll.
    // When the footer enters the viewport, both this button and the audio
    // chip slide up (via a body class) so they clear the footer sticker.
    const backToTopBtn = document.createElement('button');
    backToTopBtn.textContent = '^';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.pageYOffset > 300);
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const footer = document.querySelector('footer.tlm-footer, portfolio-footer');
    if (footer) {
        new IntersectionObserver(entries => {
            document.body.classList.toggle('is-near-footer', entries[0].isIntersecting);
        }, { rootMargin: '0px 0px -40px 0px' }).observe(footer);
    }
}

// Ambient audio:
//   • Desktop → terminal prompt invites "press [space] for ambient",
//     visible whenever audio is off. Space toggles freely — enter and exit.
//   • Mobile  → first tap anywhere arms audio (no prompt, no keyboard);
//     after that, the floating chip is the only on-screen control.
//   • All audio originates from a user gesture (browser autoplay policy).
function initAmbientAudio() {
    const audio  = document.getElementById('ambient-audio');
    const prompt = document.getElementById('audio-prompt');
    const chip   = document.getElementById('audio-chip');
    if (!audio) return;

    const TARGET_VOLUME = 0.3;
    const FADE_IN_MS    = 3500;
    const FADE_OUT_MS   = 700;
    let armed = false;
    let activeFade = null;
    let promptTimer = null;
    let chipTimer = null;

    audio.volume = 0;

    // Cancellable volume fade — rapid toggles never end up with competing fades.
    const fadeVolume = (from, to, duration) => {
        if (activeFade) cancelAnimationFrame(activeFade);
        return new Promise(resolve => {
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                audio.volume = from + (to - from) * t;
                if (t < 1) activeFade = requestAnimationFrame(tick);
                else { activeFade = null; resolve(); }
            };
            activeFade = requestAnimationFrame(tick);
        });
    };

    const showChip = () => {
        if (!chip) return;
        if (chipTimer) { clearTimeout(chipTimer); chipTimer = null; }
        chip.hidden = false;
        requestAnimationFrame(() => chip.classList.add('is-visible'));
    };
    const hideChip = () => {
        if (!chip) return;
        if (chipTimer) clearTimeout(chipTimer);
        chip.classList.remove('is-visible');
        chipTimer = setTimeout(() => { chip.hidden = true; chipTimer = null; }, 400);
    };

    const showPrompt = () => {
        if (!prompt) return;
        if (promptTimer) { clearTimeout(promptTimer); promptTimer = null; }
        prompt.classList.remove('is-leaving');
        prompt.hidden = false;
        requestAnimationFrame(() => prompt.classList.add('is-visible'));
    };

    const promptVerb = prompt && prompt.querySelector('#audio-prompt-verb');
    const setPromptVerb = (armed) => {
        if (!promptVerb) return;
        promptVerb.textContent = armed ? 'disable' : 'enable';
    };

    const start = async () => {
        if (armed) return;
        armed = true;
        setPromptVerb(true);
        try {
            audio.volume = 0;
            if (audio.paused) await audio.play();
            showChip();
            fadeVolume(0, TARGET_VOLUME, FADE_IN_MS);
        } catch (err) {
            console.warn('Ambient audio play failed:', err);
            armed = false;
            setPromptVerb(false);
            hideChip();
        }
    };

    const stop = async () => {
        if (!armed) return;
        armed = false;
        setPromptVerb(false);
        hideChip();
        await fadeVolume(audio.volume, 0, FADE_OUT_MS);
        if (!armed) audio.pause();   // skip if user re-armed mid-fade
    };

    const toggle = () => (armed ? stop() : start());

    const hasKeyboard = window.matchMedia('(pointer: fine)').matches;

    if (hasKeyboard) {
        // Prompt stays visible throughout; the verb swaps enable ↔ disable
        // to reflect what the next space press will do.
        setPromptVerb(false);
        showPrompt();

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                const tag = (e.target && e.target.tagName) || '';
                if (tag === 'INPUT' || tag === 'TEXTAREA') return;
                e.preventDefault();
                toggle();
            }
        });
    } else {
        // Touch device: first tap anywhere on bare page area arms audio.
        // Skip taps on interactive controls so the user isn't surprised when
        // they meant to click a link or expand a row.
        document.addEventListener('pointerdown', (e) => {
            if (armed) return;
            if (e.target.closest('button, a, input, textarea, select, label, [role="button"]')) return;
            start();
        });
    }

    if (chip) chip.addEventListener('click', stop);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && armed && !audio.paused) audio.pause();
        else if (!document.hidden && armed && audio.paused) {
            audio.play().catch(() => {});
        }
    });
}

const NUM_COMPONENTS = 9;

window.dynamicComponentTracker = {
    expected: NUM_COMPONENTS,
    loaded: 0,
    markExpected() { this.expected++; },
    markLoaded() {
        this.loaded++;
        if (this.loaded === this.expected) {
            initPageScripts();
        }
    }
};

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

// Ambient audio without a dedicated button:
//   • Desktop  → terminal prompt invites "press [space] for ambient"
//   • Mobile   → first tap anywhere arms audio (no prompt, since no keyboard)
//   • Once playing, a floating mute chip is the only on-screen control.
// All audio still originates from a user gesture (browser autoplay policy).
function initAmbientAudio() {
    const audio  = document.getElementById('ambient-audio');
    const prompt = document.getElementById('audio-prompt');
    const chip   = document.getElementById('audio-chip');
    if (!audio) return;

    const TARGET_VOLUME = 0.3;
    const FADE_IN_MS    = 3500;
    const FADE_OUT_MS   = 700;
    const PROMPT_DELAY  = 2500;
    const PROMPT_TIMEOUT = 18000;
    let armed = false;
    let promptDismissed = false;

    audio.volume = 0;

    const fadeVolume = (from, to, duration) => new Promise(resolve => {
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            audio.volume = from + (to - from) * t;
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
        };
        requestAnimationFrame(tick);
    });

    const showChip = () => {
        chip.hidden = false;
        requestAnimationFrame(() => chip.classList.add('is-visible'));
    };
    const hideChip = () => {
        chip.classList.remove('is-visible');
        setTimeout(() => { chip.hidden = true; }, 400);
    };

    const dismissPrompt = () => {
        if (promptDismissed || !prompt || prompt.hidden) return;
        promptDismissed = true;
        prompt.classList.add('is-leaving');
        setTimeout(() => { prompt.hidden = true; }, 400);
    };

    const start = async () => {
        if (armed) return;
        armed = true;
        dismissPrompt();
        try {
            audio.volume = 0;
            await audio.play();
            showChip();
            fadeVolume(0, TARGET_VOLUME, FADE_IN_MS);
        } catch (err) {
            console.warn('Ambient audio play failed:', err);
            armed = false;
        }
    };

    const stop = async () => {
        if (!armed) return;
        hideChip();
        await fadeVolume(audio.volume, 0, FADE_OUT_MS);
        audio.pause();
        armed = false;
    };

    // Branch on input modality. (pointer: fine) ≈ has mouse → likely keyboard.
    const hasKeyboard = window.matchMedia('(pointer: fine)').matches;

    if (hasKeyboard && prompt) {
        // Fade the prompt in after a beat so it doesn't compete with page load.
        setTimeout(() => {
            if (armed) return;
            prompt.hidden = false;
            requestAnimationFrame(() => prompt.classList.add('is-visible'));
        }, PROMPT_DELAY);

        document.addEventListener('keydown', (e) => {
            if (armed) return;
            if (e.code === 'Space' || e.key === ' ') {
                // Only intercept space if the user isn't typing in a form.
                const tag = (e.target && e.target.tagName) || '';
                if (tag === 'INPUT' || tag === 'TEXTAREA') return;
                e.preventDefault();
                start();
            }
        });

        // Any click also dismisses the prompt (without starting audio), so the
        // page stays unobtrusive after the visitor has engaged with anything.
        document.addEventListener('click', () => {
            if (!armed) dismissPrompt();
        }, { once: true });

        // Auto-fade after timeout — never leave a stale prompt sitting around.
        setTimeout(dismissPrompt, PROMPT_TIMEOUT);
    } else {
        // Touch device: first tap anywhere on bare page area arms audio.
        // Skip taps on interactive controls so the user isn't surprised when
        // they meant to click a link or expand a row.
        const tapHandler = (e) => {
            if (armed) return;
            if (e.target.closest('button, a, input, textarea, select, label, [role="button"]')) return;
            start();
        };
        document.addEventListener('pointerdown', tapHandler, { once: false });
    }

    if (chip) chip.addEventListener('click', stop);

    // Pause when tab is hidden; resume cleanly when it returns.
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

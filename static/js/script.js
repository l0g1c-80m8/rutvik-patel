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

    // Back-to-top button.
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

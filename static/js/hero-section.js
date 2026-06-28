class HeroSection extends HTMLElement {
    async connectedCallback() {
        const html = await window.templateLoader.loadTemplate('static/html/hero-section.html');
        if (!html) {
            window.dynamicComponentTracker.markLoaded();
            return;
        }

        try {
            const response = await fetch('static/assets/data.json');
            const rawData = await response.json();
            const heroData = _.get(rawData, ['hero-section'], {});

            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');

            const compiled = _.template(html);
            this.innerHTML = compiled({
                title:    heroData.title || '',
                subtitle: heroData.subtitle || '',
                build:    `v${yyyy}.${mm}`,
                deploy:   `${yyyy}-${mm}-${dd}`
            });
        } catch (error) {
            console.error('Error loading hero data:', error);
            const compiled = _.template(html);
            this.innerHTML = compiled({ title: '', subtitle: '', build: '', deploy: '' });
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }
}

customElements.define('hero-section', HeroSection);

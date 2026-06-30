class Navigation extends HTMLElement {
    async connectedCallback() {
        const html = await window.templateLoader.loadTemplate('static/html/navigation.html');
        if (!html) {
            window.dynamicComponentTracker.markLoaded();
            return;
        }
        try {
            const res = await fetch('static/assets/data.json');
            const raw = await res.json();
            const nav = _.get(raw, ['navigation'], {});
            const compiled = _.template(html);
            this.innerHTML = compiled({
                brand:  nav.brand || { node: '', name: '' },
                status: nav.status || '',
                links:  nav.links  || []
            });
        } catch (err) {
            console.error('Error loading navigation data:', err);
            this.innerHTML = '';
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }
}

customElements.define('portfolio-navigation', Navigation);

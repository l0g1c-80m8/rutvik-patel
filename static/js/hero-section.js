// Career start date — drives the `runtime` meta cell. Change this single
// constant to reflect your real robotics-career start (M.S. enrollment,
// first research role, etc).
const CAREER_START = new Date('2020-09-01T00:00:00');

function computeRuntime(start, now = new Date()) {
    let years = now.getFullYear() - start.getFullYear();
    let anniversary = new Date(start);
    anniversary.setFullYear(start.getFullYear() + years);
    if (anniversary > now) {
        years -= 1;
        anniversary.setFullYear(start.getFullYear() + years);
    }
    const days = Math.floor((now - anniversary) / 86400000);
    return `${years}y · ${days}d`;
}

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
                deploy:   `${yyyy}-${mm}-${dd}`,
                runtime:  computeRuntime(CAREER_START, now)
            });
        } catch (error) {
            console.error('Error loading hero data:', error);
            const compiled = _.template(html);
            this.innerHTML = compiled({ title: '', subtitle: '', build: '', deploy: '', runtime: '' });
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }
}

customElements.define('hero-section', HeroSection);

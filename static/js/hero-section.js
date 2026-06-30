// Career start date — drives the `runtime` meta cell.
const CAREER_START = new Date('2020-09-01T00:00:00');

const pad = (n, w = 2) => String(n).padStart(w, '0');

// Returns "Yy Dd HH:MM:SS.μμμμμμ". Microseconds come from performance.now()'s
// sub-millisecond fractional part (true wall-clock μs is unavailable in JS).
function formatRuntime() {
    const nowMsHi = performance.timeOrigin + performance.now();
    const now = new Date(Math.floor(nowMsHi));

    let years = now.getFullYear() - CAREER_START.getFullYear();
    const anniv = new Date(CAREER_START);
    anniv.setFullYear(CAREER_START.getFullYear() + years);
    if (anniv > now) {
        years -= 1;
        anniv.setFullYear(CAREER_START.getFullYear() + years);
    }

    const elapsedMs = nowMsHi - anniv.getTime();
    const days  = Math.floor(elapsedMs / 86400000);
    const remMs = elapsedMs - days * 86400000;
    const hours = Math.floor(remMs / 3600000);
    const mins  = Math.floor((remMs % 3600000) / 60000);
    const secs  = Math.floor((remMs % 60000) / 1000);
    const subSec = remMs - Math.floor(remMs / 1000) * 1000;
    const micros = Math.floor(subSec * 1000);

    return `${years}y ${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}.${pad(micros, 6)}`;
}

function startRuntimeTicker(el) {
    const tick = () => {
        el.textContent = formatRuntime();
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// Inject the live runtime into any meta entry marked `dynamic: "runtime"`.
function resolveDynamicMeta(meta) {
    return (meta || []).map(m =>
        m.dynamic === 'runtime' ? { ...m, value: formatRuntime() } : m
    );
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
            const mm = pad(now.getMonth() + 1);
            const dd = pad(now.getDate());

            const compiled = _.template(html);
            this.innerHTML = compiled({
                name:       heroData.name       || '',
                title:      heroData.title      || '',
                subtitle:   heroData.subtitle   || '',
                promptPath: heroData.promptPath || '~',
                promptCmd:  heroData.promptCmd  || 'whoami',
                avatar:     heroData.avatar     || null,
                actions:    heroData.actions    || [],
                meta:       resolveDynamicMeta(heroData.meta),
                build:      `v${yyyy}.${mm}`,
                deploy:     `${yyyy}-${mm}-${dd}`
            });

            const runtimeEl = this.querySelector('#hero-runtime');
            if (runtimeEl) startRuntimeTicker(runtimeEl);
        } catch (error) {
            console.error('Error loading hero data:', error);
            this.innerHTML = '';
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }
}

customElements.define('hero-section', HeroSection);

class ResearchSection extends HTMLElement {
    async connectedCallback() {
        const html = await window.templateLoader.loadTemplate('static/html/research-section.html');
        if (!html) {
            window.dynamicComponentTracker.markLoaded();
            return;
        }

        try {
            const response = await fetch('static/assets/data.json');
            const rawData = await response.json();
            this.papers = (rawData['research-section'] || []).map((p, i) => ({
                ...p,
                idx:        `P-${String(i + 1).padStart(3, '0')}`,
                year:       this.extractYear(p.venue),
                venueShort: this.shortenVenue(p.venue),
            }));

            this.innerHTML = html;
            this.querySelector('#research-count').textContent = String(this.papers.length).padStart(2, '0');

            this.activeFilter = 'all';
            this.expanded = new Set();
            this.render();
            this.wireFilters();
        } catch (error) {
            console.error('Error loading research data:', error);
            this.innerHTML = html;
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }

    extractYear(venue) {
        const m = (venue || '').match(/\b(20\d{2})\b/);
        return m ? m[1] : '----';
    }

    shortenVenue(venue) {
        if (!venue) return '';
        // pull abbreviation from parentheses if present
        const paren = venue.match(/\(([^)]+)\)/);
        if (paren) {
            // strip volume/year noise from the abbreviation
            const cleaned = paren[1].split(/[, ]/)[0].toUpperCase();
            const volMatch = venue.match(/Vol(?:ume)?\.?\s*(\d+)/i);
            return volMatch ? `${cleaned} v.${volMatch[1]}` : cleaned;
        }
        // fallback: first significant word that looks like an acronym
        const acro = venue.match(/\b([A-Z]{2,})\b/);
        return acro ? acro[1] : venue.split(/\s+/).slice(0, 3).join(' ');
    }

    wireFilters() {
        this.querySelectorAll('.tlm-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeFilter = btn.dataset.filter;
                this.querySelectorAll('.tlm-filter').forEach(b =>
                    b.classList.toggle('is-active', b === btn));
                this.render();
            });
        });
    }

    render() {
        const filtered = this.activeFilter === 'all'
            ? this.papers
            : this.papers.filter(p => p.type === this.activeFilter);

        const rows = this.querySelector('#research-rows');
        rows.innerHTML = filtered.map(p => this.renderRow(p)).join('');

        rows.querySelectorAll('.tlm-row').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('a')) return; // don't toggle when clicking a resource link
                const idx = row.dataset.idx;
                if (this.expanded.has(idx)) this.expanded.delete(idx);
                else this.expanded.add(idx);
                this.render();
            });
        });
    }

    renderRow(p) {
        const open = this.expanded.has(p.idx);
        const tags = (p.tags || []).map(t => `<span class="tlm-tag">${t}</span>`).join('');
        const resources = Object.entries(p.resources || {}).map(([k, url]) => {
            const label = { paper: '↗ paper', code: '↗ code', video: '↗ video', site: '↗ site', demo: '↗ demo' }[k] || `↗ ${k}`;
            return `<a class="tlm-res" href="${url}" target="_blank" rel="noopener">${label}</a>`;
        }).join('');

        return `
        <div class="tlm-row ${open ? 'is-open' : ''}" data-idx="${p.idx}" role="row">
          <div class="tlm-row-line">
            <span class="col-idx">${p.idx}</span>
            <span class="col-yr">${p.year}</span>
            <span class="col-title">${p.title}</span>
            <span class="col-venue">${p.venueShort}</span>
            <span class="col-type">${p.type.toUpperCase()}</span>
            <span class="col-act">${open ? '−' : '+'}</span>
          </div>
          ${open ? `
            <div class="tlm-row-body">
              <div class="tlm-row-meta">
                <span class="k">venue</span><span class="v">${p.venue}</span>
              </div>
              <p class="tlm-row-desc">${p.description || ''}</p>
              ${tags ? `<div class="tlm-row-tags">${tags}</div>` : ''}
              ${resources ? `<div class="tlm-row-res">${resources}</div>` : ''}
              ${p.image ? `<img class="tlm-row-img" src="${p.image}" alt="${p.title}">` : ''}
            </div>` : ''}
        </div>`;
    }
}

customElements.define('research-section', ResearchSection);

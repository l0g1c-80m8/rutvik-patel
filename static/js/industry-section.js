class IndustrySection extends HTMLElement {
    async connectedCallback() {
        const html = await window.templateLoader.loadTemplate('static/html/industry-section.html');
        if (!html) {
            window.dynamicComponentTracker.markLoaded();
            return;
        }

        try {
            const response = await fetch('static/assets/data.json');
            const rawData = await response.json();
            this.engagements = (rawData['industry-section'] || []).map((e, i) => ({
                ...e,
                idx:          `W-${String(i + 1).padStart(3, '0')}`,
                companyShort: this.shortenCompany(e.company),
            }));

            this.innerHTML = html;
            this.querySelector('#industry-count').textContent = String(this.engagements.length).padStart(2, '0');

            this.expanded = new Set();
            this.render();
        } catch (error) {
            console.error('Error loading industry data:', error);
            this.innerHTML = html;
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }

    shortenCompany(name) {
        if (!name) return '';
        // "GrayMatter Robotics" → "graymatter"; otherwise lowercase first word.
        const map = { 'graymatter robotics': 'gmr' };
        const k = name.toLowerCase();
        return map[k] || name.toLowerCase();
    }

    render() {
        const rows = this.querySelector('#industry-rows');
        rows.innerHTML = this.engagements.map(e => this.renderRow(e)).join('');

        rows.querySelectorAll('.tlm-row').forEach(row => {
            row.addEventListener('click', ev => {
                if (ev.target.closest('a')) return;
                const idx = row.dataset.idx;
                if (this.expanded.has(idx)) this.expanded.delete(idx);
                else this.expanded.add(idx);
                this.render();
            });
        });
    }

    renderBlock(block) {
        if (!block || !Array.isArray(block.items) || !block.items.length) return '';
        const items = block.items.map(i => `<li>${i}</li>`).join('');
        return `
            <div class="tlm-row-block">
              <div class="tlm-row-block-head">${block.title || ''}</div>
              <ul class="tlm-row-block-list">${items}</ul>
            </div>`;
    }

    renderButtons(buttons) {
        if (!Array.isArray(buttons) || !buttons.length) return '';
        const links = buttons
            .filter(b => b && b.url)
            .map(b => `<a class="tlm-res" href="${b.url}" target="_blank" rel="noopener">↗ ${b.label || 'link'}</a>`)
            .join('');
        return links ? `<div class="tlm-row-res">${links}</div>` : '';
    }

    renderRow(e) {
        const open = this.expanded.has(e.idx);
        const left  = this.renderBlock(e.leftColumn);
        const right = this.renderBlock(e.rightColumn);
        const blocks = (left || right) ? `<div class="tlm-row-blocks">${left}${right}</div>` : '';
        const resources = this.renderButtons(e.buttons);

        return `
        <div class="tlm-row ${open ? 'is-open' : ''}" data-idx="${e.idx}" role="row">
          <div class="tlm-row-line">
            <span class="col-idx">${e.idx}</span>
            <span class="col-company">${e.companyShort}</span>
            <span class="col-title">${e.title}</span>
            <span class="col-act">${open ? '−' : '+'}</span>
          </div>
          ${open ? `
            <div class="tlm-row-body">
              ${e.company ? `
                <div class="tlm-row-meta">
                  <span class="k">company</span><span class="v">${e.company}</span>
                </div>` : ''}
              <p class="tlm-row-desc">${e.description || ''}</p>
              ${blocks}
              ${resources}
            </div>` : ''}
        </div>`;
    }
}

customElements.define('industry-section', IndustrySection);

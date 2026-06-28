class ProjectSection extends HTMLElement {
    async connectedCallback() {
        const html = await window.templateLoader.loadTemplate('static/html/project-section.html');
        if (!html) {
            window.dynamicComponentTracker.markLoaded();
            return;
        }

        try {
            const response = await fetch('static/assets/data.json');
            const rawData = await response.json();
            this.projects = (rawData['project-section'] || []).map((p, i) => ({
                ...p,
                idx:        `B-${String(i + 1).padStart(3, '0')}`,
                stackShort: (p.topic || []).slice(0, 3).join(' · '),
            }));

            this.innerHTML = html;
            this.querySelector('#projects-count').textContent = String(this.projects.length).padStart(2, '0');

            this.expanded = new Set();
            this.render();
        } catch (error) {
            console.error('Error loading project data:', error);
            this.innerHTML = html;
        } finally {
            window.dynamicComponentTracker.markLoaded();
        }
    }

    render() {
        const rows = this.querySelector('#projects-rows');
        rows.innerHTML = this.projects.map(p => this.renderRow(p)).join('');

        rows.querySelectorAll('.tlm-row').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('a')) return;
                const idx = row.dataset.idx;
                if (this.expanded.has(idx)) this.expanded.delete(idx);
                else this.expanded.add(idx);
                this.render();
            });
        });
    }

    renderResources(resources = {}) {
        const links = [];
        if (Array.isArray(resources.code)) {
            resources.code.forEach(repo => {
                links.push(`<a class="tlm-res" href="${repo.url}" target="_blank" rel="noopener">↗ ${repo.label || 'code'}</a>`);
            });
        } else if (typeof resources.code === 'string') {
            links.push(`<a class="tlm-res" href="${resources.code}" target="_blank" rel="noopener">↗ code</a>`);
        }
        if (resources.video)   links.push(`<a class="tlm-res" href="${resources.video}" target="_blank" rel="noopener">↗ video</a>`);
        if (resources.gallery) links.push(`<a class="tlm-res" href="${resources.gallery}" target="_blank" rel="noopener">↗ gallery</a>`);
        if (resources.site)    links.push(`<a class="tlm-res" href="${resources.site}" target="_blank" rel="noopener">↗ site</a>`);
        if (resources.paper)   links.push(`<a class="tlm-res" href="${resources.paper}" target="_blank" rel="noopener">↗ paper</a>`);
        return links.join('');
    }

    renderRow(p) {
        const open = this.expanded.has(p.idx);
        const tags = (p.topic || []).map(t => `<span class="tlm-tag">${t}</span>`).join('');
        const resources = this.renderResources(p.resources);

        return `
        <div class="tlm-row ${open ? 'is-open' : ''}" data-idx="${p.idx}" role="row">
          <div class="tlm-row-line">
            <span class="col-idx">${p.idx}</span>
            <span class="col-domain">${p.caption || ''}</span>
            <span class="col-title">${p.title}</span>
            <span class="col-stack">${p.stackShort}</span>
            <span class="col-act">${open ? '−' : '+'}</span>
          </div>
          ${open ? `
            <div class="tlm-row-body">
              <p class="tlm-row-desc">${p.detail || ''}</p>
              ${tags ? `<div class="tlm-row-tags">${tags}</div>` : ''}
              ${resources ? `<div class="tlm-row-res">${resources}</div>` : ''}
              ${p.image ? `<img class="tlm-row-img" src="${p.image}" alt="${p.title}">` : ''}
            </div>` : ''}
        </div>`;
    }
}

customElements.define('project-section', ProjectSection);

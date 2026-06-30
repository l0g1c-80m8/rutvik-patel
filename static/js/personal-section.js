class PersonalLifeSection extends HTMLElement {
  async connectedCallback() {
    const html = await window.templateLoader.loadTemplate('static/html/personal-section.html');
    if (!html) {
      window.dynamicComponentTracker.markLoaded();
      return;
    }

    this.innerHTML = html;

    try {
      const res = await fetch('static/assets/data.json');
      const data = await res.json();
      const items = _.get(data, ['personal-life'], []);
      const container = this.querySelector('#personal-life-grid');
      if (!container) return;

      container.innerHTML = items.map((item, i) => {
        const idx = `LOG-${String(i + 1).padStart(2, '0')}`;
        const media = item.video
          ? `<div class="tlm-log-video">
               <iframe
                 src="${item.video}?rel=0"
                 title="${item.title}"
                 frameborder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                 allowfullscreen
                 referrerpolicy="strict-origin-when-cross-origin"
               ></iframe>
             </div>`
          : '';
        return `
          <article class="tlm-log">
            <header class="tlm-log-head">
              <span class="tlm-log-idx">${idx}</span>
              <span class="tlm-log-title">${(item.title || '').toLowerCase()}</span>
            </header>
            ${media}
            <p class="tlm-log-desc">${item.description || ''}</p>
          </article>
        `;
      }).join('');
    } catch (err) {
      console.error('Error loading personal-life data:', err);
    }

    window.dynamicComponentTracker.markLoaded();
  }
}

customElements.define('personal-section', PersonalLifeSection);

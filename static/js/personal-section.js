class PersonalLifeSection extends HTMLElement {
  async connectedCallback() {
    const html = await window.templateLoader.loadTemplate('static/html/personal-section.html');

    if (!html) return;

    this.innerHTML = html;

    try {
      const res = await fetch('static/assets/data.json');
      const data = await res.json();
      const items = _.get(data, ['personal-life'], []);
      const container = this.querySelector('#personal-life-grid');

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-robot-blue/50 transition-all group';

        const media = item.video
          ? `<iframe
              class="w-full h-full object-cover opacity-80 relative z-10"
              src="${item.video}?rel=0"
              title="${item.title}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>`
          : '';

        card.innerHTML = `
        <div class="h-48 bg-gradient-to-br ${item.gradient} relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
            ${media}
            <div class="absolute bottom-4 left-4 z-20">
            <h3 class="text-xl font-bold text-white">${item.title}</h3>
            </div>
        </div>
        <div class="p-6">
            <p class="text-gray-300">${item.description}</p>
        </div>
        `;
        container.appendChild(card);
      });

    } catch (err) {
      console.error('Error loading personal-life data:', err);
    }

    window.dynamicComponentTracker.markLoaded();
  }
}

customElements.define('personal-section', PersonalLifeSection);

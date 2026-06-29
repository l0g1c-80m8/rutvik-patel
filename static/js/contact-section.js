class ContactSection extends HTMLElement {
  async connectedCallback() {
    const html = await window.templateLoader.loadTemplate('static/html/contact-section.html');
    if (!html) {
      window.dynamicComponentTracker.markLoaded();
      return;
    }
    try {
      const response = await fetch('static/assets/data.json');
      const rawData = await response.json();
      const data = _.get(rawData, ['contact-section'], {});

      this.innerHTML = html;
      this.populateContactLinks(data.contacts || []);
      this.initializeForm(data);
    } catch (error) {
      console.error('Error loading contact data:', error);
      this.innerHTML = html;
      this.populateContactLinks([]);
      this.initializeForm({});
    } finally {
      window.dynamicComponentTracker.markLoaded();
    }
  }

  populateContactLinks(contacts) {
    const linksContainer = this.querySelector('#contact-links');
    if (!linksContainer) return;

    linksContainer.innerHTML = contacts.map(c => {
      const isMail = (c.link || '').startsWith('mailto:');
      return `
        <a class="tlm-contact-channel" href="${c.link}"${isMail ? '' : ' target="_blank" rel="noopener noreferrer"'}>
          <span class="k">${(c.label || '').toLowerCase()}</span>
          <span class="v">${c.text}</span>
        </a>
      `;
    }).join('');
  }

  initializeForm(/* data */) {
    const form = this.querySelector('#contact-form');
    const submitBtn = this.querySelector('#form-submit-btn');
    const successMsg = this.querySelector('#form-success-msg');

    if (!form || !submitBtn || !successMsg) {
      console.warn('Contact form elements not found');
      return;
    }

    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwvdqero';
    const originalBtnText = submitBtn.textContent;

    const setStatus = (text, ok = true) => {
      successMsg.textContent = `>>> ${text}`;
      successMsg.classList.remove('hidden', 'is-success', 'is-error');
      successMsg.classList.add(ok ? 'is-success' : 'is-error');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const fd = new FormData(form);
      // Formspree honors `_subject` to set the email subject line in your inbox.
      const subject = (fd.get('subject') || '').toString().trim();
      const name = (fd.get('name') || '').toString().trim();
      fd.set('_subject', subject || `Portfolio contact from ${name || 'visitor'}`);

      submitBtn.disabled = true;
      submitBtn.textContent = '> sending…';
      successMsg.classList.add('hidden');

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: fd,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          setStatus("message sent · 200 ok — i'll get back to you soon", true);
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = (data.errors && data.errors.map(x => x.message).join(', ')) ||
                      'send failed · please email me directly';
          setStatus(msg, false);
        }
      } catch (err) {
        console.error('Contact form error:', err);
        setStatus('network error · please email me directly', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
}

customElements.define('contact-section', ContactSection);
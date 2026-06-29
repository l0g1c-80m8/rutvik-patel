class ContactSection extends HTMLElement {
  async connectedCallback() {
    const html = await window.templateLoader.loadTemplate('static/html/contact-section.html');
    if (html) {
      try {
        const response = await fetch('static/assets/data.json');
        const rawData = await response.json();
        const data = _.get(rawData, ['contact-section'], {});
        
        // Replace template variables in HTML
        let processedHtml = html
          .replace('${title}', data.title || '')
          .replace('${subtitle}', data.subtitle || '');
        
        // Replace form field values
        const form = data.form || {};
        const fields = form.fields || {};
        
        processedHtml = processedHtml
          .replace('Send Me a Message', form.heading || 'Send Me a Message')
          .replace('Your full name', fields.name?.placeholder || 'Your full name')
          .replace('you@example.com', fields.email?.placeholder || 'you@example.com')
          .replace('Subject of your message', fields.subject?.placeholder || 'Subject of your message')
          .replace('Write your message here', fields.message?.placeholder || 'Write your message here')
          .replace('Send Message', form.submitText || 'Send Message');
        
        this.innerHTML = processedHtml;
        
        // Populate contact links
        this.populateContactLinks(data.contacts || []);
        
        // Initialize form handling after DOM is populated
        this.initializeForm(data);
        
      } catch (error) {
        console.error('Error loading or processing contact data:', error);
        let processedHtml = html
          .replace('${title}', 'Let\'s Connect')
          .replace('${subtitle}', 'Get in touch with me!');
        
        this.innerHTML = processedHtml;
        this.populateContactLinks([]);
        this.initializeForm({});
        
      } finally {
        window.dynamicComponentTracker.markLoaded();
      }
    }
  }
  
  populateContactLinks(contacts) {
    const linksContainer = this.querySelector('#contact-links');
    if (!linksContainer) return;
    
    linksContainer.innerHTML = contacts.map(contact => `
      <a href="${contact.link}" target="_blank" rel="noopener noreferrer" class="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-robot-blue/50 transition-all group">
        <i class="${contact.icon} text-3xl text-robot-blue mb-4 group-hover:scale-110 transition-transform"></i>
        <h3 class="font-semibold mb-2">${contact.label}</h3>
        <p class="text-gray-400 text-sm">${contact.text}</p>
      </a>
    `).join('');
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
      successMsg.textContent = text;
      successMsg.classList.remove('hidden', 'text-green-400', 'text-red-400');
      successMsg.classList.add(ok ? 'text-green-400' : 'text-red-400');
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
      submitBtn.textContent = 'Sending…';
      successMsg.classList.add('hidden');

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: fd,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          setStatus("Message sent — I'll get back to you soon.", true);
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = (data.errors && data.errors.map(x => x.message).join(', ')) ||
                      'Could not send. Please email me directly.';
          setStatus(msg, false);
        }
      } catch (err) {
        console.error('Contact form error:', err);
        setStatus('Network error. Please email me directly.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
}

customElements.define('contact-section', ContactSection);
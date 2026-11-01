(() => {
  // Theme toggle helper
  window.toggleTheme = () => {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
  };

  // Button loading feedback during HTMX requests (the element itself or a form's submit button)
  const toggleLoading = (elt, loading) => {
    const btn = elt?.matches?.('button') ? elt : elt?.matches?.('form') && elt.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = loading;
      btn.querySelector('.spinner-border')?.classList.toggle('d-none', !loading);
      btn.querySelector('.bi')?.classList.toggle('d-none', loading);
    }
  };

  // Toast notification handler
  document.addEventListener('showToast', (evt) => {
    const toastEl = document.getElementById('app-toast');
    if (!toastEl || !window.bootstrap) return;
    const msg = evt.detail?.value || evt.detail;
    if (msg) document.getElementById('toast-message').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }).show();
  });

  // Modal lifecycle: focus + default datetime on open, reset form on close
  document.addEventListener('show.bs.modal', (evt) => {
    const timeInput = evt.target.querySelector('input[type="datetime-local"]');
    if (timeInput) {
      const now = new Date();
      timeInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
  });

  document.addEventListener('shown.bs.modal', (evt) => {
    evt.target.querySelector('[autofocus], input:not([type="hidden"]), textarea, select')?.focus();
  });

  document.addEventListener('hidden.bs.modal', (evt) => evt.target.querySelector('form')?.reset());

  // Custom confirmation modal for hx-confirm
  document.addEventListener('htmx:confirm', (evt) => {
    if (!evt.detail.question) return;
    const modalEl = document.getElementById('confirmModal');
    if (!modalEl || !window.bootstrap) return;
    evt.preventDefault();
    document.getElementById('confirmModalQuestion').textContent = evt.detail.question;
    document.getElementById('confirmModalBtn').onclick = () => {
      bootstrap.Modal.getInstance(modalEl)?.hide();
      evt.detail.issueRequest(true);
    };
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });

  // HTMX request lifecycle: spinner feedback, and close the hosting modal on success
  document.addEventListener('htmx:beforeRequest', (evt) => toggleLoading(evt.detail.elt, true));
  document.addEventListener('htmx:afterRequest', (evt) => {
    toggleLoading(evt.detail.elt, false);
    const modalEl = evt.detail.successful && evt.detail.elt.closest?.('.modal');
    if (modalEl && window.bootstrap) bootstrap.Modal.getInstance(modalEl)?.hide();
  });

  // HX-Location replaces <body> while a modal may still be fading out: drop leftovers
  document.addEventListener('htmx:beforeSwap', (evt) => {
    if (evt.detail.target !== document.body) return;
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  });

  // Search input icon toggle and clear button
  document.addEventListener('input', (evt) => {
    if (evt.target?.id === 'search-input') {
      const hasVal = Boolean(evt.target.value);
      document.getElementById('search-icon-clear')?.classList.toggle('d-none', !hasVal);
      document.getElementById('search-icon-search')?.classList.toggle('d-none', hasVal);
    }
  });

  document.addEventListener('click', (evt) => {
    const clearBtn = evt.target?.closest?.('#search-clear-btn');
    if (!clearBtn) return;
    const input = document.getElementById('search-input');
    if (input) {
      if (input.value) {
        input.value = '';
        document.getElementById('search-icon-search')?.classList.remove('d-none');
        document.getElementById('search-icon-clear')?.classList.add('d-none');
        input.dispatchEvent(new Event('search'));
      }
      input.focus();
    }
  });
})();

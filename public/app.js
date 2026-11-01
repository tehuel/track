(() => {
  // Theme toggle helper
  window.toggleTheme = () => {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
  };

  // Button loading feedback during HTMX requests
  const toggleLoading = (elt, loading) => {
    const btn = elt?.matches?.('button')
      ? elt
      : elt?.querySelector?.('button[type="submit"]') || elt?.querySelector?.('button');
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

  // Close active or targeted modal and reset its form and buttons
  document.addEventListener('closeModal', (evt) => {
    if (!window.bootstrap) return;
    const targetId = evt.detail?.value || evt.detail?.id || evt.detail;
    const modalEl =
      (typeof targetId === 'string' && document.getElementById(targetId)) ||
      document.querySelector('.modal.show');
    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
      modalEl.querySelector('form')?.reset();
      toggleLoading(modalEl, false);
    }
  });

  // Autofocus input when modal is shown
  document.addEventListener('shown.bs.modal', (evt) => {
    const target = evt.target;
    const input =
      target?.querySelector?.('[autofocus]') ||
      target?.querySelector?.('input:not([type="hidden"]):not([disabled]), textarea, select');
    input?.focus();
  });

  // Reset form and button loading state when any modal is hidden/dismissed
  document.addEventListener('hidden.bs.modal', (evt) => {
    const modalEl = evt.target;
    if (!modalEl) return;
    modalEl.querySelector('form')?.reset();
    toggleLoading(modalEl, false);
  });

  // Initialize datetime-local inputs to client local time when opening modal
  document.addEventListener('show.bs.modal', (evt) => {
    toggleLoading(evt.target, false);
    const timeInput = evt.target?.querySelector?.('input[type="datetime-local"]');
    if (timeInput) {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      timeInput.value = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    }
  });

  // Custom confirmation modal for hx-confirm
  document.addEventListener('htmx:confirm', (evt) => {
    if (!evt.detail.question) return;
    const modalEl = document.getElementById('confirmModal');
    if (!modalEl || !window.bootstrap) return;
    evt.preventDefault();
    const questionEl = document.getElementById('confirmModalQuestion');
    if (questionEl) questionEl.textContent = evt.detail.question;
    const confirmBtn = document.getElementById('confirmModalBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        bootstrap.Modal.getInstance(modalEl)?.hide();
        evt.detail.issueRequest(true);
      };
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });

  // Clean up any open modal and backdrops before HTMX swaps page content
  document.addEventListener('htmx:beforeSwap', () => {
    if (!window.bootstrap) return;
    document.querySelectorAll('.modal.show').forEach((modalEl) => {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    });
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
  });

  // Loading spinner feedback during HTMX requests
  document.addEventListener('htmx:beforeRequest', (evt) => toggleLoading(evt.detail.elt, true));
  document.addEventListener('htmx:afterRequest', (evt) => toggleLoading(evt.detail.elt, false));

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

(() => {
  // Theme toggle
  document.addEventListener('click', (evt) => {
    if (!evt.target?.closest?.('#theme-toggle')) return;
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
  });

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

  // Render UTC <time datetime="..."> elements in the user's local timezone
  document.addEventListener('htmx:load', (evt) => {
    evt.detail.elt.querySelectorAll?.('time[datetime]').forEach((el) => {
      el.textContent = new Date(el.dateTime).toLocaleString('es-AR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });
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

  // Convert local datetime-local input value to UTC ISO string before sending to server
  document.addEventListener('htmx:configRequest', (evt) => {
    const time = evt.detail.parameters.timestamp;
    if (time) evt.detail.parameters.timestamp = new Date(time).toISOString();
  });

  document.addEventListener('shown.bs.modal', (evt) => {
    evt.target.dataset.modalShown = '1';
    if (evt.target.dataset.pendingHide) {
      delete evt.target.dataset.pendingHide;
      window.bootstrap?.Modal.getInstance(evt.target)?.hide();
    }
    evt.target.querySelector('[autofocus], input:not([type="hidden"]), textarea, select')?.focus();
  });

  document.addEventListener('hidden.bs.modal', (evt) => {
    evt.target.querySelector('form')?.reset();
    const confirmBtn = evt.target.querySelector('#confirmModalBtn');
    if (confirmBtn) toggleLoading(confirmBtn, false);
    delete evt.target.dataset.confirmPending;
    delete evt.target.dataset.pendingHide;
    delete evt.target.dataset.modalShown;
  });

  // Custom confirmation modal for hx-confirm
  document.addEventListener('htmx:confirm', (evt) => {
    if (!evt.detail.question) return;
    const modalEl = document.getElementById('confirmModal');
    if (!modalEl || !window.bootstrap) return;
    evt.preventDefault();
    document.getElementById('confirmModalQuestion').textContent = evt.detail.question;
    delete modalEl.dataset.confirmPending;
    delete modalEl.dataset.pendingHide;
    const confirmBtn = document.getElementById('confirmModalBtn');
    if (confirmBtn) {
      toggleLoading(confirmBtn, false);
      // The dialog may still be fading in when its request returns and Bootstrap
      // ignores hide() during the show transition, so defer the close to
      // 'shown.bs.modal' if needed; the pending flag prevents duplicate requests.
      confirmBtn.onclick = () => {
        if (modalEl.dataset.confirmPending) return;
        modalEl.dataset.confirmPending = '1';
        toggleLoading(confirmBtn, true);
        evt.detail.elt.addEventListener(
          'htmx:afterRequest',
          (e) => {
            delete modalEl.dataset.confirmPending;
            toggleLoading(confirmBtn, false);
            if (e.detail.successful && window.bootstrap) {
              if (modalEl.dataset.modalShown) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
              else modalEl.dataset.pendingHide = '1';
            }
          },
          { once: true }
        );
        evt.detail.issueRequest(true);
      };
      // Focus the confirm button once shown: Enter accepts (Escape already cancels)
      modalEl.addEventListener('shown.bs.modal', () => confirmBtn.focus(), { once: true });
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });

  // Enter accepts the visible confirmation dialog (Escape already cancels it);
  // Focused cancel/close controls keep their native Enter activation.
  // Escape pressed during the dialog's opening fade is deferred the same way.
  document.addEventListener(
    'keydown',
    (evt) => {
      const modalEl = document.getElementById('confirmModal');
      if (!modalEl?.classList.contains('show') || !window.bootstrap) return;

      if (evt.key === 'Enter') {
        if (modalEl.dataset.confirmPending) return;
        if (document.activeElement?.matches?.('[data-bs-dismiss="modal"]')) return;
        evt.preventDefault();
        document.getElementById('confirmModalBtn')?.click();
        return;
      }

      if (evt.key === 'Escape' && !modalEl.dataset.modalShown) {
        // Bootstrap ignores hide() while transitioning; defer the cancel until
        // the fade completes. stopPropagation keeps Bootstrap's own handler out.
        evt.stopPropagation();
        modalEl.dataset.pendingHide = '1';
      }
    },
    true
  );

  // HTMX request lifecycle: button feedback, and close the hosting modal on success
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

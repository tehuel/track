import type { Child } from 'hono/jsx'
import { Icon } from './icons'

interface LayoutProps {
  title?: string
  children: Child
}

export function Layout({ title = 'track', children }: LayoutProps) {
  return (
    <html lang="es" data-bs-theme="auto">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        {/* Bootstrap 5 CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />

        {/* HTMX */}
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.4/dist/htmx.min.js"></script>

        {/* Bootstrap Theme Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (() => {
              const getTheme = () =>
                localStorage.getItem('theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              const applyTheme = (theme) => {
                document.documentElement.setAttribute('data-bs-theme', theme);
                const sun = document.getElementById('theme-icon-sun');
                const moon = document.getElementById('theme-icon-moon');
                if (sun && moon) {
                  sun.classList.toggle('d-none', theme !== 'dark');
                  moon.classList.toggle('d-none', theme === 'dark');
                }
              };
              applyTheme(getTheme());
              window.addEventListener('DOMContentLoaded', () => applyTheme(getTheme()));
              window.toggleTheme = () => {
                const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
                localStorage.setItem('theme', next);
                applyTheme(next);
              };
            })();
          `,
          }}
        />
      </head>

      <body class="bg-body-secondary min-vh-100 d-flex flex-column">
        {/* Navigation Bar */}
        <nav class="navbar navbar-expand bg-body border-0">
          <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-semibold" href="/">
              <Icon name="activity" class="text-primary fs-4" />
              <span>track</span>
            </a>

            <div class="d-flex align-items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                class="btn btn-sm border-0 text-body-secondary d-flex align-items-center justify-content-center"
                onclick="window.toggleTheme()"
                title="Cambiar tema"
                aria-label="Cambiar tema"
              >
                <span id="theme-icon-sun" class="d-none">
                  <Icon name="sun-fill" />
                </span>
                <span id="theme-icon-moon">
                  <Icon name="moon-stars-fill" />
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main class="container py-4 flex-grow-1">{children}</main>

        {/* Toast Notification Container */}
        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
          <div
            id="app-toast"
            class="toast align-items-center text-bg-success border-0 shadow"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div class="d-flex">
              <div class="toast-body d-flex align-items-center gap-2">
                <Icon name="check-circle-fill" />
                <span id="toast-message">Entrada registrada</span>
              </div>
              <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Cerrar"
              ></button>
            </div>
          </div>
        </div>

        {/* Bootstrap 5 JS Bundle */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

        {/* App UI Helpers: Toast notifications & Loading states */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (() => {
              document.addEventListener('showToast', (evt) => {
                const toastEl = document.getElementById('app-toast');
                if (!toastEl || !window.bootstrap) return;
                const msg = evt.detail?.value || evt.detail;
                if (msg) document.getElementById('toast-message').textContent = msg;
                bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }).show();
              });

              document.addEventListener('closeModal', () => {
                const modalEl = document.getElementById('logModal');
                if (!modalEl || !window.bootstrap) return;
                bootstrap.Modal.getInstance(modalEl)?.hide();
                modalEl.querySelector('form')?.reset();
              });

              // Loading indicator & disable button during HTMX request
              document.addEventListener('htmx:beforeRequest', (evt) => {
                const elt = evt.detail.elt;
                const btn = elt.matches('button')
                  ? elt
                  : elt.querySelector('button[type="submit"]') || elt.querySelector('button');
                if (btn) {
                  btn.disabled = true;
                  const spinner = btn.querySelector('.spinner-border');
                  if (spinner) spinner.classList.remove('d-none');
                  const icon = btn.querySelector('.bi');
                  if (icon) icon.classList.add('d-none');
                }
              });

              document.addEventListener('htmx:afterRequest', (evt) => {
                if (!evt.detail.successful) {
                  const elt = evt.detail.elt;
                  const btn = elt.matches('button')
                    ? elt
                    : elt.querySelector('button[type="submit"]') || elt.querySelector('button');
                  if (btn) {
                    btn.disabled = false;
                    const spinner = btn.querySelector('.spinner-border');
                    if (spinner) spinner.classList.add('d-none');
                    const icon = btn.querySelector('.bi');
                    if (icon) icon.classList.remove('d-none');
                  }
                }
              });
            })();
          `,
          }}
        />
      </body>
    </html>
  )
}

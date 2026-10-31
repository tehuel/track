import type { Child } from 'hono/jsx'
import type { Locale } from '../i18n'
import { t } from '../i18n'

interface LayoutProps {
  title?: string
  locale: Locale
  children: Child
}

export function Layout({ title = 'track', locale, children }: LayoutProps) {
  return (
    <html lang={locale} data-bs-theme="auto">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        {/* Bootstrap 5 CSS & Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />

        {/* HTMX */}
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.4/dist/htmx.min.js"></script>

        {/* Bootstrap Theme Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (() => {
              const getStoredTheme = () => localStorage.getItem('theme');
              const setStoredTheme = theme => localStorage.setItem('theme', theme);
              const getPreferredTheme = () => {
                const storedTheme = getStoredTheme();
                if (storedTheme) return storedTheme;
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              };
              const setTheme = theme => {
                document.documentElement.setAttribute('data-bs-theme', theme);
              };
              setTheme(getPreferredTheme());
              window.toggleTheme = () => {
                const current = document.documentElement.getAttribute('data-bs-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                setStoredTheme(next);
                setTheme(next);
                const icon = document.getElementById('theme-icon');
                if (icon) {
                  icon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
                }
              };
            })();
          `,
          }}
        />
      </head>

      <body class="bg-body-secondary min-vh-100 d-flex flex-column">
        {/* Navigation Bar */}
        <nav class="navbar navbar-expand bg-body border-bottom shadow-sm">
          <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-semibold" href="/">
              <i class="bi bi-activity text-primary fs-4"></i>
              <span>{t('nav.brand', locale)}</span>
            </a>

            <div class="d-flex align-items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                onclick="window.toggleTheme()"
                title="Toggle Theme"
                aria-label="Toggle theme"
              >
                <i id="theme-icon" class="bi bi-moon-stars-fill"></i>
              </button>

              {/* Language Switcher */}
              <div
                class="d-flex align-items-center gap-1 border rounded px-2 py-1 small bg-body shadow-sm"
                role="group"
                aria-label="Language selector"
              >
                <i class="bi bi-translate text-body-secondary me-1"></i>
                <a
                  href="?lang=en"
                  class={`btn btn-sm p-0 border-0 bg-transparent ${
                    locale === 'en'
                      ? 'fw-bold text-primary text-decoration-underline'
                      : 'text-body-secondary text-decoration-none'
                  }`}
                  aria-label="English"
                >
                  EN
                </a>
                <span class="text-body-tertiary">|</span>
                <a
                  href="?lang=es"
                  class={`btn btn-sm p-0 border-0 bg-transparent ${
                    locale === 'es'
                      ? 'fw-bold text-primary text-decoration-underline'
                      : 'text-body-secondary text-decoration-none'
                  }`}
                  aria-label="Español"
                >
                  ES
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main class="container py-4 flex-grow-1">{children}</main>

        {/* Bootstrap 5 JS Bundle */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  )
}

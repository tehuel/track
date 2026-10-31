import type { Child } from 'hono/jsx'

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
              const getTheme = () =>
                localStorage.getItem('theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              const applyTheme = (theme) => {
                document.documentElement.setAttribute('data-bs-theme', theme);
                const icon = document.getElementById('theme-icon');
                if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
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
              <i class="bi bi-activity text-primary fs-4"></i>
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
                <i id="theme-icon" class="bi bi-moon-stars-fill"></i>
              </button>
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

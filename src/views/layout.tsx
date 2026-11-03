import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import {
  APP_JS_PATH,
  BOOTSTRAP_CSS_PATH,
  BOOTSTRAP_JS_PATH,
  HTMX_JS_PATH,
  THEME_JS_PATH,
} from '../assets'
import { Icon } from './icons'
import { Modal, ModalFooter } from './modal'

interface LayoutProps {
  title?: string
  children: Child
}

export function Layout({ title = 'track', children }: LayoutProps) {
  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang="es" data-bs-theme="auto">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* Runs before stylesheets to prevent FOUC / forced reflow. */}
        <script src={THEME_JS_PATH}></script>

        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        {/* Bootstrap 5 CSS */}
        <link
          rel="stylesheet"
          href={BOOTSTRAP_CSS_PATH}
        />

        {/* HTMX, Bootstrap 5 & App UI JS (deferred to download in parallel and execute without blocking parser) */}
        <script src={HTMX_JS_PATH} defer></script>
        <script src={BOOTSTRAP_JS_PATH} defer></script>
        <script src={APP_JS_PATH} defer></script>
      </head>

      <body
        class="bg-body-secondary min-vh-100 d-flex flex-column"
        hx-boost="true"
      >
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
                <Icon name="circle-half" />
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main class="container py-4 flex-grow-1">{children}</main>

        {/* Global Confirmation Modal */}
        <Modal id="confirmModal" title="Confirmar eliminación">
          <div class="modal-body p-4">
            <p id="confirmModalQuestion" class="mb-0 text-body"></p>
          </div>
          <ModalFooter>
            <button type="button" class="btn btn-danger" id="confirmModalBtn">
              Eliminar
            </button>
          </ModalFooter>
        </Modal>

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
                <Icon name="check-lg" />
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
      </body>
    </html>
  </>
  )
}

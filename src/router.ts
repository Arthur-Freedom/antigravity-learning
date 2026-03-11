// ── Hash-based SPA Router ───────────────────────────────────────────────
// Simple client-side router that swaps #page-content based on URL hash.
// Each route provides a render() function for HTML and an optional init()
// function to bind event listeners after the content is inserted.

export interface RouteHandler {
  render: () => string;
  init?: () => void;
}

type RouteMap = Record<string, RouteHandler>;

let routes: RouteMap = {};
let contentEl: HTMLElement | null = null;

/** Register one or more routes */
export function registerRoutes(routeMap: RouteMap): void {
  routes = { ...routes, ...routeMap };
}

/** Programmatically navigate to a path */
export function navigate(path: string): void {
  window.location.hash = '#' + path;
}

/** Get current hash path (without #) */
export function getCurrentPath(): string {
  return window.location.hash.slice(1) || '/';
}

/** Start listening for hash changes and render the initial route */
export function initRouter(containerSelector: string): void {
  contentEl = document.querySelector(containerSelector);
  if (!contentEl) {
    console.error('[router] Container not found:', containerSelector);
    return;
  }

  window.addEventListener('hashchange', () => renderCurrentRoute());
  renderCurrentRoute();
}

/** Force a re-render of the current route */
export function refreshRoute(): void {
  renderCurrentRoute();
}

function renderCurrentRoute(): void {
  if (!contentEl) return;

  const path = getCurrentPath();
  const handler = routes[path] || routes['/'];

  if (!handler) {
    contentEl.innerHTML = `
      <section class="not-found-page">
        <h2>Page not found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#/" class="btn">Back to Home</a>
      </section>`;
    return;
  }

  // Fade-out transition
  contentEl.classList.add('page-exit');

  setTimeout(() => {
    contentEl!.innerHTML = handler.render();
    contentEl!.classList.remove('page-exit');
    contentEl!.classList.add('page-enter');

    if (handler.init) handler.init();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Kick off scroll-reveal animations
    initScrollReveal();

    setTimeout(() => contentEl!.classList.remove('page-enter'), 400);
  }, 200);
}

/** Animate elements that have .reveal-on-scroll when they enter the viewport */
function initScrollReveal(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
}

// ── History-based SPA Router ────────────────────────────────────────────
// Clean-URL client-side router using the HTML5 History API (pushState).
// Each route provides a render() function for HTML and an optional init()
// function to bind event listeners after the content is inserted.

export interface RouteHandler {
  render: () => string;
  init?: () => void;
  destroy?: () => void;
}

type RouteMap = Record<string, RouteHandler>;

let routes: RouteMap = {};
let contentEl: HTMLElement | null = null;
let currentPath: string | null = null;

/** Register one or more routes */
export function registerRoutes(routeMap: RouteMap): void {
  routes = { ...routes, ...routeMap };
}

/** Programmatically navigate to a path (clean URL) */
export function navigate(path: string): void {
  if (path === getCurrentPath()) return;
  history.pushState(null, '', path);
  renderCurrentRoute();
}

/** Get current pathname */
export function getCurrentPath(): string {
  return window.location.pathname || '/';
}

/** Start listening for popstate and render the initial route */
export function initRouter(containerSelector: string): void {
  contentEl = document.querySelector(containerSelector);
  if (!contentEl) {
    console.error('[router] Container not found:', containerSelector);
    return;
  }

  // Handle browser back/forward
  window.addEventListener('popstate', () => renderCurrentRoute());

  // Intercept all internal <a> clicks to use pushState
  document.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Skip external links, anchors, mailto, etc.
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (anchor.getAttribute('target') === '_blank') return;
    if (anchor.hasAttribute('download')) return;

    // Skip pure anchor links (#modules, etc.) — let them scroll naturally
    if (href.startsWith('#') && !href.startsWith('#/')) return;

    // Legacy hash links: convert #/ to / (just in case any slip through)
    let cleanPath = href;
    if (cleanPath.startsWith('#/')) {
      cleanPath = cleanPath.slice(1); // remove the #
    }

    // Only handle local paths
    if (cleanPath.startsWith('/')) {
      e.preventDefault();
      navigate(cleanPath);
    }
  });

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
        <a href="/" class="btn">Back to Home</a>
      </section>`;
    return;
  }

  // Destroy the previous route's resources (real-time listeners, etc.)
  if (currentPath) {
    const prevHandler = routes[currentPath] || routes['/'];
    if (prevHandler?.destroy) {
      prevHandler.destroy();
      console.info('[router] Destroyed resources for route:', currentPath);
    }
  }
  currentPath = path;

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

    // Dispatch a custom event so other parts of the app can react
    window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));

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

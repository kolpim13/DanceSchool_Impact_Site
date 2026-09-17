/** Stub all future routes and external services without leaving the static page. */
export function bindNavigationStubs(root: Document | Element, announce: (message: string) => void): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-stub]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      announce('Ta funkcja będzie dostępna po podłączeniu strony.');
      root.dispatchEvent(new CustomEvent('impact:navigation-stub', {
        detail: { destination: link.dataset.stub }
      }));
    });
  });
}

export function isFullyInViewport(element: HTMLElement | null) {
  let fullyInViewport;
  if (element) {
    const rect = element?.getBoundingClientRect();
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    fullyInViewport = rect &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth;
  }
  return fullyInViewport;
}

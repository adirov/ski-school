// Native scrolling stays in control; only transforms and opacity are animated.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let cleanup = () => {};
function setup() {
  cleanup();
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const targets = [...document.querySelectorAll('.section-heading > *, .program, .split-copy > *, .preparation > h2, .preparation > .eyebrow, .three article, .cta > *, .page-hero > :not(.page-photo), .detail-layout > div:first-child, .detail, .faq > *, .contact > *, .coach, .lesson-step, .lesson-copy > h2, .schedule-row, .location-copy > *, .finder-layout, .lesson-summary > *, .booking-info > *, footer > *')];
  const animations = new Set();
  targets.forEach(element => {
    element.classList.add('reveal-waiting');
    if (element.matches('.program, .three article')) {
      element.dataset.revealDelay = String([...element.parentElement.children].indexOf(element) % 4 * 85);
    }
  });
  function show(element, immediate = false) {
    element.classList.remove('reveal-waiting');
    observer.unobserve(element);
    if (immediate) return;
    const mobile = matchMedia('(max-width: 800px)').matches;
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${mobile ? 18 : 34}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: mobile ? 600 : 850, delay: Number(element.dataset.revealDelay || 0), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); });
  }, { threshold: .06, rootMargin: '0px 0px -25px 0px' });
  targets.forEach(element => observer.observe(element));
  function focus(event) {
    const parent = event.target.closest('.reveal-waiting');
    if (parent) show(parent, true);
  }
  document.addEventListener('focusin', focus);
  const photos = [...document.querySelectorAll('.hero-image, .split-image img, .page-photo img')];
  photos.forEach(image => image.classList.add('scroll-photo'));
  const active = new Set();
  const photoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const image = entry.target.querySelector('img');
      if (entry.isIntersecting) active.add(image); else active.delete(image);
    });
    schedule();
  });
  photos.forEach(image => photoObserver.observe(image.parentElement));
  let frame = 0;
  function update() {
    frame = 0;
    active.forEach(image => {
      const rect = image.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight / 2 + rect.height / 2)));
      image.style.setProperty('--photo-shift', `${progress * (innerWidth < 800 ? 12 : 30)}px`);
    });
    const hero = document.querySelector('.hero');
    if (hero) {
      const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
      hero.style.setProperty('--hero-shift', `${progress * (innerWidth < 800 ? 18 : 55)}px`);
    }
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  schedule();
  cleanup = () => {
    observer.disconnect(); photoObserver.disconnect();
    cancelAnimationFrame(frame);
    animations.forEach(animation => animation.cancel());
    targets.forEach(element => { element.classList.remove('reveal-waiting'); delete element.dataset.revealDelay; });
    photos.forEach(image => { image.classList.remove('scroll-photo'); image.style.removeProperty('--photo-shift'); });
    document.querySelector('.hero')?.style.removeProperty('--hero-shift');
    document.removeEventListener('focusin', focus);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', schedule);
  };
}
setup();
preference.addEventListener('change', setup);

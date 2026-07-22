const revealItems = document.querySelectorAll('[data-reveal]');
const careerItems = document.querySelectorAll('[data-career]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      careerItems.forEach((item) => item.classList.toggle('is-active', item === entry.target));
    }
  });
}, { rootMargin: '-38% 0px -48% 0px', threshold: 0 });
careerItems.forEach((item) => activeObserver.observe(item));

document.querySelector('[data-year]').textContent = new Date().getFullYear();

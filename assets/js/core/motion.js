/* =========================================================================
   LA GUITOUNE — Motion runtime (Vokum)
   Vanilla, zéro dépendance.
   ========================================================================= */

export const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const inViewport = (el) => {
  const r = el.getBoundingClientRect();
  return r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0;
};

/* Attribue un --module-delay croissant aux seuls blocs visibles au chargement.
   Les blocs hors écran passent à "false" et attendront l'IntersectionObserver. */
export const moduleDelays = (increment = 350, base = 550, target = document.body) => {
  const els = [...target.querySelectorAll('[data-module-delay]')];
  const visibility = els.map(inViewport);
  let delay = base;
  els.forEach((el, i) => {
    const visible = visibility[i];
    el.setAttribute('data-module-delay', visible);
    if (!visible) return;
    el.style.setProperty('--module-delay', `${delay}ms`);
    delay += el.dataset.moduleDelayIncrement
      ? parseInt(el.dataset.moduleDelayIncrement, 10)
      : increment;
  });
};

/* Masque par mot — le mot est le masque, son contenu monte depuis le bas. */
export const splitWords = (el) => {
  if (el.dataset.splitDone) return;
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  const words = text.split(' ');
  el.setAttribute('aria-label', text);
  el.innerHTML = words.map((word, i) =>
    `<span class="word" aria-hidden="true" style="--word-index:${i}">` +
    `<span class="word__inner">${word}</span></span>`
  ).join(' ');
  el.style.setProperty('--word-total', words.length);
  el.dataset.splitDone = 'true';
};

let observer = null;

export const observe = (root = document) => {
  if (motionReduced) return;
  observer ||= new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  root.querySelectorAll('[data-reveal], [data-split]').forEach(el => observer.observe(el));
};

export const boot = ({ base = 550, step = 350, loader = '[data-site-loader]' } = {}) => {
  document.querySelectorAll('[data-split]').forEach(splitWords);

  const onReady = () => {
    moduleDelays(step, base);
    if (!motionReduced) document.documentElement.classList.add('--js-inview-enabled');

    document.querySelectorAll(
      '[data-module-delay="true"][data-reveal],' +
      '[data-module-delay="true"] [data-reveal],' +
      '[data-module-delay="true"] [data-split]'
    ).forEach(el => el.classList.add('is-inview'));

    observe();

    const el = document.querySelector(loader);
    if (!el) return;
    el.classList.add('--js-ready');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    /* filet de sécurité si transitionend ne fire pas (reduced motion) */
    setTimeout(() => el.remove(), 1600);
  };

  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady, { once: true });
};

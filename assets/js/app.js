import { boot, motionReduced } from './core/motion.js';

/* ---- séquence d'ouverture ------------------------------------------------
   Le loader est la toile de l'auvent : il se lève (translateY) avec son bord
   festonné, puis la cascade du hero prend le relais. */
boot({ base: 900, step: 320, loader: '[data-site-loader]' });

/* ---- header : passe en fond plein après le hero ------------------------- */
const header = document.querySelector('.site-header');
if (header) {
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ---- ancre douce (désactivée en reduced motion via CSS) ----------------- */
if (motionReduced) document.documentElement.style.scrollBehavior = 'auto';

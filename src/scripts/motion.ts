import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('.motion-toggle');
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let override: boolean | null = null;
try {
  const stored = localStorage.getItem('saloni-reduced-motion');
  if (stored === 'true' || stored === 'false') override = stored === 'true';
} catch {
  /* Motion preferences are optional when browser storage is unavailable. */
}
let media: gsap.MatchMedia | undefined;
let galleryCleanup: (() => void) | undefined;
let typingCleanup: (() => void) | undefined;
let firstRun = true;

function startRoleTyping(delay: number) {
  const text = document.getElementById('typed-role');
  const hero = document.querySelector('.hero');
  if (!text || !hero) return;
  const roles = ['Full-stack Engineer', 'AI Engineer', 'Founding Engineer'];
  let role = 0;
  let count = 0;
  let deleting = false;
  let visible = false;
  let timer: ReturnType<typeof setTimeout>;
  let started = false;
  text.textContent = '';
  text.parentElement?.classList.add('is-typing');

  function tick() {
    if (!visible || document.hidden || !text) return;
    count += deleting ? -1 : 1;
    text.textContent = roles[role].slice(0, count);
    let wait = deleting ? 36 : 70;
    if (count === roles[role].length) {
      deleting = true;
      wait = 1800;
    } else if (count === 0) {
      deleting = false;
      role = (role + 1) % roles.length;
      wait = 300;
    }
    timer = setTimeout(tick, wait);
  }
  const resume = () => {
    clearTimeout(timer);
    if (visible && !document.hidden) {
      timer = setTimeout(tick, started ? 150 : delay);
      started = true;
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  observer.observe(hero);
  document.addEventListener('visibilitychange', resume);
  return () => {
    clearTimeout(timer);
    observer.disconnect();
    document.removeEventListener('visibilitychange', resume);
    text.textContent = 'Full-stack & AI Engineer';
    text.parentElement?.classList.remove('is-typing');
  };
}

function configureMotion() {
  galleryCleanup?.();
  typingCleanup?.();
  media?.revert();
  const reduced = override ?? preference.matches;
  root.classList.toggle('reduce-motion', reduced);
  toggle?.setAttribute('aria-pressed', String(reduced));
  if (toggle) toggle.textContent = reduced ? 'Motion reduced' : 'Reduce motion';
  if (reduced) {
    firstRun = false;
    return;
  }
  typingCleanup = startRoleTyping(firstRun ? 1400 : 150);

  media = gsap.matchMedia();
  media.add('all', () => {
    if (firstRun) {
      gsap.from('.hero-line', {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.65,
        stagger: 0.55,
        ease: 'steps(7)',
        clearProps: 'clipPath',
      });
      gsap.from('.hero-art', {
        y: 35,
        opacity: 0,
        duration: 1.25,
        delay: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      });
    }
    if (document.querySelector('.hero-art')) {
      gsap.to('.sheet-experience', {
        y: -35,
        rotate: -19,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('.sheet-intelligence', {
        y: -15,
        rotate: 4,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('.art-seal', {
        rotate: -24,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }
    gsap.utils.toArray<HTMLElement>('.manifesto-text>span').forEach((span) => {
      gsap.from(span, {
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: span, start: 'top 85%', end: 'bottom 58%', scrub: true },
      });
    });
    gsap.utils
      .toArray<HTMLElement>(
        '.practice-heading, .about-grid, .skills-grid, .experience-row, .side-projects, .case-section',
      )
      .forEach((element) => {
        gsap.from(element, {
          y: 25,
          opacity: 0.35,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true },
          clearProps: 'opacity,transform',
        });
      });
  });

  media.add('(min-width: 1200px) and (min-height: 760px)', () => {
    const section = document.querySelector<HTMLElement>('.work-section');
    const stage = document.querySelector<HTMLElement>('.work-stage');
    const track = document.querySelector<HTMLElement>('.project-track');
    if (!section || !stage || !track) return;
    section.classList.add('is-horizontal');
    const panels = gsap.utils.toArray<HTMLElement>('.project-panel');
    const count = document.querySelector('.work-counter');
    const bar = document.querySelector<HTMLElement>('.work-progress span');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const index = Math.round(self.progress * (panels.length - 1)) + 1;
          if (count)
            count.textContent = `${String(index).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
          if (bar)
            bar.style.transform = `scaleX(${(1 + self.progress * (panels.length - 1)) / panels.length})`;
        },
      },
    });
    // Tab navigation must reveal the focused card, including cards outside the pinned viewport.
    const revealFocusedCard = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const panel = target.closest<HTMLElement>('.project-panel');
      const trigger = tween.scrollTrigger;
      if (!panel || !trigger) return;
      const index = panels.indexOf(panel);
      const proportion = Math.min(1, index / (panels.length - 1));
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * proportion,
        behavior: 'instant',
      });
      tween.progress(proportion);
    };
    track.addEventListener('focusin', revealFocusedCard);
    const cleanup = () => {
      track.removeEventListener('focusin', revealFocusedCard);
      section.classList.remove('is-horizontal');
      if (count) count.textContent = `01 / ${String(panels.length).padStart(2, '0')}`;
      if (bar) bar.style.removeProperty('transform');
    };
    galleryCleanup = cleanup;
    return cleanup;
  });
  firstRun = false;
  ScrollTrigger.refresh();
}
configureMotion();
preference.addEventListener('change', () => {
  if (override === null) configureMotion();
});
toggle?.addEventListener('click', () => {
  const anchor = toggle.getBoundingClientRect().top;
  override = !root.classList.contains('reduce-motion');
  try {
    localStorage.setItem('saloni-reduced-motion', String(override));
  } catch {
    /* The control still works for this visit. */
  }
  configureMotion();
  // Keep the control in view when the pinned gallery changes document height.
  window.scrollBy({ top: toggle.getBoundingClientRect().top - anchor, behavior: 'instant' });
});
document.fonts.ready.then(() => ScrollTrigger.refresh());
document
  .querySelectorAll('details')
  .forEach((detail) => detail.addEventListener('toggle', () => ScrollTrigger.refresh()));
const progress = document.querySelector<HTMLElement>('.reading-progress');
let framePending = false;
function updateProgress() {
  const available = root.scrollHeight - window.innerHeight;
  if (progress)
    progress.style.transform = `scaleX(${available > 0 ? window.scrollY / available : 0})`;
  framePending = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true },
);
window.addEventListener('resize', updateProgress);
updateProgress();
let toastTimer: ReturnType<typeof setTimeout>;
document
  .querySelector<HTMLButtonElement>('.copy-email')
  ?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const email = button.dataset.email;
    const status = document.getElementById('site-status');
    if (!email || !status) return;
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Email copied. Let’s talk.';
    } catch {
      status.textContent = 'Please select and copy the email address above.';
    }
    status.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => status.classList.remove('visible'), 3500);
  });

/* ═══════════════════════════════════════════
   ARSENAL DE CONVERSÃO — script.js
═══════════════════════════════════════════ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── UTM forwarding ──────────────────
   Captura parâmetros UTM da URL e
   os repassa para todos os links de checkout.
──────────────────────────────────────── */
function getUTMString() {
  const src  = new URLSearchParams(window.location.search);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'];
  const out  = new URLSearchParams();
  keys.forEach(k => { if (src.has(k)) out.set(k, src.get(k)); });
  return out.toString();
}

function appendUTMs(url) {
  const utms = getUTMString();
  if (!utms) return url;
  return url + (url.includes('?') ? '&' : '?') + utms;
}

function initCheckoutLinks() {
  document.querySelectorAll('.js-checkout').forEach(el => {
    const base = el.getAttribute('href');
    if (base && base !== '#' && !base.startsWith('{{')) {
      el.setAttribute('href', appendUTMs(base));
    }
    el.addEventListener('click', fireCheckoutEvent);
  });
}

/* ─── Tracking — InitiateCheckout ────── */
function fireCheckoutEvent() {
  /* GTM dataLayer push */
  if (window.dataLayer) {
    window.dataLayer.push({ event: 'InitiateCheckout', value: 19.90, currency: 'BRL' });
  }
  /* Meta Pixel */
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value: 19.90, currency: 'BRL' });
  }
}

/* ─── Reveal on scroll ──────────────── */
function initReveal() {
  if (prefersReduced) {
    document.querySelectorAll('.reveal-section').forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-section').forEach(el => obs.observe(el));
}

/* ─── Price animation ───────────────────
   1. Quando value stack entra: strikethrough no R$382
   2. Quando offer box entra: revela o R$19,90
──────────────────────────────────────── */
function initPriceAnimation() {
  /* strikethrough no total */
  const stack = document.getElementById('valueStack');
  if (stack) {
    const obs1 = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs1.disconnect();
      const old = document.getElementById('priceOld');
      if (old) setTimeout(() => old.classList.add('strike'), prefersReduced ? 0 : 250);
      /* also strike vsu-total-price if present */
      const oldVsu = document.querySelector('.vsu-total-price');
      if (oldVsu) setTimeout(() => oldVsu.classList.add('strike'), prefersReduced ? 0 : 250);
    }, { threshold: 0.4 });
    obs1.observe(stack);
  }

  /* reveal do preço final */
  const final = document.getElementById('priceFinal');
  if (final) {
    const obs2 = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs2.disconnect();
      setTimeout(() => final.classList.add('reveal'), prefersReduced ? 0 : 400);
    }, { threshold: 0.3 });
    obs2.observe(final);
  }
}

/* ─── FAQ accordion ─────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* close all */
      document.querySelectorAll('.faq-item').forEach(i => {
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-a')?.classList.remove('open');
      });

      /* open if was closed */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

/* ─── Sticky bar ─────────────────────── */
function initStickyBar() {
  const bar  = document.getElementById('stickyBar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;

  /* reuse UTM logic for sticky links */
  bar.querySelectorAll('.js-checkout').forEach(el => {
    const base = el.getAttribute('href');
    if (base && base !== '#' && !base.startsWith('{{')) {
      el.setAttribute('href', appendUTMs(base));
    }
    el.addEventListener('click', fireCheckoutEvent);
  });

  const obs = new IntersectionObserver(([entry]) => {
    bar.classList.toggle('show', !entry.isIntersecting);
  }, { threshold: 0.05 });

  obs.observe(hero);
}

/* ─── Boot ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCheckoutLinks();
  initReveal();
  initPriceAnimation();
  initFAQ();
  initStickyBar();
});

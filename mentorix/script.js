// =========================================
//   MENTROIX ACADEMY – INTERACTIONS
// =========================================

// ── 1. Header scroll effect ──
const header = document.getElementById('header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── 2. Scroll reveal observer ──
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ── 3. Auto-add reveal data attributes ──
const autoReveal = (selector, baseDelay = 0) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', '');
      if (baseDelay && i > 0) el.setAttribute('data-reveal-delay', String(Math.min(i, 4)));
    }
  });
};
autoReveal('.course-card', 1);
autoReveal('.trust__item', 1);
autoReveal('.hero__badge');
autoReveal('.hero__title');
autoReveal('.hero__sub');
autoReveal('.hero__actions');
autoReveal('.hero__stats');
autoReveal('.section-header');
autoReveal('.cta-row__text');
autoReveal('.cta-row__actions');

// Re-observe newly tagged elements
document.querySelectorAll('[data-reveal]:not(.revealed)').forEach((el) =>
  revealObserver.observe(el)
);

// ── 4. Smooth scroll for internal anchors ──
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── 5. Ripple effect on buttons ──
const addRipple = (btn) => {
  btn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      background:rgba(255,255,255,0.3);
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      transform:scale(0); animation:ripple 0.5s linear;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
};

// Inject ripple keyframes
const style = document.createElement('style');
style.textContent = '@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }';
document.head.appendChild(style);

document.querySelectorAll('.btn').forEach(addRipple);

// ── 6. Floating WhatsApp tooltip ──
const floatWa = document.getElementById('float-wa');
if (floatWa) {
  const tooltip = document.createElement('span');
  tooltip.textContent = 'Chat with us!';
  tooltip.style.cssText = `
    position:absolute; right:calc(100% + 12px); top:50%; transform:translateY(-50%);
    background:#1a2535; color:#fff; font-size:0.78rem; font-weight:600;
    padding:6px 12px; border-radius:9999px; white-space:nowrap;
    opacity:0; pointer-events:none; transition:opacity 0.2s;
    box-shadow:0 4px 16px rgba(0,0,0,0.2);
  `;
  floatWa.appendChild(tooltip);
  floatWa.addEventListener('mouseenter', () => (tooltip.style.opacity = '1'));
  floatWa.addEventListener('mouseleave', () => (tooltip.style.opacity = '0'));
}

// ── 7. Animate stats counter ──
const animateCount = (el, target, suffix = '') => {
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

const statsData = [
  { selector: '.stat:nth-child(1) .stat__num', target: 10000, suffix: '+' },
  { selector: '.stat:nth-child(3) .stat__num', target: 4 },
  { selector: '.stat:nth-child(5) .stat__num', target: 98, suffix: '%' },
];

const statsSection = document.querySelector('.hero__stats');
if (statsSection) {
  let animated = false;
  const statsObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !animated) {
      animated = true;
      statsData.forEach(({ selector, target, suffix = '' }) => {
        const el = document.querySelector(selector);
        if (el) animateCount(el, target, suffix);
      });
    }
  }, { threshold: 0.5 });
  statsObs.observe(statsSection);
}

// ── 8. Testimonials carousel ──
(function () {
  const track = document.getElementById('testimonialsTrack');
  const dotsWrap = document.getElementById('testiDots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const total = cards.length;
  let current = 0;
  let autoPlayTimer;

  // Build dots
  const dots = cards.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'testi-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', 'Testimonial ' + (i + 1));
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  function setActive(index) {
    current = ((index % total) + total) % total;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    const idx = ((index % total) + total) % total;
    const card = cards[idx];
    const offset = card.offsetLeft - (track.offsetWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: offset, behavior: 'smooth' });
    setActive(idx);
  }

  // Sync active dot on scroll
  let scrollTicking = false;
  track.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const center = track.scrollLeft + track.offsetWidth / 2;
        let closest = 0, minDist = Infinity;
        cards.forEach((c, i) => {
          const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        setActive(closest);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Drag-to-scroll (mouse)
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    pauseAuto();
  });
  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    startAuto();
  });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.2;
  });

  // Auto-play
  function startAuto() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => goTo(current + 1), 4000);
  }
  function pauseAuto() { clearInterval(autoPlayTimer); }

  track.addEventListener('mouseenter', pauseAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('touchstart', pauseAuto, { passive: true });
  track.addEventListener('touchend', startAuto, { passive: true });

  startAuto();
})();

/* =============================================
   VAUCLAIRE — main.js
   Bootstrap 5.3 · Old Money Aesthetic
   ============================================= */

/* ---- Dark mode: apply before paint to avoid flash ---- */
(function () {
  if (localStorage.getItem('vauclaire-theme') === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
})();

/* ---- Custom luxury cursor (mix-blend-mode: exclusion) ---- */
(function () {
  // Inject cursor elements directly into <html> so they survive
  // any body re-paint and are never inside a stacking context
  const ring = document.createElement('div');
  const dot  = document.createElement('div');
  ring.className = 'cursor-ring';
  dot.className  = 'cursor-dot';

  // Wait for body but insert as early as possible
  function mountCursor() {
    document.body.appendChild(ring);
    document.body.appendChild(dot);
  }
  if (document.body) { mountCursor(); }
  else { document.addEventListener('DOMContentLoaded', mountCursor); }

  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly — no lag, no flicker
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  }, { passive: true });

  // Ring follows with lerp — premium "magnetic" lag
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.10;
    ringY += (mouseY - ringY) * 0.10;
    ring.style.left = Math.round(ringX * 10) / 10 + 'px';
    ring.style.top  = Math.round(ringY * 10) / 10 + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover: ring expands over interactive elements
  const hoverSel = 'a, button, .btn-v, .product-card, .parallax-card, .look-item, .filter-btn, .social-btn, input, select, textarea, label, .theme-toggle';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) ring.classList.add('is-hovering');
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) ring.classList.remove('is-hovering');
  }, { passive: true });

  // Click shrink — purely CSS-driven, no cursor flash
  document.addEventListener('mousedown', () => {
    ring.classList.remove('is-hovering');
    ring.classList.add('is-clicking');
  }, { passive: true });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('is-clicking');
  }, { passive: true });

  // Fade out when mouse leaves viewport
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity  = '0';
  }, { passive: true });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1';
    dot.style.opacity  = '1';
  }, { passive: true });
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll effect ---- */
  const navbar = document.querySelector('.navbar-vauclaire');
  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ---- Dark mode toggle ---- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  if (document.documentElement.classList.contains('dark-mode') && themeIcon) {
    themeIcon.className = 'bi bi-sun';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark-mode');
      const isDark = document.documentElement.classList.contains('dark-mode');
      localStorage.setItem('vauclaire-theme', isDark ? 'dark' : 'light');
      if (themeIcon) themeIcon.className = isDark ? 'bi bi-sun' : 'bi bi-moon';
    });
  }

  /* ---- Active nav link by page ---- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  /* ---- Catalog filters ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.catalog-item').forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
          if (match) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
          }
        });
      });
    });
  }

  /* ---- Contact / newsletter form ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Enviado — Merci';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.opacity = '';
        form.reset();
      }, 3500);
    });
  }

  /* ---- Scroll-triggered fade-up ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => obs.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Lookbook lightbox (simple) ---- */
  const lookItems = document.querySelectorAll('.look-item');
  lookItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(26,26,26,0.96);
        display:flex;align-items:center;justify-content:center;
        z-index:9999;cursor:zoom-out;padding:2rem;
      `;
      const clone = img.cloneNode();
      clone.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;';
      overlay.appendChild(clone);
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    });
  });

});

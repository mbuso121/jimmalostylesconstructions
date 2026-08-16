/* ==========================================================================
   JIMMALO STYLES CONSTRUCTION — main.js
   Vanilla JS only. No dependencies, no frameworks.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     0. CONTACT CONFIG — edit these values for the real business
     ------------------------------------------------------------------ */
  var CONTACT = {
    whatsappNumber: '27814705129', // 081 470 5129 — digits only, country code, no leading 0
    email: 'jimmalostylesc@gmail.com'
  };

  /* ------------------------------------------------------------------
     1. YEAR STAMP
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     2. HEADER SCROLL STATE
     ------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  function updateHeaderState() {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------
     3. MOBILE NAV TOGGLE
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    header.classList.remove('mobile-open');
    mobileNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function openMobileNav() {
    header.classList.add('mobile-open');
    mobileNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  navToggle.addEventListener('click', function () {
    var isOpen = header.classList.contains('mobile-open');
    if (isOpen) closeMobileNav(); else openMobileNav();
  });
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ------------------------------------------------------------------
     4. SMOOTH ANCHOR SCROLL WITH HEADER OFFSET
     ------------------------------------------------------------------ */
  var headerHeight = function () { return header.offsetHeight; };

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() + 1;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------
     5. ACTIVE NAV LINK ON SCROLL
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      var el = document.querySelector(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    var scrollPos = window.scrollY + headerHeight() + 40;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollPos) current = s;
    });
    navLinks.forEach(function (l) { l.classList.remove('is-active'); });
    if (current) current.link.classList.add('is-active');
  }
  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ------------------------------------------------------------------
     6. SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ------------------------------------------------------------------
     7. ANIMATED SPEC-STRIP COUNTERS
     ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('.spec-number');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ------------------------------------------------------------------
     8. GALLERY FILTERING
     ------------------------------------------------------------------ */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      filterBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      galleryItems.forEach(function (item) {
        var cat = item.getAttribute('data-category');
        var show = filter === 'all' || cat === filter;
        item.classList.toggle('is-hidden', !show);
      });

      refreshLightboxSet();
    });
  });

  /* ------------------------------------------------------------------
     9. LIGHTBOX
     ------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');

  var lightboxSet = [];
  var lightboxIndex = 0;
  var lastFocusedEl = null;

  function refreshLightboxSet() {
    lightboxSet = Array.prototype.slice
      .call(document.querySelectorAll('.gallery-item:not(.is-hidden) .gallery-btn'));
  }
  refreshLightboxSet();

  function openLightbox(btn) {
    refreshLightboxSet();
    lightboxIndex = lightboxSet.indexOf(btn);
    if (lightboxIndex === -1) lightboxIndex = 0;
    lastFocusedEl = document.activeElement;
    showLightboxSlide();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onLightboxKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function showLightboxSlide() {
    var btn = lightboxSet[lightboxIndex];
    if (!btn) return;
    var full = btn.getAttribute('data-full');
    var caption = btn.getAttribute('data-caption') || '';
    lightboxImg.src = full;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
  }

  function stepLightbox(dir) {
    if (!lightboxSet.length) return;
    lightboxIndex = (lightboxIndex + dir + lightboxSet.length) % lightboxSet.length;
    showLightboxSlide();
  }

  function onLightboxKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  }

  document.querySelectorAll('.gallery-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { stepLightbox(-1); });
  lightboxNext.addEventListener('click', function () { stepLightbox(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ------------------------------------------------------------------
     10. WHATSAPP LINKS (hero, cta band, floating button)
     ------------------------------------------------------------------ */
  function buildWaLink(message) {
    var base = 'https://wa.me/' + CONTACT.whatsappNumber;
    return message ? base + '?text=' + encodeURIComponent(message) : base;
  }
  var defaultWaMessage = "Hi Jimmalo Styles Construction, I'd like a free quote for a project.";

  ['heroWhatsapp', 'ctaWhatsapp', 'floatingWhatsapp'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('href', buildWaLink(defaultWaMessage));
  });

  /* ------------------------------------------------------------------
     11. CONTACT FORM — build WhatsApp / email message from fields
     ------------------------------------------------------------------ */
  var contactForm = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');
  var submitWhatsappBtn = document.getElementById('submitWhatsapp');
  var submitEmailBtn = document.getElementById('submitEmail');

  function collectFormData() {
    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var email = document.getElementById('email').value.trim();
    var service = document.getElementById('service').value;
    var message = document.getElementById('message').value.trim();
    return { name: name, phone: phone, email: email, service: service, message: message };
  }

  function validateRequired(data) {
    if (!data.name || !data.phone) {
      formNote.textContent = 'Please fill in your name and phone number so we can reach you.';
      formNote.style.color = 'var(--terracotta-dk)';
      return false;
    }
    formNote.textContent = '';
    return true;
  }

  function formatMessage(data) {
    var lines = [
      'Hi Jimmalo Styles Construction, I would like a free quote.',
      '',
      'Name: ' + data.name,
      'Phone: ' + data.phone
    ];
    if (data.email) lines.push('Email: ' + data.email);
    lines.push('Service: ' + data.service);
    if (data.message) lines.push('Details: ' + data.message);
    return lines.join('\n');
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = collectFormData();
    if (!validateRequired(data)) return;
    var waLink = buildWaLink(formatMessage(data));
    formNote.style.color = '#2E7D46';
    formNote.textContent = 'Opening WhatsApp with your details filled in…';
    window.open(waLink, '_blank', 'noopener');
  });

  submitEmailBtn.addEventListener('click', function () {
    var data = collectFormData();
    if (!validateRequired(data)) return;

    // Honeypot: if this hidden field has a value, a bot filled it in — silently
    // stop here so we don't waste a real submission on spam.
    var honeyEl = document.getElementById('honey');
    if (honeyEl && honeyEl.value) return;

    submitEmailBtn.disabled = true;
    submitEmailBtn.textContent = 'Sending…';
    formNote.style.color = 'var(--muted)';
    formNote.textContent = 'Sending your message…';

    var payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || 'Not provided',
      service: data.service,
      message: data.message || 'No additional details provided',
      _subject: 'New Quote Request — ' + data.service,
      _template: 'table',
      _captcha: 'false'
    };

    fetch('https://formsubmit.co/ajax/' + CONTACT.email, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      })
      .then(function () {
        formNote.style.color = '#2E7D46';
        formNote.textContent = "Message sent! We'll be in touch soon.";
        contactForm.reset();
      })
      .catch(function () {
        formNote.style.color = 'var(--terracotta-dk)';
        formNote.innerHTML = 'Something went wrong sending that. Please try ' +
          '<a href="' + buildWaLink(formatMessage(data)) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">WhatsApp</a> ' +
          'instead, or email us directly at <a href="mailto:' + CONTACT.email + '" style="color:inherit;text-decoration:underline;">' + CONTACT.email + '</a>.';
      })
      .finally(function () {
        submitEmailBtn.disabled = false;
        submitEmailBtn.textContent = 'Send via Email';
      });
  });

  /* ------------------------------------------------------------------
     12. BACK TO TOP
     ------------------------------------------------------------------ */
  var backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

})();

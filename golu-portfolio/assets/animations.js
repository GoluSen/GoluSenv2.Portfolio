
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('js')) return;
  if (!('IntersectionObserver' in window)) { root.classList.remove('js'); return; }

  // scroll progress bar + nav state
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  var nav = document.querySelector('nav');
  var ticking = false;

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // terminal typing
  function typeText(el) {
    var t = el.dataset.text, i = 0;
    el.textContent = '';
    (function step() {
      el.textContent = t.slice(0, ++i);
      if (i < t.length) setTimeout(step, 45);
    })();
  }

  var heroPrompt = document.querySelector('.hero .prompt');
  if (heroPrompt) {
    heroPrompt.dataset.text = heroPrompt.textContent.trim();
    heroPrompt.textContent = '';
    setTimeout(function () { typeText(heroPrompt); }, 250);
  }

  // scroll reveal (hero ko chhodkar)
  var sel = '.sec-title, .prompt, .job, .job li, .card, .plain-row, ' +
            '.skills-list dt, .skills-list dd, section .lead, footer .lead, ' +
            '.contact-links .btn, .foot-note';
  var items = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
    return !el.closest('.hero');
  });

  var counts = new Map();
  items.forEach(function (el) {
    var n = counts.get(el.parentNode) || 0;
    counts.set(el.parentNode, n + 1);
    el.style.setProperty('--d', Math.min(n * 90, 500) + 'ms');
    el.classList.add('reveal');
    if (el.classList.contains('prompt')) {
      el.dataset.text = el.textContent.trim();
      el.textContent = '';
    }
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      if (el.classList.contains('prompt')) typeText(el);
      io.unobserve(el);
      // animation ke baad reveal hata do, taaki hover par delay na aaye
      var d = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
      setTimeout(function () { el.classList.remove('reveal', 'in'); }, 750 + d);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });

  // nav ka active link
  var links = document.querySelectorAll('.navlinks a[href^="#"]');
  var secs = document.querySelectorAll('section[id], footer[id]');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(function (s) { spy.observe(s); });

  // card par cursor ke saath chalti roshni
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (ev) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }
})();
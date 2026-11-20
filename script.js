/* ═══════════════════════════════════════════════════════════════
   JIVAMERA — interactions
   Produk & testimoni dimuat dari /data/*.json
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const doc = document;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;

  /* ── Header state + scroll progress ─────────────────────────── */
  const header = doc.getElementById('siteHeader');
  const scrollBar = doc.getElementById('scrollBar');
  const hero = doc.getElementById('top');
  const toTop = doc.getElementById('toTop');

  let heroHeight = hero ? hero.offsetHeight : 0;
  let toTopShown = false;
  let ticking = false;

  function measureHero() {
    heroHeight = hero ? hero.offsetHeight : 0;
  }

  function updateHero(y) {
    if (!hero || reduceMotion) return;

    const height = heroHeight || window.innerHeight || 1;
    const shift = Math.min(y, height);

    hero.style.setProperty('--hero-scene-y', (shift * 0.16).toFixed(1) + 'px');
    hero.style.setProperty('--hero-petal-y', (shift * 0.28).toFixed(1) + 'px');
    hero.style.setProperty('--hero-copy-y', (shift * -0.06).toFixed(1) + 'px');

    const fade = Math.min(Math.max((shift - height * 0.5) / (height * 0.5), 0), 1);
    hero.style.setProperty('--hero-fade', fade.toFixed(3));
    hero.style.setProperty('--hero-cue', Math.max(0, 1 - shift / (height * 0.3)).toFixed(3));
  }

  function setToTop(show) {
    if (!toTop || toTopShown === show) return;

    toTopShown = show;
    toTop.classList.toggle('show', show);
    toTop.inert = !show;

    if (show) toTop.removeAttribute('tabindex');
    else toTop.setAttribute('tabindex', '-1');
  }

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('scrolled', y > 24);

    if (scrollBar) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(y / max, 1) : 0;
      scrollBar.style.transform = 'scaleX(' + progress + ')';
    }

    updateHero(y);
    if (doc.body.classList.contains('menu-open')) setToTop(false);
    else setToTop(y > window.innerHeight * 0.85);

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    measureHero();
    onScroll();
  }, { passive: true });

  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(function () {
      measureHero();
      onScroll();
    });
  }

  onScroll();

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (event) {
      reduceMotion = event.matches;

      if (reduceMotion && hero) {
        hero.style.removeProperty('--hero-scene-y');
        hero.style.removeProperty('--hero-petal-y');
        hero.style.removeProperty('--hero-copy-y');
        hero.style.removeProperty('--hero-fade');
        hero.style.removeProperty('--hero-cue');
      } else {
        onScroll();
      }
    });
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── Mobile navigation ──────────────────────────────────────── */
  const menuToggle = doc.getElementById('menuToggle');
  const mainNav = doc.getElementById('mainNav');
  const navBackdrop = doc.getElementById('navBackdrop');

  function setMenu(open) {
    if (!mainNav || !menuToggle) return;

    mainNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    doc.body.style.overflow = open ? 'hidden' : '';
    doc.body.classList.toggle('menu-open', open);

    if (open) {
      setToTop(false);
    } else {
      setToTop((window.scrollY || window.pageYOffset) > window.innerHeight * 0.85);
    }

    if (navBackdrop) {
      if (open) {
        navBackdrop.hidden = false;
        window.requestAnimationFrame(function () {
          navBackdrop.classList.add('show');
        });
      } else {
        navBackdrop.classList.remove('show');
        window.setTimeout(function () {
          if (!mainNav.classList.contains('open')) navBackdrop.hidden = true;
        }, 420);
      }
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (navBackdrop) {
    navBackdrop.addEventListener('click', function () { setMenu(false); });
  }
  if (mainNav) {
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1000) setMenu(false);
  });

  /* ── Active section in navigation ───────────────────────────── */
  const navIds = ['koleksi', 'filosofi', 'bahan', 'ritual', 'testimoni'];
  const navLinks = {};

  if (mainNav) {
    navIds.forEach(function (id) {
      const link = mainNav.querySelector('a[href="#' + id + '"]');
      if (link) navLinks[id] = link;
    });
  }

  function setActiveSection(id) {
    Object.keys(navLinks).forEach(function (key) {
      const link = navLinks[key];
      const active = key === id;

      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && Object.keys(navLinks).length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(navLinks).forEach(function (id) {
      const section = doc.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ── Scroll reveal (shared with dynamic content) ────────────── */
  let revealObserver = null;

  if ('IntersectionObserver' in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }

  const revealSeen = new WeakSet();

  function registerReveal(root) {
    if (!root) return;

    const items = [];
    if (root.nodeType === 1 && root.hasAttribute('data-reveal')) items.push(root);
    if (root.querySelectorAll) {
      Array.prototype.push.apply(items, root.querySelectorAll('[data-reveal]'));
    }

    items.forEach(function (el) {
      if (revealSeen.has(el)) return;
      revealSeen.add(el);

      // Stagger elements that share a parent.
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.prototype.filter.call(parent.children, function (node) {
          return node.hasAttribute && node.hasAttribute('data-reveal');
        });
        const index = siblings.indexOf(el);
        if (siblings.length > 1 && index > 0) {
          el.style.setProperty('--delay', Math.min(index * 80, 360) + 'ms');
        }
      }

      if (revealObserver) {
        revealObserver.observe(el);
        // Immediately reveal anything already inside the viewport.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add('is-visible');
        }
      } else {
        el.classList.add('is-visible');
      }
    });
  }

  registerReveal(doc);

  /* ── Animated statistics ────────────────────────────────────── */
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const textNode = el.firstChild;
    if (!Number.isFinite(target) || !textNode || textNode.nodeType !== 3) return;

    const duration = 1400;
    const start = window.performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      textNode.nodeValue = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  const stats = doc.querySelector('.philosophy-stats');

  if (stats && !reduceMotion && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        stats.querySelectorAll('[data-count]').forEach(animateCount);
        observer.disconnect();
      });
    }, { threshold: 0.35 });

    statsObserver.observe(stats);
  }

  /* ── Toast ──────────────────────────────────────────────────── */
  const toast = doc.getElementById('toast');
  const toastText = doc.getElementById('toastText');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ── Cart (delegated so dynamic buttons work) ───────────────── */
  const cartCount = doc.getElementById('cartCount');
  const cartBtn = doc.getElementById('cartBtn');
  let count = 0;

  doc.addEventListener('click', function (event) {
    const btn = event.target && event.target.closest
      ? event.target.closest('.add-btn')
      : null;
    if (!btn) return;

    count += 1;

    if (cartCount) {
      cartCount.textContent = String(count);
      cartCount.classList.remove('pop');
      void cartCount.offsetWidth;
      cartCount.classList.add('pop');
    }
    if (cartBtn) {
      cartBtn.setAttribute(
        'aria-label',
        'Tas ritual, ' + count + ' item'
      );
    }

    showToast((btn.dataset.name || 'Produk') + ' ditambahkan ke tas ritual.');
  });

  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      const collection = doc.getElementById('koleksi');
      if (count === 0) {
        showToast('Tas ritual Anda masih kosong — mulai dari koleksi utama.');
      }
      if (collection) {
        collection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ── Newsletter ─────────────────────────────────────────────── */
  const form = doc.getElementById('newsletterForm');
  const formNote = doc.getElementById('formNote');
  const defaultNote = formNote ? formNote.textContent : '';

  if (form && formNote) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = doc.getElementById('email');
      const value = input ? input.value.trim() : '';
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      formNote.classList.remove('success', 'error');

      if (!valid) {
        formNote.textContent = 'Mohon masukkan alamat email yang valid.';
        formNote.classList.add('error');
        if (input) input.focus();
        return;
      }

      formNote.textContent = 'Terima kasih! Kode 10% sudah dikirim ke ' + value + '.';
      formNote.classList.add('success');
      input.value = '';
      showToast('Selamat datang di Jurnal Botani.');

      window.setTimeout(function () {
        formNote.textContent = defaultNote;
        formNote.classList.remove('success');
      }, 7000);
    });
  }

  /* ── Footer year ────────────────────────────────────────────── */
  const year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── Data-driven content ────────────────────────────────────── */

  // Prefixes for the accessible label of each bottle illustration.
  const artMap = {
    cream: { template: 'art-cream', label: 'Toples krim ' },
    serum: { template: 'art-serum', label: 'Botol serum ' },
    lotion: { template: 'art-lotion', label: 'Botol losion ' }
  };

  function createPriceFormatter(data) {
    const locale = data && typeof data.locale === 'string' ? data.locale : 'id-ID';
    const currency = data && typeof data.currency === 'string' ? data.currency : 'IDR';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } catch (error) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
  }

  function initialsOf(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join('');
  }

  function setStatus(element, message, state) {
    if (!element) return;

    if (!message) {
      element.textContent = '';
      element.hidden = true;
      delete element.dataset.state;
      return;
    }

    element.hidden = false;
    element.textContent = message;
    if (state) element.dataset.state = state;
    else delete element.dataset.state;
  }

  function updateProductSchema(products, data) {
    const schemaScript = doc.getElementById('organizationSchema');
    if (!schemaScript || !Array.isArray(products)) return;

    const currency = data && typeof data.currency === 'string' ? data.currency : 'IDR';

    try {
      const schema = JSON.parse(schemaScript.textContent);
      schema.makesOffer = products.filter(function (product) {
        return product && typeof product.name === 'string' && Number.isFinite(Number(product.price));
      }).map(function (product) {
        return {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: product.name,
            category: product.category || undefined
          },
          price: String(Number(product.price)),
          priceCurrency: currency
        };
      });
      schemaScript.textContent = JSON.stringify(schema, null, 2);
    } catch (error) {
      // Invalid JSON-LD should never block the page.
    }
  }

  function renderProducts(data) {
    const grid = doc.getElementById('productGrid');
    const template = doc.getElementById('productCardTemplate');
    const status = doc.getElementById('productStatus');
    if (!grid || !template) return;

    const products = data && Array.isArray(data.items) ? data.items : [];
    const formatter = createPriceFormatter(data);
    const fragment = doc.createDocumentFragment();

    products.forEach(function (product) {
      if (!product || typeof product.name !== 'string') return;

      const card = template.content.firstElementChild.cloneNode(true);
      const visual = card.querySelector('.product-visual');
      const badge = card.querySelector('.badge');
      const category = card.querySelector('.product-cat');
      const title = card.querySelector('h3');
      const description = card.querySelector('.product-desc');
      const price = card.querySelector('.price');
      const addButton = card.querySelector('.add-btn');

      title.textContent = product.name;
      category.textContent = [product.category, product.size].filter(Boolean).join(' · ');
      description.textContent = typeof product.description === 'string' ? product.description : '';

      const numericPrice = Number(product.price);
      price.textContent = Number.isFinite(numericPrice) ? formatter.format(numericPrice) : '';

      if (badge) {
        if (product.badge && product.badge.label) {
          badge.textContent = product.badge.label;
          if (product.badge.tone === 'new') badge.classList.add('badge-new');
          else if (product.badge.tone === 'soft') badge.classList.add('badge-soft');
        } else {
          badge.remove();
        }
      }

      const art = Object.prototype.hasOwnProperty.call(artMap, product.art)
        ? artMap[product.art]
        : null;

      if (art && visual) {
        const artTemplate = doc.getElementById(art.template);
        if (artTemplate) {
          const illustration = artTemplate.content.firstElementChild.cloneNode(true);
          illustration.setAttribute('aria-label', art.label + product.name);
          visual.appendChild(illustration);
        }
      }

      if (addButton) {
        addButton.dataset.name = product.name;
        addButton.setAttribute('aria-label', 'Tambah ' + product.name + ' ke tas ritual');
      }

      fragment.appendChild(card);
    });

    grid.replaceChildren(fragment);
    grid.setAttribute('aria-busy', 'false');
    setStatus(status, '');

    registerReveal(grid);
    updateProductSchema(products, data);
  }

  function renderTestimonials(data) {
    const grid = doc.getElementById('testimonialGrid');
    const template = doc.getElementById('testimonialTemplate');
    const starTemplate = doc.getElementById('starTemplate');
    const status = doc.getElementById('testimonialStatus');
    if (!grid || !template) return;

    const testimonials = data && Array.isArray(data.items) ? data.items : [];
    const fragment = doc.createDocumentFragment();

    testimonials.forEach(function (item) {
      if (!item || typeof item.quote !== 'string' || !item.quote) return;

      const figure = template.content.firstElementChild.cloneNode(true);
      const stars = figure.querySelector('.stars');
      const quote = figure.querySelector('blockquote');
      const avatar = figure.querySelector('.avatar');
      const name = figure.querySelector('strong');
      const meta = figure.querySelector('small');

      quote.textContent = item.quote;

      const rating = Math.min(5, Math.max(0, Math.round(Number(item.rating) || 0)));
      if (stars && starTemplate && rating > 0) {
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', rating + ' dari 5 bintang');
        for (let i = 0; i < rating; i += 1) {
          stars.appendChild(starTemplate.content.firstElementChild.cloneNode(true));
        }
      } else if (stars) {
        stars.remove();
      }

      const displayName = typeof item.name === 'string' && item.name ? item.name : 'Pelanggan Jivamera';
      name.textContent = displayName;
      avatar.textContent = item.initials || initialsOf(displayName);
      meta.textContent = [item.location, item.product].filter(Boolean).join(' · ');

      fragment.appendChild(figure);
    });

    grid.replaceChildren(fragment);
    grid.setAttribute('aria-busy', 'false');
    setStatus(status, '');

    registerReveal(grid);
  }

  function loadJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  function dataErrorMessage(subject) {
    const hint = window.location.protocol === 'file:'
      ? 'Buka halaman lewat server lokal (lihat README).'
      : 'Silakan muat ulang halaman.';
    return subject + ' sedang tidak dapat dimuat. ' + hint;
  }

  loadJson('data/products.json')
    .then(renderProducts)
    .catch(function (error) {
      const grid = doc.getElementById('productGrid');
      if (grid) grid.setAttribute('aria-busy', 'false');
      setStatus(
        doc.getElementById('productStatus'),
        dataErrorMessage('Koleksi'),
        'error'
      );
      console.error(
        '[Jivamera] Gagal memuat data/products.json. Jika halaman dibuka lewat file://, jalankan server lokal (lihat README).',
        error
      );
    });

  loadJson('data/testimonials.json')
    .then(renderTestimonials)
    .catch(function (error) {
      const grid = doc.getElementById('testimonialGrid');
      if (grid) grid.setAttribute('aria-busy', 'false');
      setStatus(
        doc.getElementById('testimonialStatus'),
        dataErrorMessage('Testimoni'),
        'error'
      );
      console.error(
        '[Jivamera] Gagal memuat data/testimonials.json. Jika halaman dibuka lewat file://, jalankan server lokal (lihat README).',
        error
      );
    });

})();

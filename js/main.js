/* ==========================================================
   Ambulances Horizon — effets immersifs
   GSAP + ScrollTrigger + Lenis. Les animations restent actives même
   avec prefers-reduced-motion (choix voulu, voir `reduce` ci-dessous).
   ========================================================== */
(() => {
  // Animations toujours actives (le réglage Windows « Effets d'animation » les couperait sinon)
  const reduce = false;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const nav = $('.nav');
  const burger = $('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Formulaire (front uniquement) ---------- */
  const form = $('#booking');
  const checked = $$('#f-name, #f-tel, #f-mail', form);
  // Renvoie le message d'erreur du champ, ou '' s'il est valide
  const errorOf = input => {
    if (input.required && !input.value.trim()) return 'Ce champ est obligatoire.';
    if (input.type === 'email' && input.value && !input.checkValidity()) return 'Adresse e-mail invalide.';
    return '';
  };
  const showError = (input, msg) => {
    input.closest('.field').classList.toggle('has-error', !!msg);
    input.closest('.field').querySelector('.err').textContent = msg;
    input.setAttribute('aria-invalid', !!msg);
  };
  // L'erreur disparaît dès que le champ redevient valide
  checked.forEach(input => input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true' && !errorOf(input)) showError(input, '');
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const invalid = checked.filter(input => { const msg = errorOf(input); showError(input, msg); return msg; });
    if (invalid.length) { invalid[0].focus(); return; }
    // À brancher sur un vrai service d'envoi (Formspree, PHP mail, etc.)
    $('.form__ok', form).textContent = 'Merci ! Votre demande a bien été préparée. Nous vous rappelons rapidement.';
    form.reset();
  });

  /* ---------- Carte Google Maps : chargée seulement au clic ---------- */
  const map = $('.map');
  $('.map__load', map).addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = "Plan d'accès — 10 avenue des Lilas, Créteil";
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = map.dataset.src;
    map.replaceChildren(iframe);
    iframe.focus();
  });

  /* ---------- Canvas du hero : tracé ECG + particules ---------- */
  const canvas = $('.hero__canvas');
  const ctx = canvas.getContext('2d');
  const hero = $('.hero');
  let W, H, dpr, particles = [], mouse = { x: -999, y: -999 }, t = 0, heroVisible = true;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(60, W / 22));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: Math.random() * 1.6 + .4
    }));
  }

  // Forme d'un battement (valeurs normalisées sur une période)
  function beat(p) {
    if (p < .40) return 0;
    if (p < .44) return -.15 * Math.sin((p - .40) / .04 * Math.PI);
    if (p < .47) return .25 * ((p - .44) / .03);
    if (p < .50) return .25 - 1.45 * ((p - .47) / .03);
    if (p < .54) return -1.2 + 1.5 * ((p - .50) / .04);
    if (p < .57) return .3 - .3 * ((p - .54) / .03);
    if (p < .70) return -.18 * Math.sin((p - .57) / .13 * Math.PI);
    return 0;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // particules + liaisons
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = 'rgba(147,197,253,.55)'; ctx.fill();
    }
    ctx.lineWidth = .6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.strokeStyle = `rgba(96,165,250,${.18 * (1 - d / 110)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // tracé ECG qui défile
    const baseY = H * .78, amp = Math.min(90, H * .1), period = Math.max(420, W * .45);
    const head = (t * 3.2) % (W + 200);
    const grad = ctx.createLinearGradient(head - W * .6, 0, head, 0);
    grad.addColorStop(0, 'rgba(234,88,12,0)');
    grad.addColorStop(1, 'rgba(251,146,60,.95)');
    ctx.beginPath();
    for (let x = Math.max(0, head - W * .6); x <= head; x += 2) {
      const y = baseY + beat(((x % period) + period) % period / period) * amp;
      x === Math.max(0, head - W * .6) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    // halo simulé par un trait large translucide (shadowBlur est très coûteux)
    ctx.strokeStyle = grad; ctx.globalAlpha = .25; ctx.lineWidth = 10; ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 2.4; ctx.stroke();
    // point lumineux en tête
    const hy = baseY + beat(((head % period) + period) % period / period) * amp;
    ctx.beginPath(); ctx.arc(head, hy, 4, 0, 7); ctx.fillStyle = '#FDBA74'; ctx.fill();

    t++;
  }

  function loop() { if (heroVisible) draw(); requestAnimationFrame(loop); }
  resize();
  addEventListener('resize', resize);
  if (reduce) { draw(); } else {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
    loop();
  }

  // halo qui suit la souris dans le hero
  const glow = $('.hero__glow');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    glow.style.setProperty('--mx', mouse.x + 'px');
    glow.style.setProperty('--my', mouse.y + 'px');
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });

  /* ---------- Curseur personnalisé + boutons magnétiques ---------- */
  if (finePointer && !reduce) {
    const cursor = $('.cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function follow() {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    })();
    $$('a, button, input, select, textarea, .card').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });

    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', (e.clientX - r.left - r.width / 2) * .25 + 'px');
        btn.style.setProperty('--by', (e.clientY - r.top - r.height / 2) * .35 + 'px');
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
    });

    // cartes 3D inclinables avec reflet
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(card, { rotateY: (px - .5) * 14, rotateX: (.5 - py) * 14, duration: .5, ease: 'power2.out', overwrite: 'auto' });
        card.style.setProperty('--gx', px * 100 + '%');
        card.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1, .5)' }));
    });
  }

  /* ---------- Compteurs ---------- */
  function runCounter(el) {
    const end = +el.dataset.count;
    if (reduce || !hasGsap) { el.textContent = end; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) });
  }

  /* ---------- Sans GSAP ou mouvement réduit : état final direct ---------- */
  const loader = $('.loader');
  if (!hasGsap || reduce) {
    loader.remove();
    $$('[data-count]').forEach(runCounter);
    navTheme();
    addEventListener('scroll', navTheme, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Défilement fluide ---------- */
  // lerp bas = inertie douce et continue, sans à-coups
  const lenis = typeof Lenis !== 'undefined'
    ? new Lenis({ lerp: 0.07, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    : null;
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Transition « rideau » entre les sections ---------- */
  const veil = $('.veil');
  const veilLabel = $('.veil__label');
  let busy = false;
  gsap.set('.veil__panel', { yPercent: 100 });
  function jumpTo(target, label) {
    if (busy) return;
    busy = true;
    veilLabel.textContent = label;
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(veil, { display: 'block' })
      .fromTo('.veil__panel', { yPercent: 100 }, { yPercent: 0, duration: .7, stagger: .06, ease: 'expo.inOut' })
      .fromTo(veilLabel, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' }, '-=.35')
      .add(() => {
        if (lenis) lenis.scrollTo(target, { immediate: true, offset: target === 0 ? 0 : -70, force: true });
        else (target === 0 ? scrollTo(0, 0) : $(target).scrollIntoView());
        ScrollTrigger.refresh();
      })
      .to(veilLabel, { yPercent: -120, opacity: 0, duration: .4, ease: 'expo.in' }, '+=.15')
      .to('.veil__panel', { yPercent: -100, duration: .75, stagger: .06, ease: 'expo.inOut' }, '-=.15')
      .set(veil, { display: 'none' });
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#main') return;
    const label = a.textContent.trim() || 'Accueil';
    if (id === '#top' || id === '#') { e.preventDefault(); jumpTo(0, 'Accueil'); }
    else if ($(id)) { e.preventDefault(); jumpTo(id, label); }
  }));

  /* ---------- Découpe du titre en mots ---------- */
  const title = $('.hero__title');
  title.querySelectorAll('br').forEach(br => br.replaceWith(' ¶ '));
  const parts = [];
  title.childNodes.forEach(node => {
    const em = node.nodeType === 1;
    node.textContent.split(/\s+/).filter(Boolean).forEach(w => parts.push({ w, em }));
  });
  title.innerHTML = parts.map(({ w, em }) => w === '¶' ? '<br>' :
    `<span class="w"><span>${em ? `<em>${w}</em>` : w}</span></span>`).join(' ');

  /* ---------- Intro : loader puis hero ---------- */
  const intro = gsap.timeline();
  const counter = $('.loader__count span');
  const c = { v: 0 };
  intro
    .to('.loader__ecg path', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
    .to(c, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => counter.textContent = Math.round(c.v) }, 0)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '+=.15')
    .set('.loader', { display: 'none' })
    .from('.hero__title .w > span', { yPercent: 110, rotate: 4, duration: 1.1, stagger: .06, ease: 'expo.out' }, '-=.35')
    .from(['.eyebrow', '.hero__lead', '.hero__cta', '.hero__badges'], { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '-=.8')
    .from('.nav', { y: -80, opacity: 0, duration: .9, ease: 'power3.out' }, '-=.9');

  /* ---------- Parallaxe du hero en sortie ---------- */
  // Le hero reste épinglé et la suite de la page glisse par-dessus
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', pin: true, pinSpacing: false });
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })
    .to('.hero__inner', { yPercent: -12, scale: .9, opacity: 0, ease: 'none' }, 0)
    .to('.hero', { scale: .92, borderRadius: 36, filter: 'brightness(.55)', ease: 'none' }, 0);

  /* ---------- Transitions entre sections ---------- */
  // Chaque bloc clair « s'ouvre » : coins arrondis et marges qui se résorbent
  $$('.section-in').forEach(sec => {
    gsap.fromTo(sec,
      { clipPath: 'inset(6% 5% 0% 5% round 48px)', y: 80 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', y: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 100%', end: 'top 25%', scrub: 1 } });
  });

  // La section sombre des trajets apparaît en cercle qui s'agrandit
  gsap.fromTo('.trips',
    { clipPath: 'circle(8% at 50% 60%)' },
    { clipPath: 'circle(150% at 50% 60%)', ease: 'power1.in',
      scrollTrigger: { trigger: '.trips', start: 'top 90%', end: 'top top', scrub: 1 } });

  // Footer : rideau qui remonte
  gsap.fromTo('.footer', { clipPath: 'inset(15% 0 0 0 round 60px 60px 0 0)' },
    { clipPath: 'inset(0% 0 0 0 round 0px 0px 0 0)', ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 40%', scrub: 1 } });

  /* ---------- Barre de progression ---------- */
  gsap.to('.progress', { scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- Nav claire hors du fond sombre ---------- */
  function navTheme() {
    // Le hero épinglé reste sous la page : on regarde l'élément réellement visible sous la nav
    const under = document.elementsFromPoint(innerWidth / 2, 40)
      .find(el => !el.closest('.nav, .cursor, .progress, .veil'));
    nav.classList.toggle('is-light', !(under && under.closest('.hero, .trips, .footer')));
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: navTheme });
  navTheme();

  /* ---------- Révélations au scroll ---------- */
  $$('.reveal').forEach(el => {
    gsap.from(el.children.length > 1 && el.children.length <= 8 ? el.children : el, {
      y: 36, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  gsap.from('.card', { y: 80, opacity: 0, rotateX: -18, duration: 1.1, stagger: .12, ease: 'expo.out',
    scrollTrigger: { trigger: '.cards', start: 'top 80%' } });

  $$('.h2').forEach(h => gsap.from(h, { backgroundPositionX: '100%', clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: h, start: 'top 88%' } }));

  $$('[data-count]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => runCounter(el) }));

  /* ---------- Bandeau : accélère avec la vitesse de scroll ---------- */
  gsap.to('.marquee', { rotate: 1.2, ease: 'none', scrollTrigger: { trigger: '.marquee', scrub: true } });

  /* ---------- Trajets : défilement horizontal épinglé (desktop) ---------- */
  ScrollTrigger.matchMedia({
    '(min-width: 761px)': () => {
      const pin = $('.trips__pin');
      const dist = () => pin.scrollWidth - innerWidth;
      gsap.to(['.trips__intro', '.trips__track'], {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.trips', pin: '.trips__pin', scrub: .8, end: () => '+=' + dist(), invalidateOnRefresh: true }
      });
    }
  });

  /* ---------- Valeurs : légère réduction des cartes empilées ---------- */
  $$('.stack__card').forEach((card, i, all) => {
    if (i === all.length - 1) return;
    gsap.to(card, { scale: .94, filter: 'brightness(.92)', ease: 'none',
      scrollTrigger: { trigger: all[i + 1], start: 'top bottom', end: 'top 30%', scrub: true } });
  });

  /* ---------- Liste d'équipements ---------- */
  gsap.from('.equip li', { x: 60, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.equip', start: 'top 80%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();

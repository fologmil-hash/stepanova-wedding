(() => {
  const S = window.SITE || {};

  /* ---- подстановка данных из config.js ---- */
  document.querySelectorAll('[data-site]').forEach(el => {
    const v = S[el.dataset.site];
    if (v !== undefined) el.textContent = v;
  });
  const links = {
    phone: `tel:${S.phoneRaw}`,
    whatsapp: `https://wa.me/${S.whatsapp}`,
    telegram: `https://t.me/${S.telegram}`,
    instagram: `https://instagram.com/${S.instagram}`,
    email: `mailto:${S.email}`
  };
  document.querySelectorAll('[data-link]').forEach(el => {
    const href = links[el.dataset.link];
    if (href) el.href = href;
  });
  const stats = document.getElementById('stats');
  if (stats && S.stats) {
    stats.innerHTML = S.stats.map(s =>
      `<div class="reveal"><div class="stat__num">${s.num}</div><div class="stat__label">${s.label}</div></div>`
    ).join('');
  }

  /* ---- шапка при прокрутке ---- */
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ---- мобильное меню ---- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
    document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open'); document.body.style.overflow = '';
  }));

  /* ---- появление блоков ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    io.observe(el);
  });

  /* ---- слайдер отзывов ---- */
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('revDots');
  const total = track.children.length;
  let idx = 0, timer;
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Отзыв ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  }
  const go = i => {
    idx = (i + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    [...dotsWrap.children].forEach((d, j) => d.classList.toggle('is-active', j === idx));
    clearInterval(timer); timer = setInterval(() => go(idx + 1), 7000);
  };
  document.getElementById('revPrev').onclick = () => go(idx - 1);
  document.getElementById('revNext').onclick = () => go(idx + 1);
  go(0);

  /* ---- форма: собирает текст и открывает мессенджер ----
     GitHub Pages не умеет принимать формы на сервере, поэтому заявка
     уходит готовым сообщением в WhatsApp или Telegram. */
  const form = document.getElementById('leadForm');
  let via = 'whatsapp';
  form.querySelectorAll('[data-via]').forEach(b => b.addEventListener('click', () => via = b.dataset.via));
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim();
      f.closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const d = Object.fromEntries(new FormData(form));
    const text = [
      'Здравствуйте, Мария! Заявка с сайта:',
      `Имя: ${d.name}`,
      `Контакт: ${d.contact}`,
      d.type && `Мероприятие: ${d.type}`,
      d.date && `Дата: ${d.date}`,
      d.message && `Комментарий: ${d.message}`
    ].filter(Boolean).join('\n');
    if (via === 'telegram') {
      navigator.clipboard?.writeText(text).catch(() => {});
      alert('Текст заявки скопирован — вставьте его в открывшийся чат Telegram.');
      window.open(`https://t.me/${S.telegram}`, '_blank');
    } else {
      window.open(`https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    }
  });
})();

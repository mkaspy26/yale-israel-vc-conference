// Header is transparent over the intro photo and turns solid once you scroll.
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Intro photo fades in once loaded.
document.querySelectorAll('[data-bg]').forEach(el => {
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url("${el.dataset.bg}")`; el.classList.add('is-loaded'); };
  img.src = el.dataset.bg;
});

// Mobile menu.
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach(a =>
  a.addEventListener('click', () => header.classList.remove('menu-open'))
);

// Firm logos: until the logo file exists, show the firm's name instead.
document.querySelectorAll('.firm-logo').forEach(el => {
  const img = el.querySelector('img');
  const fallback = () => { el.innerHTML = `<span class="firm-name">${el.dataset.firm}</span>`; };
  if (!img) return fallback();
  if (img.complete && img.naturalWidth === 0) fallback();
  else img.addEventListener('error', fallback);
});

// Portraits whose photo file is missing show the person's initials.
document.querySelectorAll('.person').forEach(person => {
  const figure = person.querySelector('.portrait');
  const img = figure && figure.querySelector('img');
  if (!img) return;
  const name = person.querySelector('.person-name').textContent.trim();
  const fallback = () => {
    img.remove();
    figure.classList.add('is-empty');
    figure.dataset.initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };
  if (img.complete && img.naturalWidth === 0) fallback();
  else img.addEventListener('error', fallback);
});

// Live countdowns to the conference (intro and bottom band).
document.querySelectorAll('.countdown').forEach(cd => {
  const target = new Date(cd.dataset.date).getTime();
  const units = { d: cd.querySelector('[data-unit=d]'), h: cd.querySelector('[data-unit=h]'), m: cd.querySelector('[data-unit=m]'), s: cd.querySelector('[data-unit=s]') };
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const left = Math.max(0, target - Date.now());
    const s = Math.floor(left / 1000);
    units.d.textContent = Math.floor(s / 86400);
    units.h.textContent = pad(Math.floor(s / 3600) % 24);
    units.m.textContent = pad(Math.floor(s / 60) % 60);
    units.s.textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
});

// ---------- Built in Israel: sectors, clickable companies, live network background ----------
const eco = document.querySelector('.eco');
if (eco) {
  // [name, description, deal or valuation line, website, logo file in assets/logos/companies/]
  const SECTORS = [
    { line: 'Israeli companies have set the standard in cybersecurity for three decades.', companies: [
      ['Check Point', 'Network security. Brought the firewall to the mass market.', 'Valued at $19 billion, January 2026', 'https://www.checkpoint.com', 'checkpoint.svg'],
      ['Wiz', 'Cloud security for many of the world\'s largest companies.', 'Acquired by Google for $32 billion, 2026', 'https://www.wiz.io', 'wiz.svg'],
      ['CyberArk', 'Identity and privileged-access security.', 'Acquired by Palo Alto Networks for $25 billion, 2026', 'https://www.cyberark.com', 'cyberark.svg'],
    ]},
    { line: 'Intel, Nvidia, Apple and Google all run major chip and AI research centers in Israel.', companies: [
      ['Mobileye', 'Computer vision for driver assistance and autonomous driving.', 'Acquired by Intel for $15.3 billion, 2017', 'https://www.mobileye.com', 'mobileye.svg'],
      ['Mellanox', 'High-speed networking for data centers and AI.', 'Acquired by Nvidia for $6.9 billion, 2020', 'https://www.nvidia.com/en-us/networking/', 'mellanox.svg'],
      ['Habana Labs', 'Processors for training and running AI models.', 'Acquired by Intel for $2 billion, 2019', 'https://habana.ai', 'habana.png'],
    ]},
    { line: 'Products used by hundreds of millions of people, built by Israeli founders.', companies: [
      ['Waze', 'Navigation built on real-time reports from drivers.', 'Acquired by Google for $1.1 billion, 2013', 'https://www.waze.com', 'waze-outline.svg'],
      ['monday.com', 'Work-management software used by teams worldwide.', 'Valued at $6.8 billion at its Nasdaq IPO, 2021', 'https://monday.com', 'monday.svg'],
      ['Fiverr', 'A global marketplace for freelance services.', 'Valued at $650 million at its NYSE IPO, 2019', 'https://www.fiverr.com', 'fiverr.svg'],
    ]},
    { line: 'From affordable medicines to surgical robots.', companies: [
      ['Teva', 'A global pharmaceutical company known for affordable generic drugs.', 'Valued at $38 billion, July 2026', 'https://www.tevapharm.com', 'teva.svg'],
      ['Given Imaging', 'Invented the PillCam, a camera you can swallow.', 'Acquired by Covidien for $860 million, 2014', 'https://www.medtronic.com', 'given.png'],
      ['Mazor Robotics', 'Robotic guidance for spine surgery.', 'Acquired by Medtronic for $1.64 billion, 2018', 'https://www.medtronic.com', 'mazor.png'],
    ]},
  ];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cardsEl = eco.querySelector('.eco-cards');
  const numEl = eco.querySelector('.eco-stage-num');
  const lineEl = eco.querySelector('.eco-stage-line');
  const tabs = [...eco.querySelectorAll('.eco-tab')];
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  // Company names resolve letter by letter when a sector opens.
  const decode = (el, text) => {
    el.textContent = text;
    if (reduce) return;
    const start = Date.now(), dur = 480;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const shown = Math.floor(p * text.length);
      el.textContent = text.slice(0, shown) + [...text.slice(shown)].map(c => c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
      if (p >= 1) { clearInterval(id); el.textContent = text; }
    }, 30);
  };

  const show = i => {
    tabs.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.setAttribute('aria-selected', j === i); });
    numEl.textContent = String(i + 1).padStart(2, '0');
    lineEl.textContent = SECTORS[i].line;
    cardsEl.innerHTML = SECTORS[i].companies.map(([name, what, fact, url, logo]) => `
      <a class="eco-card" href="${url}" target="_blank" rel="noopener">
        <span class="eco-logo"><img src="assets/logos/companies/${logo}" alt="${name} logo"></span>
        <h3 class="eco-card-name"></h3>
        <p class="eco-card-what">${what}</p>
        <p class="eco-card-fact">${fact}</p>
        <span class="eco-visit">Visit website <span aria-hidden="true">↗</span></span>
      </a>`).join('');
    [...cardsEl.children].forEach((card, k) => {
      decode(card.querySelector('.eco-card-name'), SECTORS[i].companies[k][0]);
      const img = card.querySelector('.eco-logo img');
      img.addEventListener('error', () => img.remove());
    });
  };
  // Phone: 'Next sector' button under the cards, and keep the active tab in view.
  const nextBtn = eco.querySelector('.eco-next');
  const stage = eco.querySelector('.eco-stage');
  let current = 0;
  const select = i => {
    current = i;
    show(i);
    const n = (i + 1) % SECTORS.length;
    if (nextBtn) nextBtn.innerHTML = `Next: ${tabs[n].textContent.replace(/^\d+/, '').trim()} <span aria-hidden="true">→</span>`;
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'center' });
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  if (nextBtn) nextBtn.addEventListener('click', () => {
    select((current + 1) % SECTORS.length);
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  show(0);
  if (nextBtn) nextBtn.innerHTML = `Next: ${tabs[1].textContent.replace(/^\d+/, '').trim()} <span aria-hidden="true">→</span>`;

  // Background: a slow network of points; links and points near the cursor light up.
  const canvas = eco.querySelector('.eco-canvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, mx = -9999, my = -9999, pts = [], visible = false;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = eco.offsetWidth; h = eco.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / 16000);
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18 }));
  };
  const LINK = 120;
  const frame = () => {
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK) continue;
        const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) / 260);
        ctx.strokeStyle = `rgba(185,200,222,${(1 - d / LINK) * (0.07 + near * 0.5)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      const glow = Math.max(0, 1 - Math.hypot(a.x - mx, a.y - my) / 240);
      ctx.fillStyle = `rgba(${glow > 0 ? '185,200,222' : '255,255,255'},${0.18 + glow * 0.7})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.3 + glow * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(frame);
  };
  eco.addEventListener('pointermove', e => { const b = eco.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
  eco.addEventListener('pointerleave', () => { mx = my = -9999; });
  new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(frame); }).observe(eco);
  addEventListener('resize', size);
  size();
}

// ---------- Mission: a field of points that parts around the cursor ----------
const mission = document.querySelector('.mission');
if (mission) {
  const canvas = mission.querySelector('.mission-canvas');
  const ctx = canvas.getContext('2d');
  const GAP = 30, REACH = 150, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, pts = [], mx = -9999, my = -9999, visible = false, raf = 0;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = mission.offsetWidth; h = mission.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = [];
    for (let x = GAP / 2; x < w; x += GAP) for (let y = GAP / 2; y < h; y += GAP) pts.push({ hx: x, hy: y, x, y });
    draw();
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    let moving = false;
    for (const p of pts) {
      let tx = p.hx, ty = p.hy;
      const dx = p.hx - mx, dy = p.hy - my, d = Math.hypot(dx, dy);
      if (d < REACH && d > 0.01) {
        const push = (1 - d / REACH) ** 2 * 26;
        tx += (dx / d) * push; ty += (dy / d) * push;
      }
      p.x += (tx - p.x) * 0.16; p.y += (ty - p.y) * 0.16;
      if (Math.abs(tx - p.x) > 0.1 || Math.abs(ty - p.y) > 0.1) moving = true;
      const off = Math.hypot(p.x - p.hx, p.y - p.hy);
      ctx.fillStyle = `rgba(20,40,74,${0.22 + Math.min(off / 26, 1) * 0.5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + Math.min(off / 26, 1) * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    return moving;
  };
  const loop = () => { raf = 0; if (draw() && visible) raf = requestAnimationFrame(loop); };
  const kick = () => { if (!raf && !still) raf = requestAnimationFrame(loop); };
  mission.addEventListener('pointermove', e => { const b = mission.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; kick(); });
  mission.addEventListener('pointerleave', () => { mx = my = -9999; kick(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(mission);
  addEventListener('resize', size);
  size();

  // Stat cards tilt slightly toward the cursor.
  mission.querySelectorAll('.stat').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (still) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

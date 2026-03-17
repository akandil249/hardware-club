/* ── Circuit Canvas ── */
(function () {
  const canvas = document.getElementById('circuit-canvas');
  const ctx = canvas.getContext('2d');
  const ACCENT = '#d97706';
  const ACCENT2 = '#f59e0b';
  let W, H, nodes, animId;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    init();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function init() {
    const count = Math.floor((W * H) / 22000);
    nodes = Array.from({ length: count }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.18, 0.18),
      r: rand(1.5, 3),
      color: Math.random() > 0.5 ? ACCENT : ACCENT2,
    }));
  }

  function drawNode(n) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = n.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawEdge(a, b, dist, maxDist) {
    const alpha = (1 - dist / maxDist) * 0.35;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);

    // right-angle circuit-style routing
    const mx = (a.x + b.x) / 2;
    ctx.lineTo(mx, a.y);
    ctx.lineTo(mx, b.y);
    ctx.lineTo(b.x, b.y);

    ctx.strokeStyle = `rgba(217,119,6,${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 160;

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) drawEdge(nodes[i], nodes[j], dist, maxDist);
      }
    }

    nodes.forEach(drawNode);
    animId = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();

/* ── Nav scroll class ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Typewriter ── */
(function () {
  const el = document.getElementById('typewriter');
  const phrases = ['flash firmware.bin', 'analogWrite(9, 128)', 'volts: 3.29 V DC', 'solder joints: OK'];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 80);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
      setTimeout(type, 40);
    }
  }
  setTimeout(type, 800);
})();

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.08 }
);

document.querySelectorAll('.card, .member, .no-projects, h2, .section-label, .section-sub, .join-form').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

/* ── 3D Tilt ── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    card.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)';
  });
  card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
});

/* ── Form submit ── */
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = 'Sending...';

  const res = await fetch('https://formspree.io/f/xgonndjb', {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  });

  if (res.ok) {
    form.style.display = 'none';
    document.getElementById('form-success').style.display = 'flex';
  } else {
    btn.disabled = false;
    btn.textContent = 'Send Interest Form';
    alert('Something went wrong. Please try again or email akandil249@student.fuhsd.org directly.');
  }
}

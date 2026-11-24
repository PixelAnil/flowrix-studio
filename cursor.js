// Flowrix cursor: a bronze dot with a trailing cream ring (adapted from the QZEN cursor).
// Near a button the ring leaves the pointer and settles over the button as its outline.
// Over project panels it hides, because the "İncele" circle takes over there.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const css = document.createElement('style');
  css.textContent = `
    html.has-cursor, html.has-cursor * { cursor: none !important; }
    .cur-ring, .cur-dot { position: fixed; top: 0; left: 0; z-index: 60; pointer-events: none; opacity: 0; }
    .cur-ring { width: 36px; height: 36px; border: 1.5px solid rgba(241,236,227,.7); border-radius: 999px;
      transition: opacity .25s ease, background-color .3s ease, border-color .3s ease, scale .2s ease; }
    .cur-ring.snap { border-color: #F1ECE3; background-color: rgba(241,236,227,.1); }
    .cur-ring.down { scale: .92; }
    .cur-dot { width: 6px; height: 6px; border-radius: 999px; background: #B08A4E; transition: opacity .25s ease; }
  `;
  document.head.appendChild(css);

  const ring = document.createElement('div'); ring.className = 'cur-ring'; ring.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('div'); dot.className = 'cur-dot'; dot.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);
  document.documentElement.classList.add('has-cursor');

  const RING = 36, SNAP_REACH = 28;
  const SNAP_SEL = '.cta, .btn, .round, .back';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const p = { x: -100, y: -100 };
  const box = { x: -100, y: -100, w: RING, h: RING, r: RING / 2 };
  let visible = false, hoverLink = false, snapEl = null, last = performance.now();

  const show = on => { visible = on; ring.style.opacity = dot.style.opacity = on ? '1' : '0'; };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    p.x = e.clientX; p.y = e.clientY;
    const t = e.target;
    show(!(t.closest && t.closest('.panel')) && t.tagName !== 'IFRAME');
    hoverLink = !!(t.closest && t.closest('a, button, [role="button"]'));
  }, { passive: true });
  document.addEventListener('mouseleave', () => show(false));
  addEventListener('pointerdown', () => ring.classList.add('down'));
  addEventListener('pointerup', () => ring.classList.remove('down'));

  function nearest() {
    for (const el of document.querySelectorAll(SNAP_SEL)) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const dx = Math.max(r.left - p.x, 0, p.x - r.right), dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
      if (dx * dx + dy * dy <= SNAP_REACH * SNAP_REACH) return el;
    }
    return null;
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(64, now - last); last = now;
    if (!visible) return;
    const next = nearest();
    if (next !== snapEl) { snapEl = next; ring.classList.toggle('snap', !!next); }
    let g;
    if (snapEl) {
      const r = snapEl.getBoundingClientRect();
      // take the button's own corner shape (square .cta, pill .btn, circle .round)
      const br = getComputedStyle(snapEl).borderTopLeftRadius;
      const rad = br.endsWith('%') ? Math.min(r.width, r.height) * parseFloat(br) / 100 : Math.min(parseFloat(br) || 0, Math.min(r.width, r.height) / 2);
      g = { x: r.left, y: r.top, w: r.width, h: r.height, r: rad };
    } else {
      const s = hoverLink ? RING * 1.5 : RING;
      g = { x: p.x - s / 2, y: p.y - s / 2, w: s, h: s, r: s / 2 };
    }
    const k = reduced ? 1 : 1 - Math.pow(1 - 0.22, dt / 16.67);   // frame-rate independent easing
    box.x += (g.x - box.x) * k; box.y += (g.y - box.y) * k;
    box.w += (g.w - box.w) * k; box.h += (g.h - box.h) * k; box.r += (g.r - box.r) * k;
    ring.style.transform = `translate3d(${box.x}px,${box.y}px,0)`;
    ring.style.width = `${box.w}px`; ring.style.height = `${box.h}px`; ring.style.borderRadius = `${box.r}px`;
    dot.style.transform = `translate3d(${p.x - 3}px,${p.y - 3}px,0)`;
  }
  requestAnimationFrame(tick);
})();

// ===== VERTICAL SCROLL PROGRESS =====
const scrollBarV    = document.getElementById('scrollBarV');
const scrollNozzleV = document.getElementById('scrollNozzleV');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollBarV.style.height    = pct + '%';
  scrollNozzleV.style.top    = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// ===== PRODUCT FILTER =====
function applyFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = [...document.querySelectorAll('.filter-btn')].find(b => b.dataset.filter === filter);
  if (activeBtn) activeBtn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !match);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
});

function filterCategory(cat) {
  applyFilter(cat);
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ===== IMPULSE ITEMS (under ₹100) =====
const impulseItems = [
  { name: 'Cable Clip',      price: 49,  icon: '📎', desc: 'Stick-on cord holder' },
  { name: 'Mini Keychain',   price: 59,  icon: '🔑', desc: 'Printed keychain tag' },
  { name: 'Pen Clip',        price: 69,  icon: '✏️', desc: 'Desk pen holder clip' },
  { name: 'Cord Tie Set',    price: 79,  icon: '🔗', desc: 'Set of 5 reusable ties' },
  { name: 'Phone Grip Ring', price: 89,  icon: '💍', desc: 'Stick-on grip ring' },
  { name: 'Badge Clip',      price: 49,  icon: '📛', desc: 'ID badge holder clip' },
];

function renderImpulse() {
  const strip  = document.getElementById('impulseStrip');
  const scroll = document.getElementById('impulseScroll');
  if (cart.length === 0) { strip.style.display = 'none'; return; }

  strip.style.display = 'block';
  // show items not already in cart
  const cartNames = cart.map(i => i.name);
  const toShow = impulseItems.filter(i => !cartNames.includes(i.name));
  if (toShow.length === 0) { strip.style.display = 'none'; return; }

  scroll.innerHTML = toShow.map(item => `
    <div class="impulse-card">
      <div class="impulse-card-icon">${item.icon}</div>
      <div class="impulse-card-name">${item.name}</div>
      <div style="font-size:11px;color:var(--text-muted);line-height:1.3">${item.desc}</div>
      <div class="impulse-card-bottom">
        <span class="impulse-price">₹${item.price}</span>
        <button class="impulse-add" onclick="impulseAdd(this,'${item.name}',${item.price})">+</button>
      </div>
    </div>
  `).join('');
}

function impulseAdd(btn, name, price) {
  btn.classList.add('added');
  btn.textContent = '✓';
  setTimeout(() => addToCart(null, name, price), 200);
}

// ===== CART =====
let cart = [];

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function addToCart(btn, name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  showToast(`✓ ${name} added to cart`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 2000);
  }
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  countEl.textContent = totalItems;
  totalEl.textContent = `₹ ${totalPrice.toLocaleString('en-IN')}`;

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    renderImpulse();
    return;
  }

  renderImpulse();
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.name} ${item.qty > 1 ? `×${item.qty}` : ''}</div>
        <div class="cart-item-price">₹ ${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">✕</button>
    </div>
  `).join('');
}

function getCartSummary() {
  if (cart.length === 0) return '';
  const lines = cart.map(i => `${i.name} ×${i.qty} = ₹${i.price * i.qty}`);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return `Order from cart:\n${lines.join('\n')}\nTotal: ₹${total}`;
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== CUSTOM ORDER FORM =====
function submitCustomOrder(e) {
  e.preventDefault();
  showToast('🎉 Quote request sent! We\'ll respond within 2 hours.');
  e.target.reset();
}

// ===== CONTACT FORM =====
function submitContact(e) {
  e.preventDefault();
  showToast('✓ Message sent! We\'ll get back to you soon.');
  e.target.reset();
}

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
}, { passive: true });

// Init cart
renderCart();

// ===== HERO VISUAL INTERACTIONS =====
(function () {
  const visual   = document.querySelector('.hero-visual');
  const hero     = document.querySelector('.hero');
  if (!visual || !hero) return;

  const shape1   = document.querySelector('.hero-shape-1');
  const shape2   = document.querySelector('.hero-shape-2');
  const shape3   = document.querySelector('.hero-shape-3');
  const cards    = document.querySelectorAll('.floating-card');

  // --- idle float offsets (replaces CSS animation so we can blend with parallax) ---
  const idles = [
    { el: cards[0], amp: 10, speed: 0.0018, phase: 0 },
    { el: cards[1], amp: 10, speed: 0.0015, phase: Math.PI },
    { el: cards[2], amp: 8,  speed: 0.0020, phase: Math.PI / 2 },
    { el: shape1,   amp: 5,  speed: 0.0010, phase: 0 },
    { el: shape2,   amp: 6,  speed: 0.0012, phase: Math.PI / 3 },
    { el: shape3,   amp: 4,  speed: 0.0014, phase: Math.PI * 0.7 },
  ];

  // parallax targets (multiplier = depth layer)
  const parallax = [
    { el: shape1,  mx: 0.025, my: 0.02  },
    { el: shape2,  mx: 0.04,  my: 0.035 },
    { el: shape3,  mx: 0.06,  my: 0.05  },
    { el: cards[0],mx: 0.015, my: 0.012 },
    { el: cards[1],mx: 0.03,  my: 0.025 },
    { el: cards[2],mx: 0.02,  my: 0.018 },
  ];

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let rafId;

  // ── carriage tracking ──
  const carriage    = document.querySelector('.ph-carriage');
  const heaterBlock = document.querySelector('.ph-heater-block');
  const printBed    = document.querySelector('.ph-print-bed');
  if (carriage) carriage.style.animation = 'none'; // JS takes over

  let carriageTarget = 0, carriagePos = 0;
  const TRAVEL = 62; // px either side of centre

  // preview dot (shows nozzle landing position)
  let cursorDot = null;
  if (printBed) {
    printBed.style.position = 'relative';
    cursorDot = document.createElement('div');
    cursorDot.style.cssText = `
      position:absolute; width:9px; height:9px; border-radius:50%;
      background:rgba(232,69,69,0.25); border:1.5px solid var(--purple);
      bottom:5px; left:50%; transform:translateX(-50%);
      pointer-events:none; z-index:3; opacity:0;
      transition:opacity 0.25s, left 0.07s linear;
    `;
    printBed.appendChild(cursorDot);
  }

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left - rect.width  / 2);
    targetY = (e.clientY - rect.top  - rect.height / 2);

    // map mouse X within the hero-visual column → carriage travel
    if (visual) {
      const vr = visual.getBoundingClientRect();
      const vx = (e.clientX - vr.left) / vr.width; // 0..1
      carriageTarget = Math.max(-TRAVEL, Math.min(TRAVEL, (vx - 0.5) * TRAVEL * 2));
    }
    if (cursorDot) cursorDot.style.opacity = '1';
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    carriageTarget = 0;
    if (cursorDot) cursorDot.style.opacity = '0';
  });

  function tick(t) {
    // smooth mouse lerp
    mouseX += (targetX - mouseX) * 0.07;
    mouseY += (targetY - mouseY) * 0.07;

    // smooth carriage lerp
    carriagePos += (carriageTarget - carriagePos) * 0.09;
    if (carriage) carriage.style.transform = `translateX(${carriagePos.toFixed(2)}px)`;

    // heater glow intensity scales with carriage speed
    const speed = Math.abs(carriageTarget - carriagePos);
    if (heaterBlock && !heaterBlock.classList.contains('flash')) {
      const glow = Math.min(speed * 0.7, 18);
      heaterBlock.style.boxShadow =
        `0 2px 10px rgba(200,68,68,0.5), 0 0 ${glow}px rgba(200,68,68,${(0.15 + speed * 0.012).toFixed(2)})`;
    }

    // move preview cursor dot to match carriage
    if (cursorDot && printBed) {
      const bedW = printBed.offsetWidth || 170;
      const pct = 50 + (carriagePos / bedW) * 100;
      cursorDot.style.left = `${Math.max(8, Math.min(92, pct)).toFixed(1)}%`;
    }

    parallax.forEach(({ el, mx, my }) => {
      if (!el) return;
      const px = mouseX * mx;
      const py = mouseY * my;
      const idle = idles.find(i => i.el === el);
      const iy = idle ? Math.sin(t * idle.speed + idle.phase) * idle.amp : 0;
      el.style.transform = buildTransform(el, px, py + iy);
    });

    rafId = requestAnimationFrame(tick);
  }

  function buildTransform(el, px, py) {
    if (el === shape1) return `translate(${px}px, ${py}px) rotate(12deg)`;
    if (el === shape3) return `translate(${px}px, ${py}px) rotate(-8deg)`;
    return `translate(${px}px, ${py}px)`;
  }

  rafId = requestAnimationFrame(tick);

  // --- Card tilt on hover ---
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 → 0.5
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translate(var(--px,0px), var(--py,0px))
        rotateX(${-cy * 14}deg) rotateY(${cx * 14}deg) scale(1.06)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';   // JS tick resumes
    });
  });

  // --- Card click ---
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.remove('clicked');
      void card.offsetWidth;   // reflow to restart animation
      card.classList.add('clicked');
      card.addEventListener('animationend', () => card.classList.remove('clicked'), { once: true });

      // ripple dot
      spawnRipple(card);
    });
  });

  // --- Shape click ---
  [shape1, shape2, shape3].forEach(sh => {
    if (!sh) return;
    sh.addEventListener('click', () => {
      sh.classList.remove('burst');
      void sh.offsetWidth;
      sh.classList.add('burst');
      sh.addEventListener('animationend', () => sh.classList.remove('burst'), { once: true });
      spawnRipple(sh);
    });
  });

  // ── CLICK-TO-PRINT on printer area ──
  let printCount = 0;
  if (visual) {
    visual.addEventListener('click', e => {
      if (e.target.closest('.floating-card')) return; // don't intercept card clicks
      spawnPrintDot(carriagePos);
    });
  }

  function spawnPrintDot(xOff) {
    if (!printBed) return;
    printCount++;
    const dot = document.createElement('div');
    const size  = (5 + Math.random() * 5).toFixed(1);
    const spread = (Math.random() - 0.5) * 14;
    const bedW   = printBed.offsetWidth || 170;
    const pct    = 50 + ((xOff + spread) / bedW) * 100;
    const bottom = (3 + Math.random() * 28).toFixed(1);

    dot.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      border-radius:50%; background:var(--purple);
      left:${Math.max(6, Math.min(94, pct)).toFixed(1)}%;
      bottom:${bottom}px;
      transform:translateX(-50%) scale(0);
      animation:printDotAppear 0.3s ease forwards;
      pointer-events:none; z-index:5;
      box-shadow:0 0 7px rgba(232,69,69,0.65);
    `;
    printBed.appendChild(dot);

    // heater flash
    if (heaterBlock) {
      heaterBlock.classList.remove('flash');
      void heaterBlock.offsetWidth;
      heaterBlock.classList.add('flash');
      heaterBlock.addEventListener('animationend', () => heaterBlock.classList.remove('flash'), { once: true });
    }

    if (printCount === 1) showToast('🖨️ Click anywhere to keep printing!');
    if (printCount >= 6)  { showToast('✨ Nice! Check out the real stuff below 👇'); printCount = 0; }

    setTimeout(() => {
      dot.style.animation = 'printDotFade 0.5s ease forwards';
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    }, 5000);
  }

  function spawnRipple(parent) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      position:absolute; border-radius:50%;
      width:10px; height:10px;
      background: rgba(232,69,69,0.35);
      top:50%; left:50%; transform:translate(-50%,-50%);
      pointer-events:none; z-index:99;
      animation: rippleOut 0.5s ease forwards;
    `;
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';
    parent.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }

  // inject keyframes once
  if (!document.getElementById('rippleStyle')) {
    const s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = `
      @keyframes rippleOut {
        from { width:10px; height:10px; opacity:1; }
        to   { width:180px; height:180px; opacity:0; margin:-85px; }
      }
      @keyframes printDotAppear {
        from { transform:translateX(-50%) scale(0); opacity:0; }
        to   { transform:translateX(-50%) scale(1); opacity:1; }
      }
      @keyframes printDotFade {
        to { transform:translateX(-50%) scale(0.2); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
})();

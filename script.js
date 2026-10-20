// ================================================================
// ÖMER FARUK DEMİRTAŞ — PORTFOLIO
// ================================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ─── HEADER, SCROLL PROGRESS ───
function initHeader() {
    const header   = $('.site-header');
    const progress = $('.scroll-progress');
    let ticking = false;

    function update() {
        const y   = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('is-scrolled', y > 10);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
}

// ─── ACTIVE NAV LINK ───
function initActiveNav() {
    const links = $$('.nav-link:not(.nav-link--cta)');
    const byId  = new Map(links.map(l => [l.getAttribute('href').slice(1), l]));

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(l => l.classList.remove('is-active'));
            const link = byId.get(entry.target.id);
            if (link) link.classList.add('is-active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    $$('main section[id]').forEach(s => obs.observe(s));
}

// ─── MOBILE MENU ───
function initMobileMenu() {
    const toggle = $('.menu-toggle');
    const nav    = $('#site-nav');
    const header = $('.site-header');

    function setOpen(open) {
        nav.classList.toggle('is-open', open);
        header.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('.nav-link', nav).forEach(l => l.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
}

// ─── MOUSE-FOLLOWING BACKGROUND GLOW ───
function initGlow() {
    if (!finePointer || prefersReducedMotion) return;
    const glow = $('.bg-glow');
    let x = 0, y = 0, queued = false;

    document.addEventListener('pointermove', e => {
        x = e.clientX; y = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            glow.style.setProperty('--mx', `${x}px`);
            glow.style.setProperty('--my', `${y}px`);
            queued = false;
        });
    });
}

// ─── TYPED ROLE ───
function initTyped() {
    const el = $('.typed');
    if (!el || prefersReducedMotion) return;
    const words = JSON.parse(el.dataset.words);
    let w = 0, i = words[0].length, deleting = true;

    function step() {
        const word = words[w];
        if (deleting) {
            i--;
            el.textContent = word.slice(0, i);
            if (i === 0) {
                deleting = false;
                w = (w + 1) % words.length;
                return setTimeout(step, 300);
            }
            return setTimeout(step, 28);
        }
        i++;
        el.textContent = words[w].slice(0, i);
        if (i === words[w].length) {
            deleting = true;
            return setTimeout(step, 2400);
        }
        setTimeout(step, 55 + Math.random() * 40);
    }
    setTimeout(step, 2600);
}

// ─── TERMINAL BOOT SEQUENCE ───
function initTerminal() {
    const body = $('.terminal-body');
    if (!body) return;

    const lines = [
        [['t-prompt', '$ '], ['', './boot --profile ofd']],
        [['t-ok', '[ OK ] '], ['', 'HAL initialized'], ['t-dim', ' · STM32']],
        [['t-ok', '[ OK ] '], ['', 'RTOS scheduler started']],
        [['t-ok', '[ OK ] '], ['', 'CAN bus / Modbus link up']],
        [['t-ok', '[ OK ] '], ['', 'PID loop locked'], ['t-dim', ' · servo ready']],
        [['t-ok', '[ OK ] '], ['', 'ros2 node '], ['t-hi', '/ofd'], ['t-dim', ' online']],
        [['t-prompt', '> '], ['t-hi', 'debugged, compiled & still running']],
    ];

    const span = (cls, text = '') => {
        const s = document.createElement('span');
        if (cls) s.className = cls;
        s.textContent = text;
        return s;
    };
    const cursor = span('t-cursor');

    if (prefersReducedMotion) {
        lines.forEach(parts => {
            parts.forEach(([cls, text]) => body.appendChild(span(cls, text)));
            body.appendChild(document.createTextNode('\n'));
        });
        body.lastChild.remove();
        body.appendChild(cursor);
        return;
    }

    body.appendChild(cursor);
    const typeLine = new Set([0, lines.length - 1]); // these lines are "typed"
    let li = 0;

    function nextLine() {
        if (li >= lines.length) return;
        const parts = lines[li];
        const typed = typeLine.has(li);
        if (li > 0) body.insertBefore(document.createTextNode('\n'), cursor);

        if (!typed) {
            parts.forEach(([cls, text]) => body.insertBefore(span(cls, text), cursor));
            li++;
            return setTimeout(nextLine, 260 + Math.random() * 260);
        }

        // first part is the prompt, rest is typed char by char
        body.insertBefore(span(parts[0][0], parts[0][1]), cursor);
        const rest = parts.slice(1);
        let p = 0, c = 0, target = null;
        (function typeChar() {
            if (p >= rest.length) { li++; return setTimeout(nextLine, 450); }
            if (!target) { target = span(rest[p][0]); body.insertBefore(target, cursor); }
            target.textContent += rest[p][1][c++];
            if (c >= rest[p][1].length) { p++; c = 0; target = null; }
            setTimeout(typeChar, 38 + Math.random() * 45);
        })();
    }
    setTimeout(nextLine, 900);
}

// ─── PCB CANVAS (hero background) ───
function initPCB() {
    const hero   = $('.hero');
    const canvas = $('.pcb-canvas');
    if (!hero || !canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const G = 22;                                   // routing grid, CSS px
    const DIRS = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    const AMBER = '234,165,42';
    const CYAN  = '47,214,239';
    const CHIP_LABELS = ['STM32', 'CAN-PHY', 'IMU', 'DRV8xx', 'PMIC', 'ESP', 'ADC'];

    let W = 0, H = 0, dpr = 1;
    let traces = [], chips = [];
    let baseLayer, brightLayer, spot, glowSprite = {};
    let pulses = [], sparks = [];
    let mouse = { x: -9999, y: -9999, inside: false };
    let running = false, visible = true, last = 0, spawnTimer = 0, mouseSpawnTimer = 0;

    const rand    = (a, b) => a + Math.random() * (b - a);
    const randInt = (a, b) => Math.floor(rand(a, b + 1));

    function makeCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    }

    function makeGlow(rgb) {
        const s = 48;
        const c = makeCanvas(s, s);
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        grd.addColorStop(0, `rgba(255,255,255,0.95)`);
        grd.addColorStop(0.18, `rgba(${rgb},0.9)`);
        grd.addColorStop(0.45, `rgba(${rgb},0.25)`);
        grd.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = grd;
        g.fillRect(0, 0, s, s);
        return c;
    }

    // ── layout generation ──
    function generate() {
        const cols = Math.ceil(W / G) + 1;
        const rows = Math.ceil(H / G) + 1;
        const used = new Uint8Array(cols * rows);
        const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !used[r * cols + c];
        const mark = (c, r) => { used[r * cols + c] = 1; };
        traces = []; chips = [];

        function route(c, r, d, color) {
            if (!free(c, r)) return;
            mark(c, r);
            const pts = [[c, r]];
            const segs = randInt(1, 4);
            for (let s = 0; s < segs; s++) {
                const diag = d % 2 === 1;
                const L = diag ? randInt(1, 3) : randInt(3, 12);
                let moved = 0;
                for (let k = 0; k < L; k++) {
                    const nc = c + DIRS[d][0], nr = r + DIRS[d][1];
                    if (!free(nc, nr)) break;
                    // don't let a diagonal squeeze between two occupied cells
                    if (diag && !free(c + DIRS[d][0], r) && !free(c, r + DIRS[d][1])) break;
                    c = nc; r = nr; mark(c, r); moved++;
                }
                if (!moved) break;
                pts.push([c, r]);
                d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8; // 45° turn
            }
            if (pts.length < 2) return;

            const P = pts.map(([pc, pr]) => ({ x: pc * G, y: pr * G }));
            const lens = [0];
            for (let i = 1; i < P.length; i++) {
                lens.push(lens[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
            }
            const total = lens[lens.length - 1];
            if (total < G * 2.5) return;
            traces.push({ P, lens, total, color: color || (Math.random() < 0.72 ? AMBER : CYAN) });
        }

        // IC packages with traces fanning out of their pins
        const wantChips = W > 1100 ? 4 : W > 700 ? 3 : 2;
        for (let tries = 0; tries < 60 && chips.length < wantChips; tries++) {
            const cw = randInt(3, 5), ch = randInt(3, 5);
            const c0 = randInt(3, cols - cw - 4), r0 = randInt(4, rows - ch - 4);
            let ok = true;
            for (let c = c0 - 3; c <= c0 + cw + 3 && ok; c++)
                for (let r = r0 - 3; r <= r0 + ch + 3 && ok; r++)
                    if (!free(c, r)) ok = false;
            if (!ok) continue;
            for (let c = c0; c <= c0 + cw; c++) for (let r = r0; r <= r0 + ch; r++) mark(c, r);
            const chip = { c0, r0, cw, ch, label: CHIP_LABELS[chips.length % CHIP_LABELS.length], pins: [] };
            chips.push(chip);
            const color = chips.length % 2 ? AMBER : CYAN;
            for (let r = r0 + 1; r < r0 + ch; r++) {
                chip.pins.push([c0, r], [c0 + cw, r]);
                route(c0 - 1, r, 4, color);
                route(c0 + cw + 1, r, 0, color);
            }
            for (let c = c0 + 1; c < c0 + cw; c++) {
                chip.pins.push([c, r0], [c, r0 + ch]);
                route(c, r0 - 1, 6, color);
                route(c, r0 + ch + 1, 2, color);
            }
        }

        // free-running traces to fill the board
        const target = Math.round((W * H) / 6500);
        for (let tries = 0; tries < target * 4 && traces.length < target; tries++) {
            route(randInt(0, cols - 1), randInt(0, rows - 1), randInt(0, 3) * 2);
        }
    }

    // ── static layers ──
    function drawBoard(g, alpha, width, withChips) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.lineCap = 'round';
        g.lineJoin = 'round';

        traces.forEach(t => {
            g.strokeStyle = `rgba(${t.color},${alpha})`;
            g.lineWidth = width;
            g.beginPath();
            g.moveTo(t.P[0].x, t.P[0].y);
            for (let i = 1; i < t.P.length; i++) g.lineTo(t.P[i].x, t.P[i].y);
            g.stroke();

            // vias at both ends
            [t.P[0], t.P[t.P.length - 1]].forEach(p => {
                g.beginPath();
                g.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
                g.fillStyle = `rgba(6,9,14,1)`;
                g.fill();
                g.lineWidth = 1.2;
                g.strokeStyle = `rgba(${t.color},${Math.min(1, alpha * 1.6)})`;
                g.stroke();
            });
        });

        if (!withChips) return;
        chips.forEach(ch => {
            const x = ch.c0 * G, y = ch.r0 * G, w = ch.cw * G, h = ch.ch * G;
            g.fillStyle = 'rgba(12,18,28,0.95)';
            g.strokeStyle = `rgba(${AMBER},${alpha * 1.8})`;
            g.lineWidth = 1;
            g.beginPath();
            g.roundRect ? g.roundRect(x + 4, y + 4, w - 8, h - 8, 4) : g.rect(x + 4, y + 4, w - 8, h - 8);
            g.fill();
            g.stroke();
            // pin pads
            g.fillStyle = `rgba(${AMBER},${alpha * 2.2})`;
            ch.pins.forEach(([pc, pr]) => g.fillRect(pc * G - 3, pr * G - 3, 6, 6));
            // pin-1 marker + label
            g.beginPath();
            g.arc(x + 12, y + 12, 2.2, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = `rgba(200,215,230,${alpha * 2.4})`;
            g.font = '500 10px "JetBrains Mono", monospace';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(ch.label, x + w / 2, y + h / 2);
        });
    }

    function build() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = hero.clientWidth;
        H = hero.clientHeight;
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);

        generate();
        baseLayer   = makeCanvas(canvas.width, canvas.height);
        brightLayer = makeCanvas(canvas.width, canvas.height);
        drawBoard(baseLayer.getContext('2d'), 0.16, 1.4, true);
        drawBoard(brightLayer.getContext('2d'), 0.75, 1.8, true);
        pulses = []; sparks = [];

        if (!running) renderStatic();
    }

    function renderStatic() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseLayer, 0, 0);
    }

    // ── pulses ──
    function pointAt(t, s) {
        s = Math.max(0, Math.min(t.total, s));
        let i = 1;
        while (i < t.lens.length - 1 && t.lens[i] < s) i++;
        const a = t.P[i - 1], b = t.P[i];
        const seg = t.lens[i] - t.lens[i - 1] || 1;
        const k = (s - t.lens[i - 1]) / seg;
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, i };
    }

    function spawnPulse(t, fromEnd) {
        if (!t) return;
        const rev = fromEnd === undefined ? Math.random() < 0.5 : fromEnd;
        pulses.push({ t, rev, s: 0, speed: rand(140, 300), tail: rand(40, 90), done: false });
    }

    function spawnNearMouse() {
        const R = 140;
        const near = [];
        for (const t of traces) {
            const a = t.P[0], b = t.P[t.P.length - 1];
            const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            const db = Math.hypot(b.x - mouse.x, b.y - mouse.y);
            if (da < R || db < R) near.push([t, db < da]);
        }
        if (near.length) {
            const [t, fromEnd] = near[Math.floor(Math.random() * near.length)];
            spawnPulse(t, fromEnd);
        }
    }

    function drawPulse(p) {
        const t = p.t;
        const headS = p.s, tailS = Math.max(0, p.s - p.tail);
        const toTrace = s => (p.rev ? t.total - s : s);
        const head = pointAt(t, toTrace(Math.min(headS, t.total)));
        const tail = pointAt(t, toTrace(tailS));

        // tail path following the trace vertices
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        if (!p.rev) {
            for (let i = tail.i; i < head.i; i++) ctx.lineTo(t.P[i].x, t.P[i].y);
        } else {
            for (let i = tail.i - 1; i >= head.i; i--) ctx.lineTo(t.P[i].x, t.P[i].y);
        }
        ctx.lineTo(head.x, head.y);
        const grd = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        grd.addColorStop(0, `rgba(${t.color},0)`);
        grd.addColorStop(1, `rgba(${t.color},0.95)`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (headS <= t.total) {
            const s = 26;
            ctx.drawImage(glowSprite[t.color], head.x - s / 2, head.y - s / 2, s, s);
        }
    }

    function frame(now) {
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseLayer, 0, 0);

        // spotlight: reveal the bright board around the cursor
        if (mouse.inside) {
            const R = 190 * dpr;
            const cx = mouse.x * dpr, cy = mouse.y * dpr;
            const sx = Math.max(0, Math.floor(cx - R)), sy = Math.max(0, Math.floor(cy - R));
            const sw = Math.min(canvas.width - sx, Math.ceil(R * 2)), sh = Math.min(canvas.height - sy, Math.ceil(R * 2));
            if (sw > 0 && sh > 0) {
                const g = spot.getContext('2d');
                g.globalCompositeOperation = 'source-over';
                g.clearRect(0, 0, spot.width, spot.height);
                g.drawImage(brightLayer, sx, sy, sw, sh, 0, 0, sw, sh);
                g.globalCompositeOperation = 'destination-in';
                const grd = g.createRadialGradient(cx - sx, cy - sy, 0, cx - sx, cy - sy, R);
                grd.addColorStop(0, 'rgba(0,0,0,1)');
                grd.addColorStop(0.55, 'rgba(0,0,0,0.45)');
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = grd;
                g.fillRect(0, 0, sw, sh);
                ctx.drawImage(spot, 0, 0, sw, sh, sx, sy, sw, sh);
            }
        }

        // spawn
        const maxPulses = Math.round(Math.min(34, 10 + (W * H) / 70000));
        spawnTimer -= dt;
        if (spawnTimer <= 0 && pulses.length < maxPulses) {
            spawnPulse(traces[Math.floor(Math.random() * traces.length)]);
            spawnTimer = rand(0.06, 0.22);
        }
        if (mouse.inside) {
            mouseSpawnTimer -= dt;
            if (mouseSpawnTimer <= 0 && pulses.length < maxPulses + 14) {
                spawnNearMouse();
                mouseSpawnTimer = 0.07;
            }
        }

        // pulses
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.s += p.speed * dt;
            if (!p.done && p.s >= p.t.total) {
                p.done = true;
                const end = p.rev ? p.t.P[0] : p.t.P[p.t.P.length - 1];
                sparks.push({ x: end.x, y: end.y, life: 1, color: p.t.color });
            }
            if (p.s - p.tail > p.t.total) { pulses.splice(i, 1); continue; }
            drawPulse(p);
        }

        // via flashes
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.life -= dt * 2.2;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, 3 + (1 - s.life) * 9, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${s.color},${s.life * 0.8})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color},${s.life})`;
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(frame);
    }

    function start() {
        if (running || prefersReducedMotion || !visible || document.hidden) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
    }

    function stop() { running = false; }

    glowSprite[AMBER] = makeGlow(AMBER);
    glowSprite[CYAN]  = makeGlow(CYAN);
    spot = makeCanvas(Math.ceil(190 * 2 * 2) + 2, Math.ceil(190 * 2 * 2) + 2);

    build();

    let resizeTimer;
    let lastW = W;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // ignore height-only changes (mobile URL bar) to avoid reshuffling the board
            if (hero.clientWidth === lastW && Math.abs(hero.clientHeight - H) < 120) return;
            lastW = hero.clientWidth;
            build();
        }, 200);
    });

    if (finePointer) {
        hero.addEventListener('pointermove', e => {
            const r = hero.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
            mouse.inside = true;
        });
        hero.addEventListener('pointerleave', () => { mouse.inside = false; });
    }

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        visible ? start() : stop();
    }).observe(hero);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
}

// ─── SCROLL REVEAL ───
function initReveal() {
    const items = $$('.reveal');

    // stagger siblings that enter together
    const groups = new Map();
    items.forEach(el => {
        const list = groups.get(el.parentElement) || [];
        list.push(el);
        groups.set(el.parentElement, list);
    });
    groups.forEach(list => list.forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 0.09}s`)));

    const finish = el => {
        el.classList.remove('reveal', 'is-visible');
        el.style.removeProperty('--d');
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        items.forEach(finish);
        return;
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            obs.unobserve(el);
            el.classList.add('is-visible');
            // hand transforms back to the card (tilt) once the reveal has played
            const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
            setTimeout(() => finish(el), 850 + delay * 1000);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => obs.observe(el));
    window.__finishReveal = finish;
}

// ─── COUNT-UP STATS ───
function initCounters() {
    const counters = $$('.count');
    if (prefersReducedMotion) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            const el = entry.target;
            const to = parseInt(el.dataset.to, 10);
            const dur = 1400;
            const t0 = performance.now();
            (function tick(now) {
                const k = Math.min(1, (now - t0) / dur);
                const eased = 1 - Math.pow(1 - k, 3);
                el.textContent = Math.round(to * eased);
                if (k < 1) requestAnimationFrame(tick);
            })(t0);
        });
    }, { threshold: 0.6 });

    counters.forEach(el => { el.textContent = '0'; obs.observe(el); });
}

// ─── SMOOTH 3D TILT ───
function initTilt() {
    if (!finePointer || prefersReducedMotion) return;

    $$('.tilt').forEach(card => {
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);

        let tx = 0, ty = 0;   // target rotation
        let cx = 0, cy = 0;   // current rotation
        let hovered = false;
        let raf = null;

        function tick() {
            cx += (tx - cx) * 0.1;
            cy += (ty - cy) * 0.1;

            const lift = hovered ? 6 : 0;
            card.style.transform =
                `perspective(1000px) rotateX(${cy}deg) rotateY(${cx}deg) translateZ(${lift}px)`;

            const gx = 50 + cx * 5;
            const gy = 50 - cy * 5;
            glare.style.background =
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(234,165,42,0.12) 0%, transparent 60%)`;
            glare.style.opacity = hovered ? '1' : '0';

            const moving = Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01;
            if (hovered || moving) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = null;
                card.style.transform = '';
            }
        }

        card.addEventListener('mouseenter', () => {
            if (card.classList.contains('reveal') || card.classList.contains('is-filtered-in')) return;
            hovered = true;
            if (!raf) raf = requestAnimationFrame(tick);
        });

        card.addEventListener('mousemove', e => {
            if (!hovered) return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            tx =  px * 10;
            ty = -py * 8;
        });

        card.addEventListener('mouseleave', () => {
            hovered = false;
            tx = 0; ty = 0;
            if (!raf) raf = requestAnimationFrame(tick);
        });
    });
}

// ─── LIGHTBOX ───
const lightbox = (() => {
    const box     = $('.lightbox');
    const img     = $('.lb-figure img', box);
    const caption = $('.lb-figure figcaption', box);
    const prev    = $('.lb-prev', box);
    const next    = $('.lb-next', box);
    let items = [], index = 0, title = '', returnFocus = null;

    function render() {
        const it = items[index];
        img.src = it.src;
        img.alt = it.alt;
        caption.textContent = items.length > 1
            ? `${title} — ${index + 1} / ${items.length}`
            : title;
        prev.hidden = next.hidden = items.length < 2;
    }

    function open(list, start, heading) {
        items = list; index = start; title = heading;
        returnFocus = document.activeElement;
        render();
        box.hidden = false;
        document.documentElement.style.overflow = 'hidden';
        requestAnimationFrame(() => box.classList.add('is-open'));
        $('.lb-close', box).focus();
    }

    function close() {
        box.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        setTimeout(() => { box.hidden = true; img.src = ''; }, 250);
        if (returnFocus) returnFocus.focus();
    }

    const go = d => { index = (index + d + items.length) % items.length; render(); };

    $('.lb-close', box).addEventListener('click', close);
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft' && items.length > 1) go(-1);
        if (e.key === 'ArrowRight' && items.length > 1) go(1);
        if (e.key === 'Tab') { // keep focus inside the dialog
            const f = $$('button:not([hidden])', box);
            const i = f.indexOf(document.activeElement);
            e.preventDefault();
            f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
    });

    let x0 = null;
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
        if (x0 === null || items.length < 2) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        x0 = null;
    });

    return { open };
})();

// ─── PROJECT GALLERIES ───
function initGalleries() {
    $$('.gallery').forEach(gallery => {
        const slides = $$('.slide', gallery);
        const title  = gallery.dataset.title || '';
        let index = 0;

        gallery.tabIndex = 0;
        gallery.setAttribute('role', 'button');
        gallery.setAttribute('aria-label', `Open images: ${title}`);

        const zoom = document.createElement('span');
        zoom.className = 'gallery-zoom';
        zoom.setAttribute('aria-hidden', 'true');
        zoom.innerHTML = '<i class="fas fa-expand"></i>';
        gallery.appendChild(zoom);

        let dots = [];
        const show = i => {
            index = (i + slides.length) % slides.length;
            slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
            dots.forEach((d, k) => d.classList.toggle('is-active', k === index));
        };

        if (slides.length > 1) {
            ['prev', 'next'].forEach(dir => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = `gallery-btn gallery-btn--${dir}`;
                b.setAttribute('aria-label', dir === 'prev' ? 'Previous image' : 'Next image');
                b.innerHTML = `<i class="fas fa-chevron-${dir === 'prev' ? 'left' : 'right'}" aria-hidden="true"></i>`;
                b.addEventListener('click', e => { e.stopPropagation(); show(index + (dir === 'prev' ? -1 : 1)); });
                gallery.appendChild(b);
            });

            const wrap = document.createElement('div');
            wrap.className = 'gallery-dots';
            dots = slides.map((_, k) => {
                const d = document.createElement('button');
                d.type = 'button';
                d.setAttribute('aria-label', `Show image ${k + 1}`);
                d.addEventListener('click', e => { e.stopPropagation(); show(k); });
                wrap.appendChild(d);
                return d;
            });
            gallery.appendChild(wrap);
            show(0);

            let x0 = null, swiped = false;
            gallery.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; swiped = false; }, { passive: true });
            gallery.addEventListener('touchend', e => {
                if (x0 === null) return;
                const dx = e.changedTouches[0].clientX - x0;
                if (Math.abs(dx) > 40) { swiped = true; show(index + (dx < 0 ? 1 : -1)); }
                x0 = null;
            });
            gallery.addEventListener('click', e => { if (swiped) { e.stopImmediatePropagation(); swiped = false; } }, true);
        }

        const openBox = () => lightbox.open(
            slides.map(s => { const im = $('img', s); return { src: im.currentSrc || im.src, alt: im.alt }; }),
            index, title
        );
        gallery.addEventListener('click', openBox);
        gallery.addEventListener('keydown', e => {
            if (e.target !== gallery) return;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(); }
        });
    });
}

// ─── PROJECT FILTERS ───
function initFilters() {
    const buttons = $$('.filter');
    const cards   = $$('.project-card');

    buttons.forEach(btn => {
        const f = btn.dataset.filter;
        const n = f === 'all' ? cards.length : cards.filter(c => c.dataset.cat.split(' ').includes(f)).length;
        const count = document.createElement('span');
        count.className = 'filter-count';
        count.textContent = n;
        btn.appendChild(count);

        btn.addEventListener('click', () => {
            buttons.forEach(b => {
                b.classList.toggle('is-active', b === btn);
                b.setAttribute('aria-pressed', String(b === btn));
            });
            let shown = 0;
            cards.forEach(card => {
                if (window.__finishReveal && card.classList.contains('reveal')) window.__finishReveal(card);
                const match = f === 'all' || card.dataset.cat.split(' ').includes(f);
                card.classList.toggle('is-hidden', !match);
                card.classList.remove('is-filtered-in');
                card.style.transform = '';
                if (match) {
                    void card.offsetWidth; // restart the entrance animation
                    card.style.animationDelay = `${shown++ * 0.06}s`;
                    card.classList.add('is-filtered-in');
                }
            });
        });
    });

    cards.forEach(card => card.addEventListener('animationend', () => {
        card.classList.remove('is-filtered-in');
        card.style.animationDelay = '';
    }));
}

// ─── JOB DURATIONS ───
function initDurations() {
    const now = new Date();
    const parse = s => { const [y, m] = s.split('-').map(Number); return { y, m }; };

    $$('.job[data-start]').forEach(job => {
        const a = parse(job.dataset.start);
        const b = job.dataset.end ? parse(job.dataset.end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
        const months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
        const yrs = Math.floor(months / 12), mos = months % 12;
        const parts = [];
        if (yrs) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`);
        if (mos) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`);
        const out = $('.job-duration', job);
        if (out) out.textContent = parts.join(' ');
    });
}

// ─── COPY EMAIL + TOAST ───
function toast(msg) {
    const t = $('.toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('is-visible'), 2200);
}

function initCopyEmail() {
    $$('.copy-email').forEach(btn => {
        const label = $('span', btn);
        btn.addEventListener('click', async () => {
            const email = btn.dataset.email;
            try {
                await navigator.clipboard.writeText(email);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = email;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            btn.classList.add('is-copied');
            label.textContent = 'Copied!';
            toast('Email copied to clipboard');
            setTimeout(() => { btn.classList.remove('is-copied'); label.textContent = 'Copy email'; }, 2200);
        });
    });
}

// ─── MISC ───
function initMarquee() {
    const track = $('.marquee-track');
    if (!track) return;
    Array.from(track.children).forEach(el => track.appendChild(el.cloneNode(true)));
}

function initYear() {
    $$('.year').forEach(el => { el.textContent = new Date().getFullYear(); });
}

// ─── INIT ───
initHeader();
initActiveNav();
initMobileMenu();
initGlow();
initTyped();
initTerminal();
initReveal();
initCounters();
initGalleries();
initFilters();
initDurations();
initCopyEmail();
initMarquee();
initYear();
initTilt();

// canvas after fonts so chip labels render in JetBrains Mono
(document.fonts ? document.fonts.ready : Promise.resolve()).then(initPCB);

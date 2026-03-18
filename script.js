// ─── NAV SCROLL HIGHLIGHT ───
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

function handleScroll() {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}
window.addEventListener('scroll', handleScroll);

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ─── MOBILE MENU ───
const mobileMenu = document.querySelector('.mobile-menu');
const nav = document.querySelector('nav');
mobileMenu.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

// ─── PROGRESS BARS ───
const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fillProgress 1.5s ease forwards';
        }
    });
});
document.querySelectorAll('.progress-fill').forEach(el => progressObserver.observe(el));

// ─── SMOOTH 3D TILT ───
function initTilt() {
    const cards = document.querySelectorAll(
        '.skill-card, .project-card, .experience-content, .education-card'
    );

    cards.forEach(card => {
        // inject glare layer
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);

        let tx = 0, ty = 0;   // target rotation
        let cx = 0, cy = 0;   // current rotation
        let hovered = false;
        let raf = null;

        function tick() {
            cx += (tx - cx) * 0.09;
            cy += (ty - cy) * 0.09;

            const liftZ = hovered ? 10 : 0;
            card.style.transform =
                `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) translateZ(${liftZ}px)`;

            // glare follows light direction
            const gx = 50 + cx * 4;
            const gy = 50 - cy * 4;
            glare.style.background =
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(232,160,32,0.13) 0%, transparent 65%)`;
            glare.style.opacity = hovered ? '1' : '0';

            const stillMoving = Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01;
            if (hovered || stillMoving) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = null;
                card.style.transform = '';
            }
        }

        card.addEventListener('mouseenter', () => {
            hovered = true;
            if (!raf) raf = requestAnimationFrame(tick);
        });

        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 to 0.5
            const py = (e.clientY - r.top)  / r.height - 0.5;
            tx =  px * 18;
            ty = -py * 12;
        });

        card.addEventListener('mouseleave', () => {
            hovered = false;
            tx = 0; ty = 0;
            if (!raf) raf = requestAnimationFrame(tick);
        });
    });
}

// ─── HERO PARALLAX (mouse) ───
function initHeroParallax() {
    const heroContent = document.querySelector('.hero-content');
    const heroImg     = document.querySelector('.hero-img-wrapper');
    if (!heroContent || !heroImg) return;

    let mx = 0, my = 0;
    let cx = 0, cy = 0;

    function tick() {
        cx += (mx - cx) * 0.06;
        cy += (my - cy) * 0.06;
        heroContent.style.transform = `translate(${cx * 0.35}px, ${cy * 0.2}px)`;
        heroImg.style.transform     = `translate(${-cx * 0.55}px, ${-cy * 0.35}px)`;
        requestAnimationFrame(tick);
    }

    document.querySelector('.hero').addEventListener('mousemove', e => {
        const r = document.querySelector('.hero').getBoundingClientRect();
        mx = (e.clientX - r.left - r.width  / 2) * 0.045;
        my = (e.clientY - r.top  - r.height / 2) * 0.045;
    });

    document.querySelector('.hero').addEventListener('mouseleave', () => {
        mx = 0; my = 0;
    });

    raf = requestAnimationFrame(tick);
}

// ─── MOUSE-FOLLOWING BACKGROUND ───
document.addEventListener('mousemove', e => {
    const bgBlur = document.querySelector('.bg-blur');
    const x = (e.clientX / window.innerWidth)  * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    bgBlur.style.background = `
        radial-gradient(ellipse 55% 50% at ${x}% ${y}%, rgba(232,160,32,0.07) 0%, transparent 100%),
        radial-gradient(ellipse 45% 50% at ${100-x}% ${100-y}%, rgba(34,211,238,0.06) 0%, transparent 100%)
    `;
});

// ─── SCROLL REVEAL ───
function initScrollReveal() {
    const items = document.querySelectorAll(
        '.skill-card, .project-card, .experience-item, .education-card, .about-text'
    );

    items.forEach((el, i) => {
        el.style.opacity  = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.55s ease ${(i % 4) * 0.08}s, transform 0.55s ease ${(i % 4) * 0.08}s`;
    });

    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach(el => revealObs.observe(el));
}

// ─── TYPING EFFECT ───
const subtitles = [
    'Embedded Systems Engineer',
   
];
let subtitleIndex = 0;
let charIndex = 0;
const subtitleElement = document.querySelector('.subtitle');
if (subtitleElement) subtitleElement.textContent = '';

function typeSubtitle() {
    if (!subtitleElement) return;
    if (charIndex < subtitles[subtitleIndex].length) {
        subtitleElement.textContent += subtitles[subtitleIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeSubtitle, 52);
    } else {
        setTimeout(() => {
            charIndex = 0;
            subtitleIndex = (subtitleIndex + 1) % subtitles.length;
            subtitleElement.textContent = '';
            typeSubtitle();
        }, 3000);
    }
}

// ─── CAROUSEL ───
let carouselIndices = {};

function changeCarousel(n, button) {
    const carousel = button.closest('.carousel-container');
    const id = Array.from(carousel.parentElement.parentElement.children)
                    .indexOf(carousel.parentElement);
    updateCarousel(id, n, carousel);
}

function currentCarousel(n, dot) {
    const carousel = dot.closest('.carousel-container');
    const id = Array.from(carousel.parentElement.parentElement.children)
                    .indexOf(carousel.parentElement);
    showCarousel(id, n, carousel);
}

function updateCarousel(id, n, carousel) {
    const images = carousel.querySelectorAll('.carousel-image');
    carouselIndices[id] = (carouselIndices[id] || 0) + n;
    showCarouselImages(carouselIndices[id], images, carousel);
}

function showCarousel(id, n, carousel) {
    carouselIndices[id] = n;
    showCarouselImages(n, carousel.querySelectorAll('.carousel-image'), carousel);
}

function showCarouselImages(index, images, carousel) {
    if (index >= images.length) index = 0;
    if (index < 0) index = images.length - 1;
    images.forEach(img => img.classList.remove('active'));
    images[index].classList.add('active');
    const dots = carousel.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
}

// ─── INIT ───
window.addEventListener('load', () => {
    handleScroll();
    initTilt();
    initHeroParallax();
    initScrollReveal();
    typeSubtitle();
});

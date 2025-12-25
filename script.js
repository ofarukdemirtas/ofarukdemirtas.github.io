// Smooth scrolling and nav highlighting
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

function handleScroll() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
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

// Smooth scroll behavior for nav links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const nav = document.querySelector('nav');

mobileMenu.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

// Animate progress bars on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fillProgress 1.5s ease forwards';
        }
    });
});

document.querySelectorAll('.progress-fill').forEach(fill => {
    observer.observe(fill);
});

// Mouse movement effect on cards
document.querySelectorAll('.skill-card, .project-card, .experience-content, .education-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * 5;
        const rotateY = ((centerX - x) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Mouse-following background effect
document.addEventListener('mousemove', (e) => {
    const bgBlur = document.querySelector('.bg-blur');
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    bgBlur.style.background = `
        radial-gradient(circle at ${x}% ${y}%, rgba(255, 0, 110, 0.25) 0%, transparent 50%),
        radial-gradient(circle at ${100-x}% ${100-y}%, rgba(0, 255, 136, 0.25) 0%, transparent 50%)
    `;
});

// Counter animation for stats
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(interval);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

// Typing effect for hero subtitle
const subtitles = [
    'Embedded Software Engineer',
    'Firmware Developer',
    'IoT Specialist',
    'Problem Solver'
];
let subtitleIndex = 0;
let charIndex = 0;
const subtitleElement = document.querySelector('.subtitle');

function typeSubtitle() {
    if (charIndex < subtitles[subtitleIndex].length) {
        subtitleElement.textContent += subtitles[subtitleIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeSubtitle, 50);
    } else {
        setTimeout(() => {
            charIndex = 0;
            subtitleIndex = (subtitleIndex + 1) % subtitles.length;
            subtitleElement.textContent = '';
            typeSubtitle();
        }, 3000);
    }
}

// Start animations on page load
window.addEventListener('load', () => {
    handleScroll();
});

// Scroll reveal animation
const revealElements = document.querySelectorAll('section, .skill-card, .project-card, .experience-content');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(element => {
    element.style.opacity = '0';
    revealObserver.observe(element);
});

// Carousel functionality
let carouselIndices = {};

function changeCarousel(n, button) {
    const carousel = button.closest('.carousel-container');
    const containerId = Array.from(carousel.parentElement.parentElement.children).indexOf(carousel.parentElement);
    updateCarousel(containerId, n, carousel);
}

function currentCarousel(n, dot) {
    const carousel = dot.closest('.carousel-container');
    const containerId = Array.from(carousel.parentElement.parentElement.children).indexOf(carousel.parentElement);
    showCarousel(containerId, n, carousel);
}

function updateCarousel(id, n, carousel) {
    const images = carousel.querySelectorAll('.carousel-image');
    carouselIndices[id] = (carouselIndices[id] || 0) + n;
    showCarouselImages(carouselIndices[id], images, carousel);
}

function showCarousel(id, n, carousel) {
    const images = carousel.querySelectorAll('.carousel-image');
    carouselIndices[id] = n;
    showCarouselImages(n, images, carousel);
}

function showCarouselImages(index, images, carousel) {
    if (index >= images.length) {
        carouselIndices[0] = 0;
        index = 0;
    }
    if (index < 0) {
        carouselIndices[0] = images.length - 1;
        index = images.length - 1;
    }
    
    images.forEach(img => img.classList.remove('active'));
    images[index].classList.add('active');
    
    const dots = carousel.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
}


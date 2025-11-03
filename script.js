// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

let vantaEffect;
let lanternCursor;
let lanternTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lanternPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lanternAnimating = false;
let lanternSpritePromise;
const interactiveHoverSelector = 'a, button, input, textarea, select, [role="button"], .btn, .nav-link, .social-chip, .project-link, .project-card, .contact-item, .timeline-item';

function initFogBackground() {
    const fogElement = document.getElementById('vanta-bg');
    if (!fogElement || typeof window.VANTA === 'undefined' || typeof window.VANTA.FOG !== 'function' || vantaEffect) {
        return;
    }

    vantaEffect = window.VANTA.FOG({
        el: fogElement,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x111122,
        midtoneColor: 0x1c1c2f,
        lowlightColor: 0x050507,
        baseColor: 0x010103,
        blurFactor: 0.7,
        speed: 0.9,
        zoom: 1.1
    });
}

function initLanternCursor() {
    if (lanternCursor || !window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    lanternCursor = document.createElement('div');
    lanternCursor.className = 'cursor-lantern';
    lanternCursor.innerHTML = '<span class="lantern-body"><span class="lantern-glow"></span><span class="lantern-sprite"></span></span>';
    document.body.appendChild(lanternCursor);
    document.body.classList.add('lantern-enabled');

    const spriteElement = lanternCursor.querySelector('.lantern-sprite');
    prepareLanternSprite(spriteElement);

    const halfWidth = 28;
    const halfHeight = 44;
    const snap = 2;

    const applyTransform = () => {
        const translateX = Math.round((lanternPosition.x - halfWidth) / snap) * snap;
        const translateY = Math.round((lanternPosition.y - halfHeight) / snap) * snap;
        const rotation = Math.max(Math.min((lanternTarget.x - lanternPosition.x) * 0.025, 4), -4);
        lanternCursor.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`;
    };

    applyTransform();

    const animateLantern = () => {
        if (!lanternAnimating) {
            return;
        }

        const smoothing = 0.2;
        lanternPosition.x += (lanternTarget.x - lanternPosition.x) * smoothing;
        lanternPosition.y += (lanternTarget.y - lanternPosition.y) * smoothing;

        applyTransform();

        requestAnimationFrame(animateLantern);
    };

    const hideLantern = () => {
        lanternCursor.style.opacity = '0';
        lanternAnimating = false;
        lanternCursor.removeAttribute('data-animating');
        lanternCursor.style.visibility = 'hidden';
        document.body.classList.remove('lantern-paused');
    };

    const handlePointerMove = (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') {
            hideLantern();
            return;
        }

        if (document.body.classList.contains('lantern-paused')) {
            lanternTarget.x = event.clientX;
            lanternTarget.y = event.clientY;
            return;
        }

        lanternAnimating = true;
        lanternCursor.style.visibility = 'visible';
        lanternCursor.style.opacity = '1';
        lanternTarget.x = event.clientX;
        lanternTarget.y = event.clientY;

        if (!lanternCursor.hasAttribute('data-animating')) {
            lanternCursor.setAttribute('data-animating', 'true');
            requestAnimationFrame(animateLantern);
        }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', hideLantern);
}

function pauseLantern() {
    if (!lanternCursor) {
        return;
    }
    lanternAnimating = false;
    lanternCursor.style.opacity = '0';
    lanternCursor.style.visibility = 'hidden';
    lanternCursor.removeAttribute('data-animating');
    document.body.classList.add('lantern-paused');
}

function resumeLantern() {
    if (!lanternCursor) {
        return;
    }
    document.body.classList.remove('lantern-paused');
    lanternCursor.style.visibility = 'visible';
}

function prepareLanternSprite(targetElement) {
    if (!targetElement) {
        return;
    }
    if (!lanternSpritePromise) {
        lanternSpritePromise = new Promise((resolve) => {
            const img = new Image();
            img.src = 'images.png';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        if (r > 240 && g > 240 && b > 240) {
                            data[i + 3] = 0;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL());
                } catch (error) {
                    resolve('images.png');
                }
            };
            img.onerror = () => resolve('images.png');
        });
    }

    lanternSpritePromise.then((spriteUrl) => {
        targetElement.style.backgroundImage = `url('${spriteUrl}')`;
    });
}

const isInteractiveTarget = (target) => {
    if (!target) {
        return false;
    }
    return Boolean(target.closest(interactiveHoverSelector));
};

document.addEventListener('pointerover', (event) => {
    if (!lanternCursor) {
        return;
    }
    if (isInteractiveTarget(event.target)) {
        pauseLantern();
    }
});

document.addEventListener('pointerout', (event) => {
    if (!lanternCursor) {
        return;
    }
    if (!isInteractiveTarget(event.target)) {
        return;
    }
    if (event.relatedTarget && isInteractiveTarget(event.relatedTarget)) {
        return;
    }
    resumeLantern();
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Create mailto link
        const mailtoLink = `mailto:arianemamjomeh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        showNotification('Thank you! Your email client should open with your message.', 'success');
        
        // Reset form
        this.reset();
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.project-card, .timeline-item, .extracurricular-card, .about-text, .about-skills');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .hamburger.active .bar:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active .bar:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    initFogBackground();
    initLanternCursor();
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        // Uncomment the line below to enable typing effect
        // typeWriter(heroTitle, originalText, 50);
    }
});

// Ensure fog initializes after full asset load as well
window.addEventListener('load', initFogBackground);
window.addEventListener('load', initLanternCursor);

// Add scroll-to-top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #60a5fa;
    color: #0f172a;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
`;

document.body.appendChild(scrollToTopBtn);

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

// Add hover effect to scroll button
scrollToTopBtn.addEventListener('mouseenter', () => {
    scrollToTopBtn.style.transform = 'scale(1.1)';
    scrollToTopBtn.style.background = '#93c5fd';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
    scrollToTopBtn.style.transform = 'scale(1)';
    scrollToTopBtn.style.background = '#60a5fa';
});

// ==================== BACKGROUND ANIMATION ====================
function setupBackgroundAnimation() {
    const container = document.createElement('div');
    container.className = 'particle-network-animation';
    document.body.insertBefore(container, document.body.firstChild);

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-network-canvas';
    container.appendChild(canvas);

    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();

    function getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            particle: isDark ? 'rgba(0, 128, 128, 0.8)' : 'rgba(11, 192, 5, 0.8)',
            line: isDark ? 'rgba(0, 128, 128, 0.3)' : 'rgba(0, 100, 200, 0.3)'
        };
    }

    function initParticles() {
        const particles = [];
        const count = window.innerWidth < 768 ? 80 : 150;
        
        // Start particles from center for better visibility
        const centerX = canvas.width/2;
        const centerY = canvas.height/2;
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: centerX + (Math.random() - 0.5) * 100,
                y: centerY + (Math.random() - 0.5) * 100,
                size: Math.random() * 2 + 1.5, // Larger particles
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4
            });
        }
        return particles;
    }

    function animate() {
        const ctx = canvas.getContext('2d');
        const particles = initParticles();
        let mouseX = null, mouseY = null;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function draw() {
            const colors = getThemeColors();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                
                // Bounce with some randomness
                if (p.x < 0 || p.x > canvas.width) {
                    p.speedX *= -1;
                    p.speedY += (Math.random() - 0.5) * 0.5;
                }
                if (p.y < 0 || p.y > canvas.height) {
                    p.speedY *= -1;
                    p.speedX += (Math.random() - 0.5) * 0.5;
                }
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.particle;
                ctx.fill();
                
                // Draw connections
                particles.forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 150 && p !== p2) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = colors.line;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                });
                
                // Mouse interaction
                if (mouseX && mouseY) {
                    const dx = p.x - mouseX;
                    const dy = p.y - mouseY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 150) {
                        const force = (150 - distance) / 30;
                        p.x += dx/distance * force;
                        p.y += dy/distance * force;
                    }
                }
            });
            
            requestAnimationFrame(draw);
        }
        
        draw();
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    animate();
}

function setupTypingAnimation() {
    const element = document.getElementById("typed-name");
    const text = "Ali Shan";
    let index = 0;
    let isTyping = true;

    if (!element) return;

    function type() {
        if (isTyping) {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 150); // Typing speed in ms
            } else {
                // Wait a bit before starting to erase
                setTimeout(() => {
                    isTyping = false;
                    type();
                }, 1000);
            }
        } else {
            if (index > 0) {
                element.textContent = text.substring(0, index - 1);
                index--;
                setTimeout(type, 100); // Erasing speed in ms (can be different from typing)
            } else {
                // Wait a bit before starting to type again
                setTimeout(() => {
                    isTyping = true;
                    type();
                }, 500);
            }
        }
    }

    type();
}

// ==================== CORE FUNCTIONALITY ====================
function initTheme() {
    const themeToggle = document.getElementById('theme-checkbox');
    if (!themeToggle) return;

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the saved theme or system preference
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = (savedTheme === 'dark');
    } else {
        const initialTheme = systemPrefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', initialTheme);
        themeToggle.checked = systemPrefersDark;
    }

    // Theme toggle event with animation
    themeToggle.addEventListener('change', function() {
        document.documentElement.classList.add('theme-transition');
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 500);
    });
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking outside or on a link
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && !e.target.closest('.hamburger')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length > 0 && navItems.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            const scrollPosition = window.scrollY + 200;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${current}`) {
                    item.classList.add('active');
                }
            });
        });
    }
}

// ==================== ANIMATIONS ====================
function setupAnimations() {
    // Intersection Observer for scroll animations
    const animatableElements = document.querySelectorAll(
        '.section, .project-card, .repo-card,  .skill-item, .hero-content'
    );
    
    if (animatableElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatableElements.forEach(el => observer.observe(el));
    }

    // Animate skill bars on home page
    const skillBars = document.querySelectorAll('.skill-level');
    if (skillBars.length > 0) {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    bar.style.width = '0';
                    bar.style.transition = 'width 1.5s ease-out';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                    skillObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => skillObserver.observe(bar));
    }

    // Project card hover effects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const image = card.querySelector('.project-image');
        const info = card.querySelector('.project-info');
        
        if (image && info) {
            card.addEventListener('mouseenter', () => {
                image.style.transform = 'scale(1.03)';
                image.style.transition = 'transform 0.3s ease';
                info.style.transform = 'translateY(-5px)';
                info.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1)';
                info.style.transform = 'translateY(0)';
            });
        }
    });
}

// ==================== PROJECT FILTERS ====================
function setupProjects() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Get filter value
                const filterValue = button.getAttribute('data-filter');
                
                // Filter projects
                projectCards.forEach(card => {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                        
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 200);
                });
            });
        });
    }
}

// ==================== CONTACT FORM ====================
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    if (!contactForm) return;

    const inputs = contactForm.querySelectorAll('input, textarea');
    
    // Input validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });
        
        // Clear validation on focus
        input.addEventListener('focus', () => {
            input.classList.remove('invalid');
        });
    });

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Validate form
        let isValid = true;
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('invalid');
                isValid = false;
            }
        });
        
        if (!isValid) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            // Simulate API call (replace with actual fetch)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success state
            submitButton.innerHTML = '<i class="fas fa-check"></i> Sent!';
            this.reset();
            showToast('Message sent successfully!', 'success');
            
            // Reset button after delay
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }, 3000);
        } catch (error) {
            // Show error state
            submitButton.innerHTML = '<i class="fas fa-times"></i> Error';
            showToast('Failed to send message. Please try again.', 'error');
            
            // Reset button after delay
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }, 3000);
        }
    });
}

// ==================== UI UTILITIES ====================
function setupUI() {
    // Toast notifications
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    };

    // Back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.title = 'Back to top';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Update copyright year
    const footerYear = document.querySelector('footer p');
    if (footerYear) {
        footerYear.textContent = `© ${new Date().getFullYear()} Ali Shan. All rights reserved.`;
    }

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.onload = () => img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupNavigation();
    setupAnimations();
    setupProjects();
    setupContactForm();
    setupUI();
    setupTypingAnimation();
    setupBackgroundAnimation(); // Add this line
});

// Load non-critical resources after page load
window.addEventListener('load', () => {
    // Load Font Awesome if not already loaded
    if (!document.querySelector('.fa') && !document.querySelector('script[src*="fontawesome"]')) {
        const faScript = document.createElement('script');
        faScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
        document.body.appendChild(faScript);
    }
});
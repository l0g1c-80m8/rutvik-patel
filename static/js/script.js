function initPageScripts() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const open = mobileMenu.classList.toggle('is-open');
            mobileMenuBtn.textContent = open ? 'CLOSE' : 'MENU';
        });
    }

    // Smooth scrolling for navigation links.
    // Use getBoundingClientRect() + scrollY rather than offsetTop, because
    // every section is inside a position:relative custom element (e.g.
    // <research-section>), which makes offsetTop measure ~0 against the
    // host element instead of the document.
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            const top = targetElement.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });

            if (mobileMenu && mobileMenu.classList.contains('is-open')) {
                mobileMenu.classList.remove('is-open');
                if (mobileMenuBtn) mobileMenuBtn.textContent = 'MENU';
            }
        });
    });

    // Publication filter functionality
    const publicationFilters = document.querySelectorAll('.publication-filter');
    const publicationCards = document.querySelectorAll('.publication-card');

    publicationFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            publicationFilters.forEach(f => {
                f.classList.remove('active', 'bg-robot-blue', 'text-dark-bg');
                f.classList.add('text-gray-300');
            });
            
            // Add active class to clicked filter
            this.classList.add('active', 'bg-robot-blue', 'text-dark-bg');
            this.classList.remove('text-gray-300');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter cards
            publicationCards.forEach(card => {
                if (filterValue === 'all' || card.classList.contains(filterValue)) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Navbar scroll state — keep nav visible always, just toggle 'scrolled'
    const navbar = document.querySelector('nav.tlm-nav') || document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (!navbar) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        navbar.classList.toggle('scrolled', scrollTop > 24);
    });

    // Intersection Observer for section highlighting in navbar
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        rootMargin: '-100px 0px -66% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            document.querySelectorAll('.tlm-nav-links a').forEach(link => {
                link.classList.toggle('is-active', link.dataset.section === entry.target.id);
            });
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Animated counters for statistics
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            element.textContent = Math.floor(start);
            
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }

    // Initialize counters when they come into view
    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // (Telemetry: parallax on hero and 3D card-tilt removed — they fight the hairline aesthetic.)

    // Typewriter effect for hero text
    function typeWriter(element, text, speed = 100) {
        if (!element) return;
        
        let i = 0;
        element.innerHTML = '';
        element.style.borderRight = '2px solid #00d4ff';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        }
        
        type();
    }

    // Initialize typewriter effect for hero subtitle
    const heroSubtitle = document.querySelector('.hero-typewriter');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, text, 80);
        }, 1000);
    }

    // Form submission handling
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const formData = new FormData(this);
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual implementation)
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Message Sent!';
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-success');
                
                // Reset form
                this.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.add('btn-primary');
                    submitBtn.classList.remove('btn-success');
                }, 3000);
            }, 1500);
        });
    }

    // Loading animation for project media buttons
    const mediaButtons = document.querySelectorAll('.media-btn');
    mediaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const icon = this.querySelector('i');
            const originalClass = icon.className;
            
            // Show loading spinner
            icon.className = 'fas fa-spinner fa-spin';
            button.disabled = true;
            
            // Simulate loading
            setTimeout(() => {
                icon.className = originalClass;
                button.disabled = false;
                
                console.log('Opening:', this.textContent.trim());
                
                // Show a simple notification
                showNotification('Opening media content...', 'info');
            }, 1000);
        });
    });

    // Search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function() {
                const query = this.value.toLowerCase();
                const searchableElements = document.querySelectorAll('[data-searchable]');
                
                searchableElements.forEach(element => {
                    const text = element.textContent.toLowerCase();
                    const parent = element.closest('.publication-card, .project-card, .bg-dark-card');
                    
                    if (text.includes(query) || query === '') {
                        parent.style.display = 'block';
                        parent.classList.add('search-visible');
                    } else {
                        parent.style.display = 'none';
                        parent.classList.remove('search-visible');
                    }
                });
            }, 300));
        }
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    initializeSearch();

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button class="notification-close ml-auto">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.textContent = '^';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
    }

    // Skills animation
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const percentage = skillBar.dataset.percentage;
                const progressBar = skillBar.querySelector('.skill-progress');
                
                if (progressBar) {
                    setTimeout(() => {
                        progressBar.style.width = percentage + '%';
                    }, 200);
                }
                
                skillObserver.unobserve(skillBar);
            }
        });
    });

    skillBars.forEach(skill => {
        skillObserver.observe(skill);
    });

    // Dark mode toggle (if implemented)
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
            
            const icon = darkModeToggle.querySelector('i');
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
    }
}

const NUM_COMPONENTS = 9; // Total number of components to load

window.dynamicComponentTracker = {
    expected: NUM_COMPONENTS,
    loaded: 0,
    markExpected() {
        this.expected++;
    },
    markLoaded() {
        this.loaded++;
        if (this.loaded === this.expected) {
            console.log('🍉 All components loaded');
            initPageScripts();
        }
    }
};

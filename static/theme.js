class ThemeManager {
  constructor() {
    this.themes = ['light', 'dark'];
    this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupToggleButton();
    this.setupSystemThemeListener();
    this.setupPageTransitions();
    this.setupSmoothScrolling();
  }

  getStoredTheme() {
    return localStorage.getItem('documentation-theme');
  }

  getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setStoredTheme(theme) {
    localStorage.setItem('documentation-theme', theme);
  }

  applyTheme(theme) {
    // Add transition class for smooth theme switching
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
      document.body.className = `${theme} theme-transitioning`;
      this.updateThemeIcon(theme);
      this.currentTheme = theme;
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 300);
    }, 50);
  }

  updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      // Add rotation animation
      themeIcon.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        themeIcon.style.transform = 'rotate(0deg)';
      }, 150);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    
    // Add ripple effect to toggle button
    this.createRippleEffect();
    
    this.applyTheme(newTheme);
    this.setStoredTheme(newTheme);
  }

  createRippleEffect() {
    const toggleButton = document.getElementById('themeToggle');
    if (!toggleButton) return;

    const ripple = document.createElement('span');
    const rect = toggleButton.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${rect.width / 2 - size / 2}px;
      top: ${rect.height / 2 - size / 2}px;
    `;

    // Add keyframes for ripple animation
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    toggleButton.style.position = 'relative';
    toggleButton.style.overflow = 'hidden';
    toggleButton.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  setupToggleButton() {
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });

      // Add hover sound effect (optional)
      toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.transform = 'scale(1.05)';
      });

      toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.transform = 'scale(1)';
      });
    }
  }

  setupSystemThemeListener() {
    if (!this.getStoredTheme()) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  setupPageTransitions() {
    // Add loading animation for page navigation
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href && !e.target.href.startsWith('#')) {
        const content = document.querySelector('.content');
        if (content) {
          content.style.opacity = '0.7';
          content.style.transform = 'translateY(10px)';
        }
      }
    });

    // Animate content on load
    window.addEventListener('load', () => {
      this.animateContentElements();
    });
  }

  animateContentElements() {
    const elements = document.querySelectorAll('.content h1, .content h2, .content h3, .content p, .content ul, .content ol, .content table, .content blockquote');
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  setupSmoothScrolling() {
    // Enhanced smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href.includes('#')) {
        e.preventDefault();
        const targetId = e.target.href.split('#')[1];
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    });
  }
}

// Mobile sidebar enhancements
class MobileSidebar {
  constructor() {
    this.init();
  }

  init() {
    if (window.innerWidth <= 768) {
      this.createMobileToggle();
      this.setupMobileInteractions();
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.removeMobileToggle();
      } else if (window.innerWidth <= 768 && !document.querySelector('.mobile-toggle')) {
        this.createMobileToggle();
        this.setupMobileInteractions();
      }
    });
  }

  createMobileToggle() {
    if (document.querySelector('.mobile-toggle')) return;

    const mobileToggle = document.createElement('button');
    mobileToggle.innerHTML = '<span></span><span></span><span></span>';
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation');
    
    mobileToggle.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1001;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 0.75rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 3px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow);
    `;

    // Style the hamburger lines
    const spans = mobileToggle.querySelectorAll('span');
    spans.forEach(span => {
      span.style.cssText = `
        display: block;
        width: 20px;
        height: 2px;
        background: var(--text-primary);
        transition: all 0.3s ease;
        transform-origin: center;
      `;
    });

    document.body.appendChild(mobileToggle);
  }

  setupMobileInteractions() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!mobileToggle || !sidebar) return;

    mobileToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('mobile-open');
      const spans = mobileToggle.querySelectorAll('span');
      
      if (isOpen) {
        sidebar.classList.remove('mobile-open');
        // Reset hamburger animation
        spans[0].style.transform = 'rotate(0deg) translateY(0)';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'rotate(0deg) translateY(0)';
      } else {
        sidebar.classList.add('mobile-open');
        // Animate to X
        spans[0].style.transform = 'rotate(45deg) translateY(5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-5px)';
      }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !mobileToggle.contains(e.target) &&
          sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        
        // Reset hamburger animation
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(0deg) translateY(0)';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'rotate(0deg) translateY(0)';
      }
    });

    // Close sidebar on swipe left (touch devices)
    let startX = 0;
    sidebar.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    sidebar.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 100) { // Swipe left
        sidebar.classList.remove('mobile-open');
      }
    });
  }

  removeMobileToggle() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (mobileToggle) {
      mobileToggle.remove();
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new MobileSidebar();
  
  // Add loading animation
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// Page visibility API for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when tab is not visible
    document.body.style.animationPlayState = 'paused';
  } else {
    // Resume animations when tab becomes visible
    document.body.style.animationPlayState = 'running';
  }
});

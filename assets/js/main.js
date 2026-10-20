/* ============================================================
   VAULT & KEY — ESCAPE ROOM & PUZZLE ADVENTURE VENUE
   MAIN JAVASCRIPT ENGINE (FOUNDATION)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initRTL();
  initHomeDropdown();
  initMobileNavigation();
  initActiveNavigation();
  initHeaderScroll();
  initScrollReveal();
  initRippleEffect();
  initModals();
  initBackToTop();
});

/* ============================================================
   01. THEME ENGINE (Persistent LocalStorage, Light/Dark)
   ============================================================ */
function initTheme() {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('vk_theme');
  // Default to dark theme for immersive mystery/escape room aesthetic unless chosen otherwise
  const initialTheme = savedTheme || 'dark';

  applyTheme(initialTheme, false);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const current = root.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  });
}

function applyTheme(theme, save = true) {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  root.classList.toggle('dark', isDark);
  root.dataset.theme = isDark ? 'dark' : 'light';

  if (save) {
    localStorage.setItem('vk_theme', theme);
  }

  // Update theme icons
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const icon = button.querySelector('.material-symbols-rounded');
    if (icon) {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
    const faIcon = button.querySelector('i');
    if (faIcon) {
      faIcon.classList.toggle('fa-sun', isDark);
      faIcon.classList.toggle('fa-moon', !isDark);
    }
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });

  const desktopThemeIcon = document.getElementById('desktopThemeIcon');
  if (desktopThemeIcon) desktopThemeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';

  document.dispatchEvent(new CustomEvent('vk:themechange', { detail: { theme } }));
}

/* ============================================================
   02. RTL ENGINE (Persistent LocalStorage, Direction Toggle)
   ============================================================ */
function initRTL() {
  const root = document.documentElement;
  const rtlButtons = document.querySelectorAll('[data-rtl-toggle]');
  const savedDir = localStorage.getItem('vk_direction') || 'ltr';

  applyDirection(savedDir, false);

  rtlButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('dir') || 'ltr';
      const next = current === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(next, true);
    });
  });
}

function applyDirection(dir, save = true) {
  const root = document.documentElement;
  root.setAttribute('dir', dir);
  root.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');

  if (save) {
    localStorage.setItem('vk_direction', dir);
  }

  document.querySelectorAll('[data-rtl-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
    btn.setAttribute('title', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
  });

  document.dispatchEvent(new CustomEvent('vk:directionchange', { detail: { dir } }));
}

/* ============================================================
   03. NAVIGATION & DROPDOWNS
   ============================================================ */
function initHomeDropdown() {
  const dropdown = document.querySelector('.vk-nav-dropdown');
  const trigger = document.querySelector('[data-home-dropdown]');

  if (!dropdown || !trigger) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

function initMobileNavigation() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const homeToggle = document.querySelector('[data-mobile-home-toggle]');
  const mobileHome = document.querySelector('.vk-mobile-home');

  function closeMobileNav() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('vk-menu-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      const icon = menuToggle.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = 'menu';
    }
    // When mobile menu closes, home dropdown must close
    if (mobileHome) {
      mobileHome.classList.remove('is-open');
    }
    if (homeToggle) {
      homeToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !mobileMenu.classList.contains('is-open');
      if (willOpen) {
        mobileMenu.classList.add('is-open');
        document.body.classList.add('vk-menu-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        const icon = menuToggle.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = 'close';
      } else {
        closeMobileNav();
      }
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileNav();
      }
    });

    // Close mobile menu and dropdown when any link inside is clicked
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  if (homeToggle && mobileHome) {
    homeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileHome.classList.toggle('is-open');
      homeToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
}

function initActiveNavigation() {
  const path = window.location.pathname.toLowerCase();
  let currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  if (!currentPage || currentPage === '/' || currentPage === 'index.html') {
    currentPage = 'index.html';
  }

  const isHome = currentPage === 'index.html' || currentPage === 'home-2.html';

  // 1. Highlight Desktop Home Trigger if on Home 1 or Home 2
  const desktopHomeTrigger = document.querySelector('[data-home-dropdown]');
  if (desktopHomeTrigger) {
    desktopHomeTrigger.classList.toggle('is-current', isHome);
  }

  // 2. Highlight Mobile Home Trigger and Container if on Home 1 or Home 2
  const mobileHome = document.querySelector('.vk-mobile-home');
  const mobileHomeTrigger = document.querySelector('[data-mobile-home-toggle]');
  if (mobileHomeTrigger) {
    mobileHomeTrigger.classList.toggle('is-current', isHome);
  }
  if (mobileHome) {
    mobileHome.classList.toggle('is-current', isHome);
  }

  // 3. Highlight specific page link across desktop and mobile
  const allNavLinks = document.querySelectorAll(
    '.vk-nav-link, .vk-mobile-menu-inner > a, .vk-nav-dropdown-item, .vk-mobile-home-links a'
  );

  allNavLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkTarget = href.split('#')[0].split('?')[0].toLowerCase();
    if (!linkTarget) return;

    let isMatch = false;
    if (isHome) {
      if (currentPage === 'index.html' && (linkTarget === 'index.html' || linkTarget === './' || linkTarget === '')) {
        isMatch = true;
      } else if (currentPage === 'home-2.html' && linkTarget === 'home-2.html') {
        isMatch = true;
      }
    } else {
      if (linkTarget === currentPage) {
        isMatch = true;
      }
    }

    if (isMatch) {
      link.classList.add('is-current');
    } else {
      if (!link.hasAttribute('data-home-dropdown') && !link.hasAttribute('data-mobile-home-toggle')) {
        link.classList.remove('is-current');
      }
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.vk-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   04. SCROLL REVEAL OBSERVER
   ============================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ============================================================
   05. INTERACTIVE RIPPLE EFFECT
   ============================================================ */
function initRippleEffect() {
  document.querySelectorAll('button:not(.vk-nav-link):not(.vk-nav-dropdown-trigger):not(.vk-icon-button):not(.vk-direction-toggle):not(.vk-menu-toggle):not(.vk-password-toggle), .vk-button:not(.vk-nav-link), .vk-primary-button, .vk-secondary-button').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function(e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      const rect = this.getBoundingClientRect();

      circle.style.cssText = `
        position: absolute;
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - rect.left - radius}px;
        top: ${e.clientY - rect.top - radius}px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.35);
        transform: scale(0);
        animation: vkRipple 0.6s linear;
        pointer-events: none;
      `;

      const existing = this.querySelector('.vk-ripple');
      if (existing) existing.remove();

      circle.className = 'vk-ripple';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  if (!document.getElementById('vk-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'vk-ripple-style';
    style.innerHTML = `
      @keyframes vkRipple {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ============================================================
   06. MODAL ENGINE & TOASTS
   ============================================================ */
function initModals() {
  // Generic modal triggers
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal-open');
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.classList.add('is-active');
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.vk-modal-overlay');
      if (modal) modal.classList.remove('is-active');
    });
  });

  document.querySelectorAll('.vk-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('is-active');
      }
    });
  });
}


/* ============================================================
   08. BACK TO TOP ENGINE
   ============================================================ */
function initBackToTop() {
  let btn = document.getElementById('vkBackToTop');
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'vkBackToTop';
    btn.className = 'vk-back-to-top';
    btn.setAttribute('aria-label', 'Return to top of page');
    btn.setAttribute('title', 'Return to top');
    btn.innerHTML = '<span class="material-symbols-rounded"> arrow_upward </span>';
    document.body.appendChild(btn);
  }

  const toggleVisibility = () => {
    if (window.scrollY > 360) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ============================================================
   09. PAGE PRELOADER (CIPHER PULSE ENGINE)
   ============================================================ */
function initPageLoader() {
  let loader = document.getElementById('vkPageLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'vkPageLoader';
    loader.className = 'vk-page-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="vk-loader-spinner-wrap">
        <div class="vk-loader-vault-ring"></div>
        <div class="vk-loader-vault-ring-inner"></div>
        <div class="vk-loader-core">
          <span class="material-symbols-rounded"> key </span>
        </div>
      </div>
      <div class="vk-loader-text">
        <span class="vk-loader-title">VAULT &amp; KEY</span>
        <span class="vk-loader-subtitle">Deciphering Chamber...</span>
      </div>
    `;
    if (document.body) {
      document.body.prepend(loader);
    }
  }

  const dismissLoader = () => {
    if (loader && !loader.classList.contains('is-loaded')) {
      loader.classList.add('is-loaded');
      setTimeout(() => {
        if (loader && loader.parentNode) loader.remove();
      }, 500);
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 300);
  } else {
    window.addEventListener('load', () => {
      setTimeout(dismissLoader, 350);
    });
    setTimeout(dismissLoader, 2000);
  }
}

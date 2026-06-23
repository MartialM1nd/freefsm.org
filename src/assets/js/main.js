(function(){
  'use strict';

  // ── Theme ──
  const themeToggle = document.querySelector('.theme-toggle');
  const getStoredTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  };
  const setStoredTheme = theme => {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore storage failures in private browsing or locked-down contexts.
    }
  };
  const stored = getStoredTheme();
  if (stored === 'light') document.documentElement.classList.add('light');

  themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    setStoredTheme(isLight ? 'light' : 'dark');
  });

  // ── Mobile Nav ──
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const docsSidebar = document.querySelector('.docs-sidebar');

  navToggle?.addEventListener('click', () => {
    let isOpen = false;

    if (docsSidebar) {
      isOpen = docsSidebar.classList.toggle('open');
    } else {
      isOpen = navLinks?.classList.toggle('open') || false;
    }

    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a, .docs-nav a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      docsSidebar?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Active Docs Nav ──
  const current = window.location.pathname;
  document.querySelectorAll('.docs-nav a:not(.docs-nav-title)').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

(function(){
  'use strict';

  // ── Theme ──
  const themeToggle = document.querySelector('.theme-toggle');
  const stored = localStorage.getItem('theme');
  if (stored === 'light') document.documentElement.classList.add('light');

  themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // ── Mobile Nav ──
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const docsSidebar = document.querySelector('.docs-sidebar');

  navToggle?.addEventListener('click', () => {
    if (docsSidebar) {
      docsSidebar.classList.toggle('open');
    } else {
      navLinks?.classList.toggle('open');
    }
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a, .docs-nav a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      docsSidebar?.classList.remove('open');
    });
  });

  // ── Active Docs Nav ──
  const current = window.location.pathname;
  document.querySelectorAll('.docs-nav a:not(.docs-nav-title)').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
})();

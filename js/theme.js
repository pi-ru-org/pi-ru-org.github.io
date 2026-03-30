document.addEventListener('DOMContentLoaded', function() {
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const isMobile = window.innerWidth < 768;

  // На десктопе всегда светлая тема
  // На мобильных — учитываем сохранённую тему или системные настройки
  if (isMobile) {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    }
  } else {
    // Убедиться, что на десктопе всегда светлая тема
    document.documentElement.classList.remove('dark');
  }

  // Переключатель темы работает только в мобильном меню
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeIcons();
    });
  }

  // Обновление иконок темы
  function updateThemeIcons() {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    if (sunIcon && moonIcon) {
      const isDark = document.documentElement.classList.contains('dark');
      sunIcon.style.display = isDark ? 'block' : 'none';
      moonIcon.style.display = isDark ? 'none' : 'block';
    }
  }
  updateThemeIcons();

  // === Гамбургер-меню ===
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeMenuIcon = document.getElementById('close-menu-icon');
  const menuOverlay = document.getElementById('mobile-menu-overlay');
  const menuPanel = document.getElementById('mobile-menu-panel');
  const menuSearch = document.getElementById('mobile-menu-search');
  const searchPanel = document.getElementById('mobile-search-panel');

  function openMobileMenu() {
    menuOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      menuOverlay.classList.remove('opacity-0');
      menuOverlay.classList.add('opacity-100');
      menuPanel.classList.remove('translate-x-full');
      menuPanel.classList.add('translate-x-0');
    });
    hamburgerIcon.classList.add('hidden');
    closeMenuIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    menuOverlay.classList.remove('opacity-100');
    menuOverlay.classList.add('opacity-0');
    menuPanel.classList.remove('translate-x-0');
    menuPanel.classList.add('translate-x-full');
    hamburgerIcon.classList.remove('hidden');
    closeMenuIcon.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(() => {
      menuOverlay.classList.add('hidden');
    }, 300);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !menuPanel.classList.contains('translate-x-full');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Поиск в мобильном меню
  if (menuSearch && searchPanel) {
    menuSearch.addEventListener('click', () => {
      closeMobileMenu();
      searchPanel.classList.remove('hidden');
      const searchInput = document.getElementById('mobile-search-input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }
});

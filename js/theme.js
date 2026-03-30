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
    });
  }
});

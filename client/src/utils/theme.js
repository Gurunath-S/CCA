/**
 * Synchronizes document root CSS classes for dark mode & custom themes
 */
export const syncTailwindDarkMode = (themeName = 'Classic') => {
  const classesToRemove = ['theme-serenity', 'theme-midnight-focus', 'theme-nature', 'theme-classic', 'theme-vivekananda'];
  document.documentElement.classList.remove(...classesToRemove);

  const normalizedTheme = themeName.toLowerCase().replace(/\s+/g, '-');
  document.documentElement.classList.add(`theme-${normalizedTheme}`);

  if (themeName === 'Midnight Focus') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

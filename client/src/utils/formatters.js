/**
 * Centralized formatting helpers for dates, score visual styling, and badges
 */

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return new Date(dateString).toLocaleDateString(undefined, defaultOptions);
};

export const getScoreColorClass = (score) => {
  if (score >= 4) return 'text-emerald-500 dark:text-emerald-400';
  if (score >= 3) return 'text-amber-500 dark:text-amber-400';
  return 'text-rose-500 dark:text-rose-400';
};

export const getCategoryBadgeStyle = (category = '') => {
  const normalized = category.toLowerCase();
  switch (normalized) {
    case 'virtue':
    case 'moral':
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        label: category || 'Virtue'
      };
    case 'mindset':
    case 'cognitive':
      return {
        bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        label: category || 'Mindset'
      };
    case 'leadership':
    case 'social':
      return {
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        label: category || 'Leadership'
      };
    default:
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        label: category || 'General'
      };
  }
};

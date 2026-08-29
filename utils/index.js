/**
 * Utility functions beyond the core lib/utils.js
 * Extended utilities for common operations.
 */

/**
 * Truncates a string to the specified length with ellipsis.
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

/**
 * Generates a URL-safe slug from a string.
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Debounce function for input handlers.
 */
export function debounce(func, wait = 300) {
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

/**
 * Pluralizes a word based on count.
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}

/**
 * Formats a number with commas (e.g., 1,000,000).
 */
export function formatNumber(num) {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Generates a random string of specified length.
 */
export function randomId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array/object).
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

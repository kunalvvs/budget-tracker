
// Utility functions for the Budget Tracker app

/**
 * Format a number as currency (USD)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date string into a human-readable format
 * @param {string} dateString - Date string in ISO format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Save data to local storage
 * @param {string} key - Local storage key
 * @param {any} data - Data to save
 */
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get data from local storage
 * @param {string} key - Local storage key
 * @returns {any} Parsed data or null if not found
 */
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// lib/theme.js
export function setTheme(name, isDark) {
  const theme = isDark ? `${name}-dark` : name
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export function loadTheme() {
  const saved = localStorage.getItem('theme') || 'obsidian'
  document.documentElement.setAttribute('data-theme', saved)
}
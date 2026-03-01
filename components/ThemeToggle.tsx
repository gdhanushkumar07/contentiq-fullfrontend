'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative p-2 rounded-xl transition-all duration-300 ease-out group"
      style={{
        background: 'var(--btn-bg)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Sun — shown in dark mode (click → go light) */}
      <span
        className="flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'dark' ? 1 : 0,
          position: theme === 'dark' ? 'static' : 'absolute',
          transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(45deg) scale(0.5)',
        }}
      >
        <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
      </span>

      {/* Moon — shown in light mode (click → go dark) */}
      <span
        className="flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'light' ? 1 : 0,
          position: theme === 'light' ? 'static' : 'absolute',
          transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-45deg) scale(0.5)',
        }}
      >
        <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
      </span>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function DashboardNav() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AI'

  return (
    <header
      className="flex items-center justify-between px-8 h-16 flex-shrink-0"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Left: breadcrumb hint */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6', boxShadow: '0 0 8px #8B5CF6' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>ContentIQ Dashboard</span>
      </div>

      {/* Right: theme toggle + notification + user */}
      <div className="flex items-center gap-3">

        {/* ── Theme Toggle ─────────────────────────────── */}
        <ThemeToggle />

        {/* Notification bell */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl transition-colors"
          style={{ background: 'var(--btn-bg)', border: '1px solid var(--border-color)' }}>
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#38BDF8', boxShadow: '0 0 6px #38BDF8' }} />
        </motion.button>

        {/* User dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
            style={{ background: 'var(--btn-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #8B5CF6)' }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                {session?.user?.name || 'User'}
              </div>
              <div className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
                {session?.user?.email || ''}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: 'var(--dropdown-bg)',
                    border: '1px solid var(--border-color)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: 'var(--dropdown-shadow)',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{session?.user?.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{session?.user?.email}</div>
                  </div>
                  {[
                    { icon: User, label: 'Profile' },
                    { icon: Settings, label: 'Settings' },
                  ].map(item => (
                    <button key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                      style={{ color: 'var(--text-secondary)' }}>
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-red-500/[0.08]"
                      style={{ color: '#F87171' }}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

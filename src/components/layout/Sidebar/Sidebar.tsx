'use client'

import { FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'
import SidebarSection from './SidebarSection'
import SidebarFooter from './SidebarFooter'
import { navAluno, navProfessor } from '@/config/navigation'
import { Role } from '@/types'

export default function Sidebar({ role, userName, userInitials = '?' }: any) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar') === 'collapsed'
  })

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar', next ? 'collapsed' : 'expanded')
  }

  const sections = role === 'PROFESSOR' ? navProfessor : navAluno

  return (
      <motion.aside
          className={cn(
              'hidden md:flex flex-col h-screen sticky top-0 relative',
              'bg-surface-default border-r border-border-subtle shadow-sm'
          )}
          animate={{ width: collapsed ? 64 : 240 }}
      >
        {/* Header */}
        <div className="flex items-center px-3 py-4 border-b border-border-subtle">
          {!collapsed && (
              <div className="flex-1 text-content-primary">
                ClinOdonto
              </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-4">
          {sections.map((section) => (
              <SidebarSection
                  key={section.title}
                  section={section}
                  collapsed={collapsed}
              />
          ))}

        </nav>

        {/* Toggle na borda direita */}
        <button
            onClick={toggleSidebar}
            className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10',
                'flex items-center justify-center',
                'w-7 h-7 rounded-full',
                'bg-surface-default border border-border-subtle shadow-sm',
                'text-content-secondary hover:text-content-primary hover:bg-surface-subtle',
                'transition-colors duration-200'
            )}
        >
            {collapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
        </button>

        <SidebarFooter
            collapsed={collapsed}
            userName={userName}
            role={role}
            userInitials={userInitials}
        />
      </motion.aside>
  )
}
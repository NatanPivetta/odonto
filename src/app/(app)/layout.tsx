'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar/Sidebar'
import BottomNav from '@/components/layout/BottomNav/BottomNav'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LayoutDebugOverlay from '@/components/layout/LayoutDebugOverlay'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isInitialized) return
        if (!user) router.replace('/login')
    }, [user, isInitialized, router])

    if (!isInitialized || !user) return null

    const initials = user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="app-shell flex min-h-dvh w-full max-w-full overflow-x-hidden bg-surface-page">
            <Sidebar
                role={user.role}
                userName={user.name}
                userInitials={initials}
            />
            <main className="app-main min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-mobile-nav md:pb-0">
                <header className="md:hidden flex items-center gap-3 border-b border-border-subtle bg-surface-default px-4 py-3 pr-16">
                    <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-content-primary">{user.name}</p>
                        <p className="text-xs text-content-secondary">{user.role === 'PROFESSOR' ? 'Professor' : 'Aluno'} · Cartão {user.cardNumber}</p>
                    </div>
                </header>
                {children}
            </main>
            <ThemeToggle className="md:hidden fixed top-3 right-3 z-50" />
            <BottomNav role={user.role} />
            <LayoutDebugOverlay />
        </div>
    )
}

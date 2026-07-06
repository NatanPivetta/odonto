'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar/Sidebar'
import BottomNav from '@/components/layout/BottomNav/BottomNav'
import ThemeToggle from '@/components/ui/ThemeToggle'

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
        <div className="flex min-h-screen overflow-x-hidden bg-surface-page">
            <Sidebar
                role={user.role}
                userName={user.name}
                userInitials={initials}
            />
            <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
                {children}
            </main>
            <ThemeToggle className="md:hidden fixed top-3 right-3 z-50" />
            <BottomNav role={user.role} />
        </div>
    )
}

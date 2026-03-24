'use client'

import { useAuth } from '@/lib/mock/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) router.replace('/login')
    }, [user, router])

    if (!user) return null

    const initials = user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="flex min-h-screen bg-surface-page">
            <Sidebar
                role={user.role}
                userName={user.name}
                userInitials={initials}
            />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
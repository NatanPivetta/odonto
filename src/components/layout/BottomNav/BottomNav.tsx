'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function BottomNav() {
    const pathname = usePathname()

    const items = [
        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
        { label: 'Atividades', href: '/atividades', icon: '📋' },
        { label: 'Perfil', href: '/perfil', icon: '👤' },
    ]

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-default border-t border-border-subtle z-50">
            <div className="flex justify-around py-2">
                {items.map((item) => {
                    const active = pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center text-xs',
                                active
                                    ? 'text-teal-600'
                                    : 'text-content-secondary'
                            )}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
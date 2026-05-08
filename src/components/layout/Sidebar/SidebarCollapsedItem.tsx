'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SidebarCollapsedItem({ item }: any) {
    const pathname = usePathname()

    const isActive =
        item.href &&
        !item.disabled &&
        (pathname === item.href || pathname.startsWith(item.href + '/'))

    if (item.disabled) {
        return (
            <span
                className="flex items-center justify-center w-full py-2 rounded-md text-content-tertiary opacity-50 cursor-not-allowed"
                title={`${item.label} (em breve)`}
            >
                <span>{item.icon}</span>
            </span>
        )
    }

    return (
        <Link
            href={item.href ?? '#'}
            className={cn(
                'flex items-center justify-center w-full py-2 rounded-md',
                'text-content-secondary hover:bg-surface-subtle',
                isActive && 'bg-teal-50 text-teal-700'
            )}
            title={item.label}
        >
            <span>{item.icon}</span>
        </Link>
    )
}

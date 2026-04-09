'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SidebarCollapsedItem({ item }: any) {
    const pathname = usePathname()

    const isActive =
        item.href &&
        (pathname === item.href || pathname.startsWith(item.href + '/'))

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
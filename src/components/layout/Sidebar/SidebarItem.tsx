'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SidebarItem({ item }: any) {
    const pathname = usePathname()

    const isActive =
        item.href &&
        !item.disabled &&
        (pathname === item.href || pathname.startsWith(item.href + '/'))

    if (item.disabled) {
        return (
            <span
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-content-tertiary opacity-50 cursor-not-allowed select-none"
                title="Em breve"
            >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
            </span>
        )
    }

    return (
        <>
            <Link
                href={item.href ?? '#'}
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md',
                    'text-sm text-content-secondary transition-all',
                    'hover:bg-surface-subtle hover:text-content-primary',
                    isActive && 'bg-teal-50 text-teal-700 font-medium'
                )}
            >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>

                {item.badge != null && (
                    <span className="ml-auto bg-teal-100 text-teal-700 text-[11px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                    </span>
                )}
            </Link>

            {item.children && (
                <div className="ml-6 mt-0.5 flex flex-col gap-0.5">
                    {item.children.map((child: any) => (
                        <SidebarItem key={child.href ?? child.label} item={child} />
                    ))}
                </div>
            )}
        </>
    )
}

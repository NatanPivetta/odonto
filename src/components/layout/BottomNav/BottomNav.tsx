'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiGrid, FiClipboard, FiUser, FiUsers, FiLogOut } from 'react-icons/fi'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

type Role = 'PROFESSOR' | 'ALUNO'

interface BottomNavProps {
    role: Role
}

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ size?: number }>
    disabled?: boolean
}

const itemsAluno: NavItem[] = [
    { label: 'Painel', href: '/dashboard', icon: FiGrid },
    { label: 'Atividades', href: '/atividades', icon: FiClipboard },
    { label: 'Perfil', href: '/perfil', icon: FiUser, disabled: true },
]

const itemsProfessor: NavItem[] = [
    { label: 'Painel', href: '/dashboard', icon: FiGrid },
    { label: 'Atividades', href: '/atividades', icon: FiClipboard },
    { label: 'Alunos', href: '/alunos/turmas', icon: FiUsers },
]

export default function BottomNav({ role }: BottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout } = useAuth()
    const items = role === 'PROFESSOR' ? itemsProfessor : itemsAluno

    function handleLogout() {
        logout()
        router.replace('/login')
    }

    return (
        <div className="mobile-bottom-nav md:hidden fixed inset-x-0 bottom-0 bg-surface-default border-t border-border-subtle z-50">
            <div className="flex w-full px-1 pt-2">
                {items.map((item) => {
                    const active = !item.disabled && (pathname === item.href || pathname.startsWith(item.href + '/'))
                    const Icon = item.icon

                    if (item.disabled) {
                        return (
                            <span
                                key={item.href}
                                className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[11px] text-content-tertiary opacity-40 cursor-not-allowed"
                            >
                                <Icon size={20} />
                                {item.label}
                            </span>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[11px] transition-colors',
                                active ? 'text-teal-600' : 'text-content-secondary'
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}

                <button
                    onClick={handleLogout}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 text-[11px] text-content-secondary hover:text-red-600 transition-colors"
                >
                    <FiLogOut size={20} />
                    Sair
                </button>
            </div>
        </div>
    )
}

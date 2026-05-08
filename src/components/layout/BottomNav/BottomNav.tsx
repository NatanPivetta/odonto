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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-default border-t border-border-subtle z-50">
            <div className="flex justify-around py-2 pb-safe">
                {items.map((item) => {
                    const active = !item.disabled && (pathname === item.href || pathname.startsWith(item.href + '/'))
                    const Icon = item.icon

                    if (item.disabled) {
                        return (
                            <span
                                key={item.href}
                                className="flex flex-col items-center gap-1 text-xs text-content-tertiary opacity-40 cursor-not-allowed px-4 py-1"
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
                                'flex flex-col items-center gap-1 text-xs px-4 py-1 transition-colors',
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
                    className="flex flex-col items-center gap-1 text-xs px-4 py-1 text-content-secondary hover:text-red-600 transition-colors"
                >
                    <FiLogOut size={20} />
                    Sair
                </button>
            </div>
        </div>
    )
}

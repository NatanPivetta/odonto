'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { FiLogOut } from 'react-icons/fi'

export default function SidebarFooter({ collapsed, userName, role, userInitials }: any) {
    const { logout } = useAuth()
    const router = useRouter()

    function handleLogout() {
        logout()
        router.replace('/login')
    }

    return (
        <div className="px-2 py-3 border-t border-border-subtle flex flex-col gap-1">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {userInitials}
                </div>

                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-content-primary truncate">
                            {userName ?? 'Usuário'}
                        </p>
                        <p className="text-[11px] text-content-tertiary">
                            {role === 'PROFESSOR' ? 'Professor' : 'Aluno'}
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-2 py-2 rounded-md text-content-tertiary hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sair"
            >
                <FiLogOut size={15} className="shrink-0" />
                {!collapsed && (
                    <span className="text-[13px]">Sair</span>
                )}
            </button>
        </div>
    )
}

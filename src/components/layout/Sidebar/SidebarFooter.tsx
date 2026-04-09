export default function SidebarFooter({ collapsed, userName, role, userInitials }: any) {
    return (
        <div className="px-2 py-4 border-t border-border-subtle">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-subtle">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-semibold">
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
        </div>
    )
}
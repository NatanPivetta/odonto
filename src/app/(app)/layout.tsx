import Sidebar from '@/components/layout/Sidebar'
import { Role } from '@/types'

const mockUser = {
    name: 'João Silva',
    initials: 'JS',
    role: 'ALUNO' as Role,
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-surface-page">
            <Sidebar
                role={mockUser.role}
                userName={mockUser.name}
                userInitials={mockUser.initials}
            />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
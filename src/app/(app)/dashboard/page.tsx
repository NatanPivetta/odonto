
import Badge from '@/components/ui/Badge'

export default function DashboardPage() {
    return (
        <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">

            {/* Header */}
            <div className="mb-8">
                <p className="text-sm text-content-secondary mb-1">Bem-vindo de volta</p>
                <h1 className="font-serif text-3xl text-content-primary">Meu Painel</h1>
            </div>

            {/* Stat cards */}
            <div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Concluídos',  value: '8',  color: 'text-teal-600',  badge: 'green'   },
                    { label: 'Pendentes',   value: '3',  color: 'text-amber-500', badge: 'warning' },
                    { label: 'Reprovados',  value: '1',  color: 'text-red-500',   badge: 'error'   },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="min-w-0 bg-surface-default border border-border-subtle rounded-lg shadow-xs p-5 md:p-6"
                    >
                        <p className={`text-3xl font-semibold ${stat.color} mb-1`}>{stat.value}</p>
                        <p className="text-sm text-content-secondary">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Progresso */}
            <div className="max-w-lg bg-surface-default border border-border-subtle rounded-lg shadow-xs p-5 md:p-6">
                <div className="flex justify-between items-baseline mb-3">
                    <span className="text-sm font-medium text-content-secondary">Progresso geral</span>
                    <span className="text-sm font-semibold text-content-primary">67%</span>
                </div>
                <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: '67%' }}
                    />
                </div>
                <p className="text-xs text-content-tertiary mt-3">
                    8 de 12 procedimentos concluídos
                </p>
            </div>

        </div>
    )
}

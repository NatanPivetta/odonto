'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Activity } from '@/types'
import { mockAtividades } from '@/lib/mock/atividades'
import Badge, { statusConfig } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import NovaAtividadeModal from '@/components/ui/NewActivityModal'

// ── Ícones de toggle view ──────────────────────────────────────────
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  )
}

// ── Card de atividade ──────────────────────────────────────────────
function ActivityCard({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  const { variant, label } = statusConfig[activity.status]
  const progress = Math.round((activity.completedCount / activity.requiredCount) * 100)

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-default dark:bg-darkSurface-default',
        'border border-border-subtle dark:border-darkBorder-subtle',
        'rounded-xl shadow-xs p-5 cursor-pointer',
        'hover:shadow-sm hover:border-border-default dark:hover:border-darkBorder-default',
        'transition-all duration-150',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-content-primary dark:text-darkContent-primary leading-snug">
          {activity.title}
        </h3>
        <Badge variant={variant} dot>{label}</Badge>
      </div>

      <p className="text-xs text-content-secondary dark:text-darkContent-secondary line-clamp-2 mb-4">
        {activity.description}
      </p>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-content-secondary dark:text-darkContent-secondary">Progresso</span>
          <span className="font-medium text-content-primary dark:text-darkContent-primary">
            {activity.completedCount}/{activity.requiredCount}
          </span>
        </div>
        <div className="h-1.5 bg-surface-subtle dark:bg-darkSurface-subtle rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-[11px] text-content-tertiary dark:text-darkContent-tertiary">
        <span>{activity.createdBy}</span>
        <span>{new Date(activity.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  )
}

// ── Linha da tabela ────────────────────────────────────────────────
function ActivityRow({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  const { variant, label } = statusConfig[activity.status]
  const progress = Math.round((activity.completedCount / activity.requiredCount) * 100)

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
    >
      <td className="px-4 py-3 text-sm font-medium text-content-primary dark:text-darkContent-primary">
        {activity.title}
      </td>
      <td className="px-4 py-3">
        <Badge variant={variant} dot>{label}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-surface-subtle dark:bg-darkSurface-subtle rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-content-secondary dark:text-darkContent-secondary whitespace-nowrap">
            {activity.completedCount}/{activity.requiredCount}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-content-secondary dark:text-darkContent-secondary">
        {activity.createdBy}
      </td>
      <td className="px-4 py-3 text-sm text-content-tertiary dark:text-darkContent-tertiary">
        {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
      </td>
    </tr>
  )
}

// ── Card de nova atividade ─────────────────────────────────────────
function NewActivityCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left',
        'bg-teal-50 dark:bg-teal-900/20',
        'border-2 border-dashed border-teal-200 dark:border-teal-700',
        'rounded-xl p-5 cursor-pointer',
        'hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-300',
        'transition-all duration-150 group',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-teal-500 text-white flex items-center justify-center text-lg font-light group-hover:scale-110 transition-transform">
          +
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">Nova atividade</p>
          <p className="text-xs text-teal-600/70 dark:text-teal-500">Clique para criar uma atividade clínica</p>
        </div>
      </div>
    </button>
  )
}

// ── Página principal ───────────────────────────────────────────────
export default function AtividadesPage() {
  const [view, setView]       = useState<'cards' | 'lista'>('cards')
  const [modalOpen, setModalOpen] = useState(false)
  const [atividades, setAtividades] = useState<Activity[]>(mockAtividades)

  function handleSave(data: { title: string; description: string; deadline: string }) {
    const nova: Activity = {
      id: String(Date.now()),
      title: data.title,
      description: data.description,
      requiredCount: 1,
      completedCount: 0,
      status: 'PENDENTE',
      createdBy: 'Prof. Dr. João Silva',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAtividades((prev) => [nova, ...prev])
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-sm text-content-secondary dark:text-darkContent-secondary mb-1">
            Gestão
          </p>
          <h1 className="font-serif text-3xl text-content-primary dark:text-darkContent-primary">
            Atividades
          </h1>
        </div>

        {/* Toggle cards / lista */}
        <div className="flex items-center gap-1 bg-surface-subtle dark:bg-darkSurface-subtle rounded-lg p-1">
          <button
            onClick={() => setView('cards')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              view === 'cards'
                ? 'bg-surface-default dark:bg-darkSurface-default text-content-primary dark:text-darkContent-primary shadow-xs'
                : 'text-content-tertiary dark:text-darkContent-tertiary hover:text-content-secondary',
            )}
          >
            <IconGrid /> Cards
          </button>
          <button
            onClick={() => setView('lista')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              view === 'lista'
                ? 'bg-surface-default dark:bg-darkSurface-default text-content-primary dark:text-darkContent-primary shadow-xs'
                : 'text-content-tertiary dark:text-darkContent-tertiary hover:text-content-secondary',
            )}
          >
            <IconList /> Lista
          </button>
        </div>
      </div>

      {/* Visualização Cards */}
      {view === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewActivityCard onClick={() => setModalOpen(true)} />
          {atividades.map((a) => (
            <ActivityCard key={a.id} activity={a} onClick={() => {}} />
          ))}
        </div>
      )}

      {/* Visualização Lista */}
      {view === 'lista' && (
        <div className="bg-surface-default dark:bg-darkSurface-default border border-border-subtle dark:border-darkBorder-subtle rounded-xl overflow-hidden shadow-xs">
          {/* Linha de nova atividade */}
          <div className="px-4 py-3 border-b border-border-subtle dark:border-darkBorder-subtle">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 transition-colors"
            >
              <span className="w-5 h-5 rounded bg-teal-500 text-white flex items-center justify-center text-base leading-none">+</span>
              Nova atividade
            </button>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-subtle dark:bg-darkSurface-subtle">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary dark:text-darkContent-tertiary border-b border-border-subtle dark:border-darkBorder-subtle">
                  Título
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary dark:text-darkContent-tertiary border-b border-border-subtle dark:border-darkBorder-subtle">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary dark:text-darkContent-tertiary border-b border-border-subtle dark:border-darkBorder-subtle">
                  Progresso
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary dark:text-darkContent-tertiary border-b border-border-subtle dark:border-darkBorder-subtle">
                  Professor
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary dark:text-darkContent-tertiary border-b border-border-subtle dark:border-darkBorder-subtle">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((a) => (
                <ActivityRow key={a.id} activity={a} onClick={() => {}} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <NovaAtividadeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

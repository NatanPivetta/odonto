'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { listTurmas, createTurma } from '@/lib/services/turmas'
import { ApiError } from '@/lib/api'
import type { Turma } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Card de turma ──────────────────────────────────────────────────

function TurmaCard({ turma, onClick }: { turma: Turma; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-surface-default border border-border-subtle',
                'rounded-xl shadow-xs p-5 cursor-pointer',
                'hover:shadow-sm hover:border-border-default',
                'transition-all duration-150 min-w-0 max-w-full overflow-hidden',
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-semibold tracking-wide uppercase">
                    {turma.disciplina}
                </span>
                {!turma.active && (
                    <span className="text-[11px] text-content-tertiary">Inativa</span>
                )}
            </div>

            <h3 className="text-sm font-semibold text-content-primary leading-snug mb-1">
                {turma.name}
            </h3>
            <p className="text-xs text-content-secondary mb-4">{turma.semester}</p>

            <div className="flex min-w-0 items-center justify-between gap-3 text-[11px] text-content-tertiary">
                <span className="min-w-0 truncate">{turma.alunos.length} aluno{turma.alunos.length !== 1 ? 's' : ''}</span>
                <span className="shrink-0">{new Date(turma.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
        </div>
    )
}

// ── Card de nova turma ─────────────────────────────────────────────

function NovaTurmaCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full min-w-0 max-w-full overflow-hidden text-left',
                'bg-teal-50 border-2 border-dashed border-teal-200',
                'rounded-xl p-5 cursor-pointer',
                'hover:bg-teal-100 hover:border-teal-300',
                'transition-all duration-150 group',
            )}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-teal-500 text-white flex items-center justify-center text-lg font-light group-hover:scale-110 transition-transform">
                    +
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-teal-700">Nova turma</p>
                    <p className="truncate text-xs text-teal-600/70">Clique para criar uma turma</p>
                </div>
            </div>
        </button>
    )
}

// ── Modal de criação de turma ──────────────────────────────────────

interface NovaTurmaModalProps {
    open: boolean
    onClose: () => void
    onCreated: (turma: Turma) => void
}

function NovaTurmaModal({ open, onClose, onCreated }: NovaTurmaModalProps) {
    const [disciplina, setDisciplina] = useState('')
    const [name, setName] = useState('')
    const [semester, setSemester] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function reset() {
        setDisciplina('')
        setName('')
        setSemester('')
        setError(null)
    }

    function handleClose() {
        reset()
        onClose()
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const turma = await createTurma({ disciplina, name, semester })
            reset()
            onCreated(turma)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erro ao criar turma.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="absolute inset-0 bg-content-primary/40 backdrop-blur-sm" />
            <div
                className={cn(
                    'relative z-10 w-full max-w-lg',
                    'bg-surface-default border border-border-subtle rounded-xl shadow-md',
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Nova Turma</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">Preencha os dados da turma</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="w-32 shrink-0">
                            <Input
                                label="Disciplina"
                                placeholder="ODE01"
                                maxLength={20}
                                value={disciplina}
                                onChange={(e) => setDisciplina(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="Semestre"
                                placeholder="2026/1"
                                maxLength={10}
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Input
                        label="Nome da turma"
                        placeholder="Ex: Cirurgia Bucomaxilofacial – Turma A"
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" loading={loading}>Criar turma</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ───────────────────────────────────────────────

export default function TurmasPage() {
    const router = useRouter()
    const [turmas, setTurmas] = useState<Turma[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchTurmas = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const page = await listTurmas()
            setTurmas(page.content)
        } catch {
            setError('Não foi possível carregar as turmas.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchTurmas() }, [fetchTurmas])

    function handleCreated(turma: Turma) {
        setTurmas((prev) => [turma, ...prev])
        setModalOpen(false)
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">
            <div className="mb-6 min-w-0">
                <p className="text-sm text-content-secondary mb-1">Gestão</p>
                <h1 className="font-serif text-3xl text-content-primary">Turmas</h1>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-36 bg-surface-subtle rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <NovaTurmaCard onClick={() => setModalOpen(true)} />
                    {turmas.map((t) => (
                        <TurmaCard
                            key={t.id}
                            turma={t}
                            onClick={() => router.push(`/alunos/turmas/${t.id}`)}
                        />
                    ))}
                </div>
            )}

            <NovaTurmaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleCreated}
            />
        </div>
    )
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getTurmaById, addAlunoToTurma, removeAlunoFromTurma } from '@/lib/services/turmas'
import { createUser, listAlunos } from '@/lib/services/users'
import { ApiError } from '@/lib/api'
import type { Turma, UserResponse } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Modal de adicionar aluno ───────────────────────────────────────

type Tab = 'existente' | 'novo'

interface AdicionarAlunoModalProps {
    open: boolean
    onClose: () => void
    onAdded: (aluno: UserResponse) => void
    turmaId: number
    alunosJaMatriculados: number[]   // ids já na turma, para desabilitar na lista
}

function AdicionarAlunoModal({
    open, onClose, onAdded, turmaId, alunosJaMatriculados,
}: AdicionarAlunoModalProps) {
    const [tab, setTab] = useState<Tab>('existente')

    // ── aba existente ──────────────────────────────────────────────
    const [alunos, setAlunos] = useState<UserResponse[]>([])
    const [loadingAlunos, setLoadingAlunos] = useState(false)
    const [busca, setBusca] = useState('')
    const [selecionado, setSelecionado] = useState<UserResponse | null>(null)
    const [adicionando, setAdicionando] = useState(false)
    const [erroAba, setErroAba] = useState<string | null>(null)

    // ── aba novo ──────────────────────────────────────────────────
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [password, setPassword] = useState('')
    const [criando, setCriando] = useState(false)
    const [erroNovo, setErroNovo] = useState<string | null>(null)

    // Busca alunos ativos ao abrir o modal
    useEffect(() => {
        if (!open) return
        setLoadingAlunos(true)
        setErroAba(null)
        listAlunos({ active: true })
            .then((page) => setAlunos(page.content))
            .catch(() => setErroAba('Não foi possível carregar os alunos.'))
            .finally(() => setLoadingAlunos(false))
    }, [open])

    function resetAll() {
        setTab('existente')
        setBusca('')
        setSelecionado(null)
        setErroAba(null)
        setName('')
        setEmail('')
        setCardNumber('')
        setPassword('')
        setErroNovo(null)
    }

    function handleClose() {
        resetAll()
        onClose()
    }

    // Filtra pelo texto de busca (nome, email ou cartão)
    const alunosFiltrados = useMemo(() => {
        const q = busca.toLowerCase()
        return alunos.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                a.cardNumber.includes(q),
        )
    }, [alunos, busca])

    async function handleAdicionarExistente() {
        if (!selecionado) return
        setAdicionando(true)
        setErroAba(null)
        try {
            await addAlunoToTurma(turmaId, selecionado.id)
            resetAll()
            onAdded(selecionado)
        } catch (err) {
            setErroAba(
                err instanceof ApiError && err.status === 400
                    ? 'Aluno já matriculado nesta turma.'
                    : 'Erro ao matricular aluno.',
            )
        } finally {
            setAdicionando(false)
        }
    }

    async function handleCriarNovo(e: React.FormEvent) {
        e.preventDefault()
        setErroNovo(null)
        setCriando(true)
        try {
            const aluno = await createUser({ name, email, cardNumber, password, role: 'ALUNO' })
            await addAlunoToTurma(turmaId, aluno.id)
            resetAll()
            onAdded(aluno)
        } catch (err) {
            if (err instanceof ApiError) {
                setErroNovo(
                    err.status === 409 || err.message.includes('já cadastrado')
                        ? 'Já existe um aluno com este cartão ou e-mail.'
                        : err.message,
                )
            } else {
                setErroNovo('Erro ao cadastrar aluno.')
            }
        } finally {
            setCriando(false)
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
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Adicionar Aluno</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">
                            Selecione um aluno existente ou crie um novo cadastro
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border-subtle px-6">
                    {(['existente', 'novo'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                'py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors',
                                tab === t
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-content-tertiary hover:text-content-secondary',
                            )}
                        >
                            {t === 'existente' ? 'Aluno existente' : 'Criar novo aluno'}
                        </button>
                    ))}
                </div>

                {/* Aba: existente */}
                {tab === 'existente' && (
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <Input
                            placeholder="Buscar por nome, e-mail ou cartão..."
                            value={busca}
                            onChange={(e) => { setBusca(e.target.value); setSelecionado(null) }}
                        />

                        <div className="border border-border-subtle rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                            {loadingAlunos ? (
                                <div className="p-4 space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : alunosFiltrados.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-content-tertiary">
                                    {busca ? 'Nenhum aluno encontrado.' : 'Nenhum aluno ativo cadastrado.'}
                                </p>
                            ) : (
                                alunosFiltrados.map((aluno) => {
                                    const jaMatriculado = alunosJaMatriculados.includes(aluno.id)
                                    const selected = selecionado?.id === aluno.id
                                    const initials = aluno.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                                    return (
                                        <button
                                            key={aluno.id}
                                            disabled={jaMatriculado}
                                            onClick={() => setSelecionado(aluno)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border-subtle last:border-0',
                                                jaMatriculado
                                                    ? 'opacity-40 cursor-not-allowed bg-surface-subtle'
                                                    : selected
                                                        ? 'bg-teal-50'
                                                        : 'hover:bg-surface-subtle',
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold flex items-center justify-center shrink-0">
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-content-primary truncate">{aluno.name}</p>
                                                <p className="text-xs text-content-tertiary truncate">{aluno.email}</p>
                                            </div>
                                            <span className="text-xs font-mono text-content-tertiary shrink-0">{aluno.cardNumber}</span>
                                            {jaMatriculado && (
                                                <span className="text-[10px] text-content-tertiary shrink-0">já matriculado</span>
                                            )}
                                            {selected && (
                                                <span className="text-teal-500 shrink-0">✓</span>
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        {erroAba && <p className="text-xs text-red-600">{erroAba}</p>}

                        <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                            <Button
                                onClick={handleAdicionarExistente}
                                disabled={!selecionado}
                                loading={adicionando}
                            >
                                Matricular aluno
                            </Button>
                        </div>
                    </div>
                )}

                {/* Aba: novo */}
                {tab === 'novo' && (
                    <form onSubmit={handleCriarNovo} className="px-6 py-5 flex flex-col gap-4">
                        <Input
                            label="Nome completo"
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="E-mail institucional"
                            type="email"
                            placeholder="aluno@ufrgs.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    label="Número do cartão"
                                    placeholder="000000000"
                                    maxLength={9}
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    label="Senha provisória"
                                    type="password"
                                    placeholder="mín. 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        {erroNovo && <p className="text-xs text-red-600">{erroNovo}</p>}

                        <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                            <Button type="submit" loading={criando}>Criar e matricular</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

// ── Linha de aluno ─────────────────────────────────────────────────

function AlunoRow({ aluno, onRemove }: { aluno: UserResponse; onRemove: () => void }) {
    const [removing, setRemoving] = useState(false)

    async function handleRemove() {
        setRemoving(true)
        await onRemove()
        setRemoving(false)
    }

    const initials = aluno.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <tr className="hover:bg-surface-subtle transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold flex items-center justify-center shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-content-primary">{aluno.name}</p>
                        <p className="text-xs text-content-tertiary">{aluno.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-content-secondary font-mono">
                {aluno.cardNumber}
            </td>
            <td className="px-4 py-3">
                <span className={cn(
                    'inline-block px-2 py-0.5 rounded text-[11px] font-medium',
                    aluno.active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-surface-subtle text-content-tertiary',
                )}>
                    {aluno.active ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <Button variant="danger" size="sm" loading={removing} onClick={handleRemove}>
                    Remover
                </Button>
            </td>
        </tr>
    )
}

// ── Página principal ───────────────────────────────────────────────

export default function TurmaDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const turmaId = Number(id)

    const [turma, setTurma] = useState<Turma | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchTurma = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setTurma(await getTurmaById(turmaId))
        } catch {
            setError('Não foi possível carregar a turma.')
        } finally {
            setLoading(false)
        }
    }, [turmaId])

    useEffect(() => { fetchTurma() }, [fetchTurma])

    function handleAlunoAdded(aluno: UserResponse) {
        setTurma((prev) => prev ? { ...prev, alunos: [...prev.alunos, aluno] } : prev)
        setModalOpen(false)
    }

    async function handleRemoveAluno(alunoId: number) {
        try {
            await removeAlunoFromTurma(turmaId, alunoId)
            setTurma((prev) =>
                prev ? { ...prev, alunos: prev.alunos.filter((a) => a.id !== alunoId) } : prev,
            )
        } catch {
            // mantém a linha — o usuário verá que nada mudou
        }
    }

    if (loading) {
        return (
            <div className="p-8 space-y-4">
                <div className="h-8 w-48 bg-surface-subtle rounded animate-pulse" />
                <div className="h-4 w-32 bg-surface-subtle rounded animate-pulse" />
                <div className="h-64 bg-surface-subtle rounded-xl animate-pulse mt-6" />
            </div>
        )
    }

    if (error || !turma) {
        return (
            <div className="p-8">
                <p className="text-sm text-red-600">{error ?? 'Turma não encontrada.'}</p>
                <button onClick={() => router.back()} className="mt-3 text-sm text-teal-600 hover:underline">
                    ← Voltar
                </button>
            </div>
        )
    }

    const alunosIds = turma.alunos.map((a) => a.id)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push('/alunos/turmas')}
                    className="text-xs text-content-tertiary hover:text-content-secondary mb-3 flex items-center gap-1 transition-colors"
                >
                    ← Turmas
                </button>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-semibold tracking-wide uppercase">
                                {turma.disciplina}
                            </span>
                            <span className="text-xs text-content-tertiary">{turma.semester}</span>
                        </div>
                        <h1 className="font-serif text-3xl text-content-primary">{turma.name}</h1>
                    </div>
                    <Button onClick={() => setModalOpen(true)}>+ Adicionar aluno</Button>
                </div>
            </div>

            {/* Tabela de alunos */}
            <div className="bg-surface-default border border-border-subtle rounded-xl overflow-hidden shadow-xs">
                {turma.alunos.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-content-secondary mb-1">Nenhum aluno matriculado</p>
                        <p className="text-xs text-content-tertiary">
                            Clique em &quot;Adicionar aluno&quot; para matricular o primeiro aluno nesta turma.
                        </p>
                    </div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface-subtle">
                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                                    Aluno
                                </th>
                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                                    Cartão
                                </th>
                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                                    Status
                                </th>
                                <th className="border-b border-border-subtle" />
                            </tr>
                        </thead>
                        <tbody>
                            {turma.alunos.map((aluno) => (
                                <AlunoRow
                                    key={aluno.id}
                                    aluno={aluno}
                                    onRemove={() => handleRemoveAluno(aluno.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AdicionarAlunoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={handleAlunoAdded}
                turmaId={turmaId}
                alunosJaMatriculados={alunosIds}
            />
        </div>
    )
}

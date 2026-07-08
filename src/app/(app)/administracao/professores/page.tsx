'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { listProfessores } from '@/lib/services/professores'
import { createUser } from '@/lib/services/users'
import type { UserResponse } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCardNumber, normalizeCardNumber } from '@/lib/card-number'

// ── Modal de novo professor ──────────────────────────────────────────

interface NovoProfessorModalProps {
    open: boolean
    onClose: () => void
    onCreated: (prof: UserResponse) => void
}

function NovoProfessorModal({ open, onClose, onCreated }: NovoProfessorModalProps) {
    const [name, setName]           = useState('')
    const [email, setEmail]         = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [password, setPassword]   = useState('')
    const [loading, setLoading]     = useState(false)
    const [error, setError]         = useState<string | null>(null)

    function reset() {
        setName(''); setEmail(''); setCardNumber(''); setPassword(''); setError(null)
    }

    function handleClose() { reset(); onClose() }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const prof = await createUser({ name, email, cardNumber: normalizeCardNumber(cardNumber), password, role: 'PROFESSOR' })
            onCreated(prof)
            handleClose()
        } catch (err: any) {
            setError(err?.message ?? 'Erro ao cadastrar professor.')
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
                    'relative z-10 w-full max-w-md',
                    'bg-surface-default border border-border-subtle rounded-xl shadow-md',
                )}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Novo professor</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">
                            Cadastrar um novo professor no sistema
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    <Input
                        label="Nome completo *"
                        placeholder="Ex: Prof. Maria Silva"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="E-mail *"
                        type="email"
                        placeholder="Ex: maria.silva@ufrgs.br"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Nº de cartão *"
                        placeholder="8 dígitos"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        required
                        pattern="\d{1,8}"
                    />
                    <Input
                        label="Senha *"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={loading}>
                            Cadastrar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página ───────────────────────────────────────────────────────────

export default function ProfessoresPage() {
    const [professores, setProfessores] = useState<UserResponse[]>([])
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState<string | null>(null)
    const [modalOpen, setModalOpen]     = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const page = await listProfessores()
                setProfessores(page.content)
            } catch (err) {
                console.error('[ProfessoresPage] listProfessores:', err)
                setError('Não foi possível carregar os professores.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    function handleCreated(prof: UserResponse) {
        setProfessores(prev => [prof, ...prev])
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-sm text-content-secondary mb-1">Administração</p>
                    <h1 className="font-serif text-3xl text-content-primary">Professores</h1>
                </div>
                <Button onClick={() => setModalOpen(true)}>+ Novo professor</Button>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 text-content-secondary text-sm">
                    Carregando professores...
                </div>
            )}

            {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="bg-surface-default border border-border-subtle rounded-xl overflow-hidden shadow-xs">
                    {professores.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-content-tertiary">
                            Nenhum professor cadastrado.
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface-subtle">
                                    {['Nome', 'E-mail', 'Nº Cartão', 'Status'].map(col => (
                                        <th
                                            key={col}
                                            className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {professores.map(p => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-border-subtle last:border-b-0"
                                    >
                                        <td className="px-4 py-3 font-medium text-content-primary">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-content-secondary">{p.email}</td>
                                        <td className="px-4 py-3 text-content-secondary font-mono">
                                            {p.cardNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                'inline-flex items-center gap-1.5 text-[11px] font-semibold',
                                                'tracking-[0.03em] px-2.5 py-0.5 rounded-full',
                                                p.active
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-surface-subtle text-content-secondary',
                                            )}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                                {p.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <NovoProfessorModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleCreated}
            />
        </div>
    )
}

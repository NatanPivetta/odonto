'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { listAlunos } from '@/lib/services/users'
import type { Page, UserResponse } from '@/types'
import Button from '@/components/ui/Button'

export default function AlunosPage() {
    const { user } = useAuth()
    const [page, setPage] = useState(0)
    const [result, setResult] = useState<Page<UserResponse> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retry, setRetry] = useState(0)
    const isProfessor = user?.role === 'PROFESSOR'

    useEffect(() => {
        if (!isProfessor) return
        let cancelled = false
        async function load() {
            setLoading(true)
            setError(null)
            try {
                const data = await listAlunos({ page, size: 20 })
                if (!cancelled) setResult(data)
            } catch {
                if (!cancelled) setError('Não foi possível carregar os alunos. Tente novamente.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [isProfessor, page, retry])

    if (!isProfessor) return <p className="p-8 text-content-secondary">Acesso disponível apenas para professores.</p>

    return (
        <div className="w-full max-w-full px-4 py-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="mb-1 text-sm text-content-secondary">Gestão</p>
                    <h1 className="font-serif text-3xl text-content-primary">Alunos</h1>
                    <p className="mt-2 text-sm text-content-secondary">Consulte os alunos cadastrados no sistema.</p>
                </div>
                <Link href="/alunos/turmas" className="text-sm text-teal-600 hover:underline">Ver turmas →</Link>
            </div>
            {loading ? <p role="status" className="text-content-secondary">Carregando alunos...</p> : error ? (
                <div role="alert" className="space-y-3">
                    <p className="text-red-600">{error}</p>
                    <Button onClick={() => setRetry(value => value + 1)}>Tentar novamente</Button>
                </div>
            ) : !result?.content.length ? (
                <p className="text-content-secondary">Nenhum aluno encontrado.</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-default">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">Alunos cadastrados no sistema</caption>
                            <thead className="bg-surface-subtle text-content-secondary">
                                <tr>{['Nome', 'Cartão', 'E-mail', 'Situação'].map(label => <th key={label} scope="col" className="px-4 py-3">{label}</th>)}</tr>
                            </thead>
                            <tbody>
                                {result.content.map(aluno => (
                                    <tr key={aluno.id} className="border-t border-border-subtle text-content-primary">
                                        <td className="px-4 py-3">{aluno.name}</td>
                                        <td className="px-4 py-3">{aluno.cardNumber}</td>
                                        <td className="px-4 py-3 break-all">{aluno.email}</td>
                                        <td className="px-4 py-3">{aluno.active ? 'Ativo' : 'Inativo'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav aria-label="Paginação dos alunos" className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p aria-live="polite" className="text-sm text-content-secondary">Página {result.number + 1} de {result.totalPages} · {result.totalElements} alunos</p>
                        <div className="flex gap-2">
                            <Button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Anterior</Button>
                            <Button disabled={page + 1 >= result.totalPages} onClick={() => setPage(value => value + 1)}>Próxima</Button>
                        </div>
                    </nav>
                </>
            )}
        </div>
    )
}

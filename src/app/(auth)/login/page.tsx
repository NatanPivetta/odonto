
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        // Mock: simula delay de autenticação e redireciona
        setTimeout(() => router.push('/dashboard'), 800)
    }

    return (
        <main className="min-h-screen bg-surface-page flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-md bg-teal-500 text-white flex items-center justify-center font-semibold shadow-brand">
                        C
                    </div>
                    <div>
                        <div className="font-serif text-lg text-content-primary leading-tight">ClinOdonto</div>
                        <div className="text-[11px] text-content-tertiary tracking-wide">UFRGS</div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-surface-default border border-border-subtle rounded-lg shadow-sm p-8">
                    <h1 className="font-serif text-2xl text-content-primary mb-1">Entrar</h1>
                    <p className="text-sm text-content-secondary mb-6">
                        Use suas credenciais institucionais
                    </p>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <Input
                            label="E-mail institucional"
                            type="email"
                            placeholder="usuario@ufrgs.br"
                            required
                        />
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        {/* Atalhos mock */}
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="text-[11px] text-teal-600 hover:underline"
                            >
                                Entrar como Aluno →
                            </button>
                            <span className="text-content-tertiary text-[11px]">·</span>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="text-[11px] text-teal-600 hover:underline"
                            >
                                Entrar como Professor →
                            </button>
                        </div>

                        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
                            Entrar
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-content-tertiary mt-6">
                    Faculdade de Odontologia · UFRGS
                </p>
            </div>
        </main>
    )
}
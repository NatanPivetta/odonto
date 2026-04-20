'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import { ApiError } from '@/lib/api'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const form = e.currentTarget
        const cardNumber = (form.elements.namedItem('cardNumber') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        try {
            await login(cardNumber, password)
            router.push('/dashboard')
        } catch (err) {
            if (err instanceof ApiError && err.isUnauthorized) {
                setError('Número de cartão ou senha inválidos.')
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
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
                            name="cardNumber"
                            label="Número do cartão"
                            type="text"
                            placeholder="000000000"
                            maxLength={9}
                            required
                        />
                        <Input
                            name="password"
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <p className="text-xs text-red-600 -mt-1">{error}</p>
                        )}

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

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { sendVerificationCode } from '@/lib/services/auth'
import { ApiError } from '@/lib/api'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatCardNumber, normalizeCardNumber } from '@/lib/card-number'

function Logo() {
    return (
        <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-md bg-teal-500 text-white flex items-center justify-center font-semibold shadow-brand">
                C
            </div>
            <div>
                <div className="font-serif text-lg text-content-primary leading-tight">ClinOdonto</div>
                <div className="text-[11px] text-content-tertiary tracking-wide">UFRGS</div>
            </div>
        </div>
    )
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
    const steps = ['Dados', 'Verificação', 'Senha']
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, i) => {
                const n = i + 1
                const done = n < current
                const active = n === current
                return (
                    <div key={n} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <div className={[
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                                done   ? 'bg-teal-500 text-white' :
                                active ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' :
                                         'bg-surface-subtle text-content-tertiary',
                            ].join(' ')}>
                                {done ? '✓' : n}
                            </div>
                            <span className={`text-[10px] font-medium ${active ? 'text-teal-600' : 'text-content-tertiary'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-10 h-px mb-4 ${n < current ? 'bg-teal-400' : 'bg-border-subtle'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function parseError(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
        try {
            const body = JSON.parse(err.message)
            return body.message ?? body.error ?? fallback
        } catch {
            return err.message || fallback
        }
    }
    return fallback
}

export default function PrimeiroAcessoPage() {
    const router = useRouter()
    const { register } = useAuth()

    const [step, setStep] = useState<1 | 2 | 3>(1)

    const [name, setName]             = useState('')
    const [email, setEmail]           = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [code, setCode]             = useState('')
    const [password, setPassword]     = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading]         = useState(false)
    const [error, setError]             = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    function startCooldown() {
        setResendCooldown(60)
        timerRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    async function handleEnviarCodigo(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await sendVerificationCode({ name, email, cardNumber: normalizeCardNumber(cardNumber) })
            startCooldown()
            setStep(2)
        } catch (err) {
            setError(parseError(err, 'Não foi possível enviar o código. Verifique os dados.'))
        } finally {
            setLoading(false)
        }
    }

    function handleContinuarCodigo(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (code.length !== 6) { setError('O código deve ter 6 dígitos.'); return }
        setStep(3)
    }

    async function handleReenviar() {
        if (resendCooldown > 0) return
        setError(null)
        setLoading(true)
        try {
            await sendVerificationCode({ name, email, cardNumber: normalizeCardNumber(cardNumber) })
            startCooldown()
            setCode('')
        } catch (err) {
            setError(parseError(err, 'Erro ao reenviar o código.'))
        } finally {
            setLoading(false)
        }
    }

    async function handleCriarConta(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }
        setLoading(true)
        try {
            await register({ name, email, cardNumber: normalizeCardNumber(cardNumber), password, code })
            router.push('/dashboard')
        } catch (err) {
            const msg = parseError(err, 'Erro ao criar conta.')
            setError(msg)
            if (msg.toLowerCase().includes('código')) setStep(2)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-surface-page flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <Logo />

                <div className="bg-surface-default border border-border-subtle rounded-lg shadow-sm p-8">
                    <StepIndicator current={step} />

                    {step === 1 && (
                        <>
                            <h1 className="font-serif text-2xl text-content-primary mb-1">Primeiro acesso</h1>
                            <p className="text-sm text-content-secondary mb-6">
                                Preencha seus dados e enviaremos um código de verificação ao seu e-mail.
                            </p>
                            <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
                                <Input label="Nome completo" placeholder="Ex: João da Silva"
                                    value={name} onChange={e => setName(e.target.value)} required maxLength={150} />
                                <Input label="E-mail institucional" type="email" placeholder="aluno@ufrgs.br"
                                    value={email} onChange={e => setEmail(e.target.value)} required maxLength={150} />
                                <Input label="Número do cartão" placeholder="00000000"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    required />
                                {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}
                                <Button type="submit" loading={loading} className="w-full justify-center mt-2">
                                    Enviar código
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h1 className="font-serif text-2xl text-content-primary mb-1">Verifique seu e-mail</h1>
                            <p className="text-sm text-content-secondary mb-6">
                                Enviamos um código de 6 dígitos para{' '}
                                <span className="font-medium text-content-primary">{email}</span>.
                            </p>
                            <form onSubmit={handleContinuarCodigo} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-content-secondary">
                                        Código de verificação
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        required
                                        autoFocus
                                        className="font-mono text-3xl tracking-[0.5em] text-center text-content-primary bg-surface-default border-[1.5px] border-border-subtle rounded-md px-4 py-3 outline-none transition-[border-color] hover:border-border-default focus:border-teal-400"
                                    />
                                </div>
                                {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}
                                <Button type="submit" className="w-full justify-center mt-2">
                                    Continuar
                                </Button>
                            </form>
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <button
                                    onClick={handleReenviar}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-xs text-teal-600 hover:text-teal-700 disabled:text-content-tertiary disabled:cursor-not-allowed transition-colors"
                                >
                                    {resendCooldown > 0
                                        ? `Reenviar código em ${resendCooldown}s`
                                        : 'Não recebeu? Reenviar código'}
                                </button>
                                <button
                                    onClick={() => { setStep(1); setError(null) }}
                                    className="text-xs text-content-tertiary hover:text-content-secondary transition-colors"
                                >
                                    ← Voltar e corrigir dados
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h1 className="font-serif text-2xl text-content-primary mb-1">Crie sua senha</h1>
                            <p className="text-sm text-content-secondary mb-6">
                                Escolha uma senha segura com no mínimo 8 caracteres.
                            </p>
                            <form onSubmit={handleCriarConta} className="flex flex-col gap-4">
                                <Input label="Senha" type="password" placeholder="mín. 8 caracteres"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required minLength={8} />
                                <Input label="Confirmar senha" type="password" placeholder="••••••••"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    required />
                                {error && <p className="text-xs text-red-600 -mt-1">{error}</p>}
                                <Button type="submit" loading={loading} className="w-full justify-center mt-2">
                                    Criar conta
                                </Button>
                            </form>
                            <button
                                onClick={() => { setStep(2); setError(null) }}
                                className="mt-3 w-full text-center text-xs text-content-tertiary hover:text-content-secondary transition-colors"
                            >
                                ← Voltar
                            </button>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-content-tertiary mt-4">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-teal-600 hover:text-teal-700 transition-colors">
                        Entrar
                    </Link>
                </p>
            </div>
        </main>
    )
}

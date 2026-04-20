'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginService, logout as logoutService } from '@/lib/services/auth'
import { tokenStorage } from '@/lib/api'
import type { User } from '@/types'

const USER_KEY = 'odonto.user'

function loadUser(): User | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as User
    } catch {
        return null
    }
}

function saveUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearUser() {
    localStorage.removeItem(USER_KEY)
}

// ── Contexto ───────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null
    login: (cardNumber: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    // Restaura sessão ao recarregar a página enquanto o token existir
    useEffect(() => {
        const token = tokenStorage.get()
        if (token) setUser(loadUser())
    }, [])

    async function login(cardNumber: string, password: string) {
        const data = await loginService({ cardNumber, password })
        const user: User = { name: data.name, cardNumber: data.cardNumber, role: data.role }
        saveUser(user)
        setUser(user)
    }

    function logout() {
        logoutService()
        clearUser()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

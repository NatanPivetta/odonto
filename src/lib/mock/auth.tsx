'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Role, User } from '@/types'

const mockUsers: Record<Role, User> = {
    PROFESSOR: {
        id: '1',
        name: 'Carlos Mendes',
        email: 'carlos.mendes@ufrgs.br',
        role: 'PROFESSOR',
        siape: '1234567',
    },
    ALUNO: {
        id: '2',
        name: 'João Silva',
        email: 'joao.silva@ufrgs.br',
        role: 'ALUNO',
        matricula: '21/0001234',
    },
}

interface AuthContextType {
    user: User | null
    login: (role: Role) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    function login(role: Role) {
        setUser(mockUsers[role])
    }

    function logout() {
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
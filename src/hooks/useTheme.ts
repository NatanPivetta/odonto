import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null

        if (stored) {
            setTheme(stored)
            document.documentElement.classList.toggle('dark', stored === 'dark')
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const initial = prefersDark ? 'dark' : 'light'

            setTheme(initial)
            document.documentElement.classList.toggle('dark', initial === 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'

        setTheme(next)
        localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
    }

    return { theme, toggleTheme }
}
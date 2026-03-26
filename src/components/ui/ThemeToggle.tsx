import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg',
                'bg-surface-subtle hover:bg-border-subtle',
                'transition-colors',
                className
            )}
        >
            {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-content-primary" />
            ) : (
                <Moon className="w-4 h-4 text-content-primary" />
            )}
        </button>
    )
}
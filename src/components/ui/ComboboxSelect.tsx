'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxSelectProps {
    label: string
    required?: boolean
    value: string
    onChange: (value: string) => void
    options: ComboboxOption[]
    placeholder?: string
    className?: string
}

export default function ComboboxSelect({
    label, required, value, onChange, options, placeholder = 'Selecione...', className,
}: ComboboxSelectProps) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Sincroniza o texto do input com o label da opção selecionada
    useEffect(() => {
        const selected = options.find(o => o.value === value)
        setQuery(selected ? selected.label : '')
    }, [value, options])

    // Fecha ao clicar fora e restaura o label da seleção atual
    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                const selected = options.find(o => o.value === value)
                setQuery(selected ? selected.label : '')
            }
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [value, options])

    const selectedLabel = options.find(o => o.value === value)?.label ?? ''
    const filtered = query === selectedLabel
        ? options
        : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value)
        setIsOpen(true)
        if (!e.target.value) onChange('')
    }

    function handleSelect(option: ComboboxOption) {
        onChange(option.value)
        setQuery(option.label)
        setIsOpen(false)
    }

    return (
        <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
            <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={cn(
                        'w-full font-sans text-sm text-content-primary bg-surface-default',
                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                        'outline-none transition-[border-color] duration-150',
                        'placeholder:text-content-tertiary',
                        'hover:border-border-default focus:border-teal-400',
                    )}
                />
                {isOpen && filtered.length > 0 && (
                    <ul className={cn(
                        'absolute z-50 w-full mt-1',
                        'bg-surface-default border border-border-subtle rounded-md shadow-md',
                        'max-h-52 overflow-y-auto',
                    )}>
                        {filtered.map(option => (
                            <li
                                key={option.value}
                                onMouseDown={() => handleSelect(option)}
                                className={cn(
                                    'px-3.5 py-2.5 text-sm cursor-pointer transition-colors',
                                    option.value === value
                                        ? 'bg-teal-50 text-teal-700 font-medium'
                                        : 'text-content-primary hover:bg-surface-subtle',
                                )}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
                {isOpen && filtered.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-surface-default border border-border-subtle rounded-md shadow-md px-3.5 py-3 text-sm text-content-tertiary">
                        Nenhuma opção encontrada.
                    </div>
                )}
            </div>
        </div>
    )
}

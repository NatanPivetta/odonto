'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface NewActivityModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { title: string; description: string; deadline: string }) => void
}

export default function NewActivityModal({ open, onClose, onSave }: NewActivityModalProps) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline]     = useState('')
  const [loading, setLoading]       = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onSave({ title, description, deadline })
      setTitle('')
      setDescription('')
      setDeadline('')
      setLoading(false)
      onClose()
    }, 600)
  }

  if (!open) return null

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-content-primary/40 backdrop-blur-sm" />

      {/* Card do modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg',
          'bg-surface-default ',
          'border border-border-subtle ',
          'rounded-xl shadow-md',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle ">
          <div>
            <h2 className="font-serif text-xl text-content-primary ">
              Nova Atividade
            </h2>
            <p className="text-xs text-content-tertiary mt-0.5">
              Preencha os dados da atividade clínica
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <Input
            label="Título da atividade"
            placeholder="Ex: Exodontia Simples"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
              Descrição
            </label>
            <textarea
              className={cn(
                'font-sans text-sm text-content-primary ',
                'bg-surface-default ',
                'border-[1.5px] border-border-subtle rounded-md',
                'px-3.5 py-2.5 w-full outline-none resize-none',
                'placeholder:text-content-tertiary ',
                'transition-[border-color,box-shadow] duration-150',
                'hover:border-border-default ',
                'focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(31,163,163,0.12)]',
              )}
              rows={3}
              placeholder="Descreva o procedimento, objetivos e critérios de avaliação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Input
            label="Prazo"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Criar atividade
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Role } from '@/types'
import ThemeToggle from "@/components/ui/ThemeToggle";

// ── Tipos ──────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href?: string
  icon?: string
  badge?: number
  children?: NavItem[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ── Navegação por role ─────────────────────────────────────────────
const navAluno: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Meu painel',
        href: '/dashboard',
        icon: '📊',
        badge: 3,
      },
      {
        label: 'Atividades',
        href: '/atividades',
        icon: '📋',
        children: [
          { label: 'Pendentes',   href: '/atividades?status=pendente' },
          { label: 'Concluídas',  href: '/atividades?status=concluido' },
          { label: 'Reprovadas',  href: '/atividades?status=reprovado' },
        ],
      },
      { label: 'Meu progresso', href: '/progresso', icon: '📈' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Perfil', href: '/perfil', icon: '👤' },
    ],
  },
]

const navProfessor: NavSection[] = [
  {
    title: 'Gestão',
    items: [
      { label: 'Dashboard',  href: '/dashboard', icon: '📊' },
      {
        label: 'Atividades',
        href: '/atividades',
        icon: '📋',
        children: [
          { label: 'Criar atividade', href: '/atividades/criar' },
          { label: 'Aprovações',      href: '/atividades/aprovacoes', badge: 5 },
          { label: 'Todas',           href: '/atividades/todas' },
        ],
      },
      {
        label: 'Alunos',
        href: '/alunos',
        icon: '👥',
        children: [
          { label: 'Turmas',    href: '/alunos/turmas' },
          { label: 'Progresso', href: '/alunos/progresso' },
        ],
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Configurações', href: '/configuracoes', icon: '⚙️' },
    ],
  },
]

// ── Sub-componentes ────────────────────────────────────────────────
function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false

  return (
    <>
      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer',
            'text-sm font-normal text-content-secondary',
            'transition-all duration-150',
            'hover:bg-surface-subtle hover:text-content-primary',
            isActive && 'bg-teal-50 text-teal-700 font-medium',
          )}
        >
          {item.icon && (
            <span className={cn('opacity-60', isActive && 'opacity-100')}>
              {item.icon}
            </span>
          )}
          <span className="flex-1">{item.label}</span>
          {item.badge != null && (
            <span className="ml-auto bg-teal-100 text-teal-700 text-[11px] font-semibold px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-3 py-2 text-sm text-content-secondary">
          {item.icon && <span className="opacity-60">{item.icon}</span>}
          {item.label}
        </span>
      )}

      {/* Subitens */}
      {item.children && (
        <div className="ml-9 flex flex-col gap-0.5 mt-0.5">
          {item.children.map((child) => (
            <SidebarNavItem key={child.href ?? child.label} item={child} />
          ))}
        </div>
      )}
    </>
  )
}

// ── Componente principal ───────────────────────────────────────────
interface SidebarProps {
  role: Role
  userName?: string
  userInitials?: string
}

export default function Sidebar({ role, userName, userInitials = '?' }: SidebarProps) {
  const sections = role === 'PROFESSOR' ? navProfessor : navAluno

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-surface-default border-r border-border-subtle shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div className="w-8 h-8 rounded-md bg-teal-500 text-white flex items-center justify-center font-semibold text-sm shadow-brand">
          C
        </div>
        <div>
          <div className="font-serif text-[15px] text-content-primary leading-tight">ClinOdonto</div>
          <div className="text-[11px] text-content-tertiary tracking-wide">UFRGS</div>
        </div>
        <ThemeToggle />
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-content-tertiary px-3 mb-2">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <SidebarNavItem key={item.href ?? item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Rodapé do usuário */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-content-primary truncate">{userName ?? 'Usuário'}</p>
            <p className="text-[11px] text-content-tertiary">{role === 'PROFESSOR' ? 'Professor' : 'Aluno'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

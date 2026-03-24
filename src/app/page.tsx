// src/app/page.tsx
import Link from 'next/link'



export default function LandingPage() {
  return (
      <main className="min-h-screen bg-surface-page flex flex-col items-center justify-center px-4">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-teal-500 text-white flex items-center justify-center font-semibold text-lg shadow-brand">
            C
          </div>
          <div>
            <div className="font-serif text-xl text-content-primary leading-tight">ClinOdonto</div>
            <div className="text-xs text-content-tertiary tracking-wide">UFRGS</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl text-content-primary text-center max-w-lg leading-tight mb-4">
          Gestão de atividades clínicas
        </h1>
        <p className="text-content-secondary text-center max-w-md mb-10">
          Acompanhe procedimentos, aprovações e progresso acadêmico em um só lugar.
        </p>

        {/* CTA */}
        <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-teal-500 text-white font-medium text-sm px-6 py-3 rounded-md shadow-brand hover:bg-teal-600 transition-colors"
        >
          Entrar no sistema →
        </Link>

      </main>
  )
}
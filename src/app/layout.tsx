import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import VisualViewportSync from '@/components/layout/VisualViewportSync'
import './globals.css'

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-sans',
})

const dmSerifDisplay = DM_Serif_Display({
    subsets: ['latin'],
    weight: '400',
    style: ['normal', 'italic'],
    variable: '--font-serif',
})

export const metadata: Metadata = {
    title: 'ClinOdonto UFRGS',
    description: 'Sistema de gestão de atividades clínicas',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
        <body>
        <VisualViewportSync />
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    )
}

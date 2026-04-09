import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                surface: {
                    page: 'rgb(var(--surface-page) / <alpha-value>)',
                    default: 'rgb(var(--surface-default) / <alpha-value>)',
                    subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
                    elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
                },
                content: {
                    primary: 'rgb(var(--content-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--content-tertiary) / <alpha-value>)',
                },
                border: {
                    subtle: 'rgb(var(--border-subtle) / <alpha-value>)',
                    default: 'rgb(var(--border-default) / <alpha-value>)',
                    strong: 'rgb(var(--border-strong) / <alpha-value>)',
                },
                brand: {
                    primary: 'rgb(var(--brand-primary) / <alpha-value>)',
                    hover: 'rgb(var(--brand-hover) / <alpha-value>)',
                    subtle: 'rgb(var(--brand-subtle) / <alpha-value>)',
                },
            }
        },
    },
    plugins: [],
}

export default config
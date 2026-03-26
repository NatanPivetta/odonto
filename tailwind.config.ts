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
                },
                content: {
                    primary: 'rgb(var(--content-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--content-tertiary) / <alpha-value>)',
                },
                border: {
                    subtle: 'rgb(var(--border-subtle) / <alpha-value>)',
                    default: 'rgb(var(--border-default) / <alpha-value>)',
                },
                teal: {
                    500: '#1FA3A3',
                    600: '#178888',
                },
            },
        },
    },
    plugins: [],
}

export default config
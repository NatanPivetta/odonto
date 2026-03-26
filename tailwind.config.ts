import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                teal: {
                    50:  '#F0FAFA',
                    100: '#D9F2F2',
                    200: '#A8E0E0',
                    300: '#6FCACA',
                    400: '#3EB8B8',
                    500: '#1FA3A3',
                    600: '#178888',
                    700: '#0F6B6B',
                    800: '#094F4F',
                    900: '#053535',
                },
                surface: {
                    page:    '#F8FAFB',
                    default: '#FFFFFF',
                    subtle:  '#F1F5F7',
                },
                darkSurface: {
                    page:    '#0E1E24',
                    default: '#1C3038',
                    subtle:  '#2E4A54',
                },
                border: {
                    subtle:  '#E4ECEF',
                    default: '#C8D6DC',
                },
                darkBorder: {
                    subtle:  '#2E4A54',
                    default: '#4A6872',
                },
                content: {
                    primary:   '#1C3038',
                    secondary: '#6B8A94',
                    tertiary:  '#637276',
                },
                darkContent: {
                    primary:   '#F8FAFB',
                    secondary: '#637276',
                    tertiary:  '#6B8A94',
                },
            },
            fontFamily: {
                serif: ['DM Serif Display', 'Georgia', 'serif'],
                sans:  ['DM Sans', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                sm: '6px',
                md: '10px',
                lg: '16px',
                xl: '24px',
            },
            boxShadow: {
                xs:    '0 1px 2px rgba(14,30,36,0.06)',
                sm:    '0 2px 6px rgba(14,30,36,0.08)',
                md:    '0 4px 16px rgba(14,30,36,0.10)',
                brand: '0 4px 16px rgba(31,163,163,0.24)',
            },
        },
    },
    plugins: [],
}

export default config
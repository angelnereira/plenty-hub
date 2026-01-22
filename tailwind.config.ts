import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary brand color
                ueta: {
                    red: '#E60023',
                },
                // Backgrounds
                background: {
                    light: '#FAFAFA',
                    dark: '#1a1a1a',
                },
                // Cards
                card: {
                    light: '#FFFFFF',
                    dark: '#2a2a2a',
                },
                // Borders
                border: {
                    light: '#EAEAEA',
                    dark: '#404040',
                },
                // Text colors
                text: {
                    primary: {
                        light: '#333333',
                        dark: '#FFFFFF',
                    },
                    secondary: {
                        light: '#666666',
                        dark: '#A0A0A0',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-in-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
}

export default config

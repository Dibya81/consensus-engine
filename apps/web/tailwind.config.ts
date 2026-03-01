import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Academic Futuristic Theme Tokens
                background: '#0F1117', // deep navy
                surface: '#161A23', // soft dark panel
                surfaceHover: '#1C2230', // lighter panel
                border: '#1E293B', // slate-800
                primary: {
                    DEFAULT: '#8B5CF6', // purple-500
                    hover: '#a855f7', // purple-400
                    light: '#d8b4fe', // purple-300
                    dark: '#7c3aed', // purple-600
                },
                secondary: {
                    DEFAULT: '#22D3EE', // cyan-400
                },
                accent: {
                    DEFAULT: '#F472B6', // pink-400
                    hover: '#ec4899', // pink-500
                },
                status: {
                    verified: '#10b981', // emerald-500
                    partial: '#f59e0b', // amber-500
                    conflicted: '#ef4444', // red-500
                    single: '#3b82f6', // blue-500
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(168, 85, 247, 0.4)',
                'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
export default config

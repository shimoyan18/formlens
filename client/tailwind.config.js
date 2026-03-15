/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#050505',
                    deep: '#0A192F',
                    green: '#4AF626',
                    'green-dim': '#2A8A14',
                    'green-glow': '#4AF62640',
                    blue: '#8AE2FF',
                    'blue-dim': '#4A8A9F',
                    red: '#FF2A2A',
                    'red-dim': '#991A1A',
                    border: '#234B4C',
                    'border-light': '#2D6B6C',
                    panel: '#0A192F80',
                },
            },
            fontFamily: {
                heading: ['Orbitron', 'Space Mono', 'monospace'],
                mono: ['Space Mono', 'Roboto Mono', 'monospace'],
                sans: ['Noto Sans JP', 'system-ui', 'sans-serif'],
                serif: ['Noto Serif JP', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'glitch': 'glitch 0.3s ease-in-out',
                'scanline': 'scanline 8s linear infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'typing': 'typing 2s steps(20) forwards',
                'flicker': 'flicker 4s linear infinite',
                'data-stream': 'dataStream 20s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glitch: {
                    '0%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(-2px, -2px)' },
                    '60%': { transform: 'translate(2px, 2px)' },
                    '80%': { transform: 'translate(2px, -2px)' },
                    '100%': { transform: 'translate(0)' },
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4', boxShadow: '0 0 5px #4AF626' },
                    '50%': { opacity: '1', boxShadow: '0 0 20px #4AF626, 0 0 40px #4AF62640' },
                },
                typing: {
                    '0%': { width: '0' },
                    '100%': { width: '100%' },
                },
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '92%': { opacity: '1' },
                    '93%': { opacity: '0.8' },
                    '94%': { opacity: '1' },
                    '96%': { opacity: '0.6' },
                    '97%': { opacity: '1' },
                },
                dataStream: {
                    '0%': { backgroundPosition: '0% 0%' },
                    '100%': { backgroundPosition: '0% 100%' },
                },
            },
        },
    },
    plugins: [],
};

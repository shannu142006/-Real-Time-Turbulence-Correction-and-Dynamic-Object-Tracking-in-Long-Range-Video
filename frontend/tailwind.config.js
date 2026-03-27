/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00f2ff',
        secondary: '#7000ff',
        accent: '#ff0055',
        success: '#00ff9d',
        warning: '#ffcc00',
        dark: {
          950: '#020204',
          900: '#0a0a0f',
          800: '#12121e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scanline': 'scanlineMove 8s linear infinite',
        'dash': 'dash 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          from: { boxShadow: '0 0 5px #00f2ff, 0 0 10px #00f2ff44' },
          to: { boxShadow: '0 0 15px #00f2ff, 0 0 30px #00f2ff44' },
        },
        scanlineMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100vh' },
        },
        dash: {
          to: { strokeDashoffset: '-1000' },
        },
      },
    },
  },
  plugins: [],
}

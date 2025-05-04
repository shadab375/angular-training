/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shake': 'shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'typing': 'typing 1.2s steps(30, end)',
        'gradient': 'gradient 5s ease infinite',
        'gradient-background': 'gradientBackground 15s linear infinite',
        'gradient-background-slow': 'gradientBackground 30s linear infinite',
        'count': 'count 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gradientBackground: {
          '0%': { transform: 'rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'rotate(360deg)', opacity: '0.5' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        count: {
          '0%': { transform: 'scale(1.3)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ease-in-out-sine': 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
      },
      backgroundColor: {
        'black-opacity-95': 'rgba(0, 0, 0, 0.95)',
      },
      boxShadow: {
        'neon-purple': '0 0 5px theme(colors.purple.500), 0 0 20px theme(colors.purple.500)',
        'neon-blue': '0 0 5px theme(colors.blue.500), 0 0 20px theme(colors.blue.500)',
        'neon-green': '0 0 5px theme(colors.emerald.500), 0 0 20px theme(colors.emerald.500)',
      },
      dropShadow: {
        'glow-purple': '0 0 8px rgba(139, 92, 246, 0.7)',
        'glow-blue': '0 0 8px rgba(59, 130, 246, 0.7)',
        'glow-green': '0 0 8px rgba(16, 185, 129, 0.7)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sage - Natural, warm, zen-inspired palette
        sage: {
          50: '#f7faf6',   // Morning mist
          100: '#e8f5e8',  // Light sage
          200: '#d1e7cc',  // Soft sage
          300: '#a8d19a',  // Medium sage
          400: '#87a96b',  // Primary sage - main brand
          500: '#6b8e23',  // Deep sage
          600: '#4a7c59',  // Eucalyptus
          700: '#3d5a47',  // Forest sage
          800: '#2d3e2f',  // Dark sage
          900: '#1a2218',  // Darkest sage
        },
        earth: {
          50: '#fdfbf7',   // Lightest cream
          100: '#faf6f0',  // Warm cream background
          200: '#f4e4c1',  // Desert sand
          300: '#e6c79c',  // Light terracotta
          400: '#d2691e',  // Warm terracotta - accent
          500: '#b87333',  // Clay
          600: '#8b4513',  // Saddle brown
          700: '#654321',  // Dark brown
          800: '#3e2723',  // Very dark brown
          900: '#1c1612',  // Almost black brown
        },
        warm: {
          50: '#fefdfb',   // Softest white
          100: '#fdfaf5',  // Warm white
          200: '#f8f3ea',  // Light beige
          300: '#f0e6d2',  // Cream
          400: '#e4d4b4',  // Warm beige
          500: '#d4c4a8',  // Mushroom
          600: '#b8a082',  // Tan
          700: '#9c7c5f',  // Mocha
          800: '#7d5a3f',  // Coffee
          900: '#4a3728',  // Dark coffee
        },
        lavender: {
          50: '#faf9fc',   // Lightest lavender
          100: '#f3f0f8',  // Light lavender
          200: '#e6e0f8',  // Lavender haze
          300: '#d0c4f0',  // Soft lavender
          400: '#b8a7e8',  // Medium lavender
          500: '#9d8df1',  // Lavender
          600: '#7c6ce8',  // Deep lavender
          700: '#5b4bdb',  // Purple
          800: '#4338ca',  // Dark purple
          900: '#312e81',  // Darkest purple
        },
        natural: {
          white: '#fefefe',  // Natural white
          cream: '#faf6f0',  // Background cream
          charcoal: '#3a3a3a', // Text color
          stone: '#6b7280',   // Muted text
          mist: '#f9fafb',    // Light background
        },
        semantic: {
          success: '#6b8e23',  // Sage green
          warning: '#d2691e',  // Terracotta
          error: '#dc2626',    // Soft red
          info: '#5b4bdb',     // Lavender purple
        }
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-opensans)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-opensans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.6' }],
        sm: ['1rem', { lineHeight: '1.7' }],
        base: ['1.125rem', { lineHeight: '1.7' }],  // Larger base for readability
        lg: ['1.25rem', { lineHeight: '1.6' }],
        xl: ['1.5rem', { lineHeight: '1.5' }],
        '2xl': ['1.875rem', { lineHeight: '1.4' }],
        '3xl': ['2.25rem', { lineHeight: '1.3' }],
        '4xl': ['3rem', { lineHeight: '1.2' }],
        '5xl': ['3.75rem', { lineHeight: '1.1' }],
        '6xl': ['4.5rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-up': 'scaleUp 0.4s ease-out',
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 179, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 179, 0.8)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
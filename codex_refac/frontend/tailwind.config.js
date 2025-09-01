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
        // Sage Brand Colors - Consistent with CSS variables
        sage: {
          50: '#f7faf6',   // Background tints
          100: '#e8f5e8',  // Subtle backgrounds  
          200: '#d1e7cc',  // Borders, dividers
          300: '#a8d19a',  // Disabled states
          400: '#87a96b',  // Secondary actions
          500: '#6b8e23',  // Primary brand - WCAG AAA compliant
          600: '#4a7c59',  // Primary hover
          700: '#3d5a47',  // Primary pressed
          800: '#2d3e2f',  // High contrast text
          900: '#1a2218',  // Strongest contrast
        },
        // Semantic Colors
        success: '#6b8e23',   // Uses sage-500
        warning: '#d97706',   // Orange-600 - WCAG AA
        error: '#dc2626',     // Red-600 - WCAG AA  
        info: '#0ea5e9',      // Sky-500 - WCAG AA
        // Surface Colors
        surface: {
          primary: '#ffffff',
          secondary: '#fafafa', 
          tertiary: '#f7faf6',  // sage-50
          elevated: 'rgba(255, 255, 255, 0.95)',
          overlay: 'rgba(255, 255, 255, 0.9)',
        },
        // Text Colors - Optimized contrast
        text: {
          primary: '#0f172a',    // Slate-900 - WCAG AAA
          secondary: '#475569',  // Slate-600 - WCAG AA
          tertiary: '#64748b',   // Slate-500 - WCAG AA
          disabled: '#94a3b8',   // Slate-400
          inverse: '#ffffff',
        },
      },
      fontFamily: {
        // Modern trending font stack for 2025
        poppins: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        // Aliases for semantic usage  
        sans: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        ui: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Consistent type scale based on 1.25 modular scale
        xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
        base: ['1rem', { lineHeight: '1.5' }],       // 16px
        lg: ['1.25rem', { lineHeight: '1.625' }],    // 20px  
        xl: ['1.5rem', { lineHeight: '1.5' }],       // 24px
        '2xl': ['1.875rem', { lineHeight: '1.375' }], // 30px
        '3xl': ['2.25rem', { lineHeight: '1.3' }],   // 36px
        '4xl': ['3rem', { lineHeight: '1.25' }],     // 48px
        '5xl': ['3.75rem', { lineHeight: '1.1' }],   // 60px
        '6xl': ['4.5rem', { lineHeight: '1' }],      // 72px
      },
      borderRadius: {
        // Consistent radius scale
        sm: '0.375rem',   // 6px
        DEFAULT: '0.5rem', // 8px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
        '3xl': '2rem',    // 32px
      },
      boxShadow: {
        // Subtle elevation system
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        // Performance-optimized animations
        'fade-in': 'fadeIn 500ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 350ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 250ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'gentle-bounce': 'gentleBounce 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      spacing: {
        // Extended spacing scale
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      maxWidth: {
        // Extended container sizes
        '8xl': '88rem',   // 1408px
        '9xl': '96rem',   // 1536px
      },
      transitionTimingFunction: {
        // Custom easing functions
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
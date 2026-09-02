/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': '#121318',
        'surface': '#121318',
        'surface-container': '#1e1f24',
        'surface-container-low': '#1a1b20',
        'surface-container-high': '#292a2f',
        'surface-container-highest': '#34343a',
        'surface-container-lowest': '#0d0e13',
        'surface-bright': '#38393e',
        'surface-dim': '#121318',
        'surface-variant': '#34343a',

        'text-primary': '#F5F5F5',
        'text-secondary': '#A1A1AA',
        'text-metadata': '#71717A',
        
        'on-background': '#e3e1e9',
        'on-surface': '#e3e1e9',
        'on-surface-variant': '#c7c6cb',
        'on-secondary-fixed': '#1a1b21',
        'on-tertiary-fixed-variant': '#45464f',
        
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'outline-variant': '#46464b',
        'outline': '#919095',

        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-error': '#EF4444',
        
        'accent-insight-purple': '#8B5CF6',
        'accent-insight-blue': '#3B82F6',
        'accent-upi-blue': '#3B82F6',
        'accent-upi-purple': '#8B5CF6',
        'accent-upi-cyan': '#06B6D4',
        
        'nav-surface': '#F9F9F9',
        'primary-container': '#1c1d23',
        'primary': '#c7c6ce',
        'secondary': '#c6c6ce'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'label-bold': ['Inter', 'sans-serif'],
        'metadata': ['Inter', 'sans-serif'],
        'display-currency': ['Inter', 'sans-serif'],
        'display-currency-mobile': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-md': ['Inter', 'sans-serif'],
        'headline-lg': ['Inter', 'sans-serif'],
        'insight-narrative': ['Inter', 'sans-serif']
      },
      fontSize: {
        'metadata': ['11px', { lineHeight: '14px', fontWeight: '500' }],
        'label-bold': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'display-currency-mobile': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'display-currency': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'insight-narrative': ['14px', { lineHeight: '20px', fontWeight: '400' }]
      },
      spacing: {
        'base': '8px',
        'margin-mobile': '20px',
        'margin-desktop': '40px',
        'container-padding': '16px',
        'gutter': '16px',
        'section-gap': '24px'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'capsule': '2rem'
      }
    },
  },
  plugins: [],
}

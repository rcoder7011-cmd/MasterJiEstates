/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            dark: '#0A192F',
            DEFAULT: '#0F2444',
            light: '#1B3B6F',
          },
          gold: {
            DEFAULT: '#C5A059',
            dark: '#D4AF37',
            light: '#F4E8C1',
          }
        },
        surface: {
          primary: '#FAF9F6',
          secondary: '#F5F7FA',
          canvas: '#F0F4F8',
          card: '#FFFFFF',
          blue: '#EFF6FF',
        },
        text: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '22px',
        'pill': '999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 36, 68, 0.05), 0 1px 2px rgba(15, 36, 68, 0.03)',
        'card': '0 4px 12px rgba(15, 36, 68, 0.06)',
        'elevated': '0 10px 25px -3px rgba(15, 36, 68, 0.08), 0 4px 6px -2px rgba(15, 36, 68, 0.04)',
        'modal': '0 20px 40px -4px rgba(15, 36, 68, 0.16)',
        'neumorphic': '8px 8px 18px #d1d9e6, -8px -8px 18px #ffffff',
        'neumorphic-inset': 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff',
        'neumorphic-btn': '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff',
        'glass': '0 8px 32px 0 rgba(15, 36, 68, 0.08)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      }
    },
  },
  plugins: [],
}

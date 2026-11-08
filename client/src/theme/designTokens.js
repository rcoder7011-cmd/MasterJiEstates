// MasterJiEstates — Global Design System Tokens

export const colors = {
  brand: {
    navyDark: '#0A192F',      // Deepest Navy for high contrast & luxury dark mode
    navyPrimary: '#0F2444',   // Primary Navy brand color (Trust, Authority)
    navyLight: '#1B3B6F',     // Supporting Blue / Hover states
    goldPrimary: '#C5A059',   // Warm Champagne Gold (Prestige Accent)
    goldDark: '#D4AF37',      // Rich Classic Gold
    goldLight: '#F4E8C1',     // Soft Warm Gold tint
  },
  background: {
    primary: '#FAF9F6',       // Warm Off-White / Alabaster
    secondary: '#F5F7FA',     // Soft Neutral Grey
    surface: '#EFF6FF',       // Light Blue Tinted Surface
    canvas: '#F0F4F8',        // Neumorphic Canvas Tone
    card: '#FFFFFF',          // Pure White
  },
  text: {
    primary: '#172033',       // Charcoal Navy (High legibility)
    secondary: '#64748B',     // Slate Secondary
    muted: '#94A3B8',         // Muted / Placeholder text
    inverse: '#FFFFFF',       // White text on dark navy
  },
  status: {
    success: '#16A34A',       // Verified / Active / Approved
    warning: '#D97706',       // Pending Review / Under Negotiation
    error: '#DC2626',         // Rejected / Withdrawn / Error
    info: '#2563EB',          // Direct / Informational Notice
  },
  border: {
    subtle: '#E2E8F0',
    light: '#F1F5F9',
    focus: '#0F2444',
    gold: '#C5A059',
  }
};

export const shadows = {
  subtle: '0 1px 3px rgba(15, 36, 68, 0.05), 0 1px 2px rgba(15, 36, 68, 0.03)',
  card: '0 4px 12px rgba(15, 36, 68, 0.06)',
  elevated: '0 10px 25px -3px rgba(15, 36, 68, 0.08), 0 4px 6px -2px rgba(15, 36, 68, 0.04)',
  modal: '0 20px 40px -4px rgba(15, 36, 68, 0.16)',
  neumorphic: '8px 8px 18px #d1d9e6, -8px -8px 18px #ffffff',
  neumorphicInset: 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff',
  neumorphicBtn: '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff',
  neumorphicBtnActive: 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff',
  glass: '0 8px 32px 0 rgba(15, 36, 68, 0.08)',
};

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '22px',
  pill: '999px',
};

export const typography = {
  fonts: {
    heading: "'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  sizes: {
    display: { fontSize: '2.5rem', lineHeight: '1.15', fontWeight: '700' },
    h1: { fontSize: '2rem', lineHeight: '1.25', fontWeight: '600' },
    h2: { fontSize: '1.5rem', lineHeight: '1.3', fontWeight: '600' },
    h3: { fontSize: '1.25rem', lineHeight: '1.35', fontWeight: '600' },
    h4: { fontSize: '1.125rem', lineHeight: '1.4', fontWeight: '600' },
    bodyLg: { fontSize: '1.125rem', lineHeight: '1.5', fontWeight: '400' },
    body: { fontSize: '1rem', lineHeight: '1.5', fontWeight: '400' },
    bodySm: { fontSize: '0.875rem', lineHeight: '1.45', fontWeight: '400' },
    caption: { fontSize: '0.75rem', lineHeight: '1.4', fontWeight: '500' },
  }
};


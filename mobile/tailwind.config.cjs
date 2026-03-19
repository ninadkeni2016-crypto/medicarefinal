/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Brand (teal family from logo) ──────────────────────────────────
        primary:   '#1F4E5F',   // Deep teal — buttons, active state, icons
        secondary: '#6EC1C8',   // Soft cyan — secondary accents
        accent:    '#A8DADC',   // Light aqua — tints, backgrounds
        blue:      '#457B9D',   // Muted steel blue — tertiary accent

        // ── App surfaces ───────────────────────────────────────────────────
        background: '#F4F7F9',  // Teal-tinted off-white
        card:       '#FFFFFF',  // Card white
        'card-tint':'#F0F9FA',  // Subtle teal wash for metric cards

        // ── Borders ───────────────────────────────────────────────────────
        border:    '#D8E8EC',   // Teal-tinted border

        // ── Semantic status ────────────────────────────────────────────────
        success:   '#6BCB77',   // Soft green
        warning:   '#F4A261',   // Soft orange
        danger:    '#E76F51',   // Muted red-orange
        info:      '#6EC1C8',   // Cyan (= secondary)

        // ── Text ───────────────────────────────────────────────────────────
        text: {
          primary:   '#1C1C1E',
          secondary: '#6B7280',
          muted:     '#9CA3AF',
          disabled:  '#D1D5DB',
          white:     '#FFFFFF',
        }
      },
      borderRadius: {
        'sm':      '8px',
        'md':      '12px',
        'lg':      '20px',   // ↑ card radius
        'xl':      '24px',
        'medical': '12px',
      }
    },
  },
  plugins: [],
}

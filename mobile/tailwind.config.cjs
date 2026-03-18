/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3ABEF9',    // Soft Medical Blue
        secondary: '#D8B4FE',  // Lavender
        accent: '#99F6E4',     // Soft Teal
        background: '#F7F8FA', // Off-white
        border: '#E8EBF0',
        success: '#34D399',    // Soft Green
        warning: '#FBBF24',    // Soft Orange
        danger: '#F87171',     // Muted Red
        info: '#60A5FA',       // Soft Blue info
        text: {
          primary: '#1C1C1E',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          disabled: '#D1D5DB',
        }
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'medical': '12px',
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        courier: ['"Courier New"', 'Courier', 'monospace'],
        luxury: ['var(--font-playfair)', 'serif'],
        "google-sans": ['var(--font-google-sans)', 'sans-serif'], // <--- New Google Sans equivalent
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
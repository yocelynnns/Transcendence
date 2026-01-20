import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        link: '#646cff',
        linkHover: '#535bf2',
        btnBg: '#1a1a1a',
        btnHover: '#646cff',
      },
    },
  },
} satisfies Config;

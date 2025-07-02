/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'jwt-',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--jwt-border))",
        input: "hsl(var(--jwt-input))",
        ring: "hsl(var(--jwt-ring))",
        background: "hsl(var(--jwt-background))",
        foreground: "hsl(var(--jwt-foreground))",
        primary: {
          DEFAULT: "hsl(var(--jwt-primary))",
          foreground: "hsl(var(--jwt-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--jwt-secondary))",
          foreground: "hsl(var(--jwt-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--jwt-destructive))",
          foreground: "hsl(var(--jwt-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--jwt-muted))",
          foreground: "hsl(var(--jwt-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--jwt-accent))",
          foreground: "hsl(var(--jwt-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--jwt-popover))",
          foreground: "hsl(var(--jwt-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--jwt-card))",
          foreground: "hsl(var(--jwt-card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--jwt-radius)",
        md: "calc(var(--jwt-radius) - 2px)",
        sm: "calc(var(--jwt-radius) - 4px)",
      },
    },
  },
  plugins: [],
}
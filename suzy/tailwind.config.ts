import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        orb: {
          primary: "hsl(var(--orb-primary))",
          secondary: "hsl(var(--orb-secondary))",
          glow: "hsl(var(--orb-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "orb-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.8",
          },
        },
        "orb-glow": {
          "0%, 100%": {
            boxShadow: "0 0 40px hsl(var(--orb-glow) / 0.4), 0 0 80px hsl(var(--orb-glow) / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 60px hsl(var(--orb-glow) / 0.6), 0 0 120px hsl(var(--orb-glow) / 0.3)",
          },
        },
        "orb-spin": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "sparkle": {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0) translateY(0)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1) translateY(-10px)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "butterfly-fly": {
          "0%": {
            transform: "translate(0, -80px) rotate(0deg)",
          },
          "25%": {
            transform: "translate(56px, -56px) rotate(90deg)",
          },
          "50%": {
            transform: "translate(0, -32px) rotate(180deg)",
          },
          "75%": {
            transform: "translate(-56px, -56px) rotate(270deg)",
          },
          "100%": {
            transform: "translate(0, -80px) rotate(360deg)",
          },
        },
        "butterfly-flap-left": {
          "0%, 100%": {
            transform: "rotateY(0deg)",
          },
          "50%": {
            transform: "rotateY(60deg)",
          },
        },
        "butterfly-flap-right": {
          "0%, 100%": {
            transform: "rotateY(0deg)",
          },
          "50%": {
            transform: "rotateY(-60deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "orb-pulse": "orb-pulse 2s ease-in-out infinite",
        "orb-glow": "orb-glow 3s ease-in-out infinite",
        "orb-spin": "orb-spin 20s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "butterfly-fly": "butterfly-fly 6s ease-in-out infinite",
        "butterfly-flap-left": "butterfly-flap-left 0.2s ease-in-out infinite",
        "butterfly-flap-right": "butterfly-flap-right 0.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

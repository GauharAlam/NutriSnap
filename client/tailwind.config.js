/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
      },
      colors: {
        dark: {
          950: "var(--color-bg)",
          900: "var(--color-bg)",
          850: "var(--color-surface)",
          800: "var(--color-surface)",
          750: "var(--color-surface)",
          700: "var(--color-surface)",
          600: "var(--color-border)",
          500: "var(--color-border)",
          400: "var(--color-text-muted)",
          300: "var(--color-text-muted)",
          200: "var(--color-text-muted)",
          100: "var(--color-text)",
          50: "var(--color-text)",
        },
        neon: {
          blue: "var(--color-neon-blue)",
          purple: "var(--color-neon-purple)",
          pink: "#ec4899",
          green: "#10b981",
          teal: "#14b8a6",
          orange: "#f97316",
        },
        glass: {
          white: "var(--color-card)",
          light: "var(--glass-light)",
          medium: "var(--color-card)",
          strong: "var(--color-card)",
        },
      },
      boxShadow: {
        glass: "var(--card-shadow)",
        "glass-sm": "var(--card-shadow)",
        "neon-blue": "0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)",
        "neon-purple": "0 0 20px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)",
        "card-hover": "var(--card-shadow)",
        glow: "0 0 40px rgba(0, 212, 255, 0.2)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-down": "slideDown 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        "progress-fill": "progressFill 1.5s ease-out forwards",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(0, 212, 255, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 0%)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-dark":
          "linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 50%, var(--color-bg) 100%)",
        "gradient-card":
          "linear-gradient(135deg, var(--color-card) 0%, var(--glass-light) 100%)",
        "gradient-neon":
          "linear-gradient(135deg, var(--color-neon-blue) 0%, var(--color-neon-purple) 50%, var(--color-neon-blue) 100%)",
        "gradient-neon-subtle":
          "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(168,85,247,0.15) 100%)",
        "gradient-blue-purple":
          "linear-gradient(135deg, var(--color-neon-blue) 0%, var(--color-neon-purple) 100%)",
        "gradient-green-teal":
          "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
        "gradient-orange-pink":
          "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
      },
    },
  },
  plugins: [],
};

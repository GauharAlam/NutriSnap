/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        mint: "#c4f1d2",
        emerald: "#1f7a4f",
        sand: "#fff8ef",
        coral: "#f08b6f",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(240, 139, 111, 0.18), transparent 30%), radial-gradient(circle at 80% 0%, rgba(31, 122, 79, 0.18), transparent 26%), linear-gradient(135deg, #fffdf8 0%, #f7fbf8 100%)",
      },
    },
  },
  plugins: [],
};

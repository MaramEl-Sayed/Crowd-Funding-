export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",       // blue-600
        secondary: "#3b82f6",     // blue-500
        accent: "#bfdbfe",        // blue-200
        backgroundStart: "#eff6ff", // blue-50
        backgroundEnd: "#eff6ff",   // white
        "text-dark": "#374151",    // gray-700
        "text-light": "#ffffff"
      }
    },
  },
  plugins: [],
}

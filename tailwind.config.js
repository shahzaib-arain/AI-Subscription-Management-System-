/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0d0e12", // 225 15% 6%
        foreground: "#fcfcfc",
        card: "#15161d",
        border: "#24252e",
        input: "#24252e",
        primary: "#14ed9e", // 160 84% 50%
        "primary-foreground": "#0d0e12",
        secondary: "#23242f",
        "secondary-foreground": "#d9d9d9",
        muted: "#282a33",
        "muted-foreground": "#7e828d",
        accent: "#a96df5", // 270 80% 65%
        success: "#14ed9e",
        warning: "#ffd11a",
        destructive: "#f52222"
      }
    },
  },
  plugins: [],
}

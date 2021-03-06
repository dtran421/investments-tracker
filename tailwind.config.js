const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./src/renderer/**/*.{js,jsx,ts,tsx,ejs}"],
    darkMode: "class", // or 'media'
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans]
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};

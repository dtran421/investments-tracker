const colors = require("tailwindcss/colors");

module.exports = {
    content: ["./src/renderer/**/*.{js,jsx,ts,tsx,ejs}"],
    darkMode: "class", // or 'media'
    theme: {
        extend: {
            colors: {
                sky: colors.sky,
                cyan: colors.cyan
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};


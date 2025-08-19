module.exports = {
  plugins: [
    require('postcss-nesting'), // Ensure this line is before Tailwind CSS
    require('tailwindcss'),
    require('autoprefixer')
    // other plugins as needed
  ]
};

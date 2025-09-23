module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Ensure both vendor prefixes and standard properties are added
      flexbox: 'no-2009',
      grid: 'autoplace'
    },
  },
}
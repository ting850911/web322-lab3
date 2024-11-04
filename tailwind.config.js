module.exports = {
  content: [`./views/**/*.pug`],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
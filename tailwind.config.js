module.exports = {
  content: [`./views/**/*.html`],
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
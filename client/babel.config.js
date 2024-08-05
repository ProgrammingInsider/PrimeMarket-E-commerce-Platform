// babel.config.js
export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
        modules: false,
      },
    ],
    "@babel/preset-react",
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
    "babel-plugin-inline-react-svg",
    "@babel/plugin-syntax-dynamic-import",
    // Add other plugins here if needed
  ],
};

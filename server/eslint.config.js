export default {
  extends: ['eslint:recommended', 'plugin:node/recommended-module', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};

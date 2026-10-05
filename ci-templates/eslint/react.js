/**
 * Shared ESLint config for Anupheaus React/TSX repos.
 * Extends base — add this on top in React projects.
 *
 * Usage in .eslintrc.js:
 *   const react = require('../../agents/ci-templates/eslint/react');
 *   module.exports = { ...react, rules: { ...react.rules, /* overrides *\/ } };
 */
const base = require('./base');

module.exports = {
  ...base,
  plugins: [...base.plugins, 'eslint-plugin-react', 'react-hooks'],
  extends: [
    ...base.extends,
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    ...base.rules,
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-children-prop': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
  },
};

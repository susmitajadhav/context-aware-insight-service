import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // enables process, __dirname, etc.
      },
    },

    rules: {
      // Prevent noise but keep safety
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // You can keep console in backend (controlled logging)
      'no-console': 'off',
    },
  },
];
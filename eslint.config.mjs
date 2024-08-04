import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/', 'dist/'],
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'dir'] }],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      '@typescript-eslint/no-namespace': 'off',
      quotes: ['error', 'single'],
    },
  },
];

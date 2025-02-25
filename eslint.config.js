import eslint from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unused-css-selector': 'warn',

      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-undef': 'error',
      'prefer-const': 'warn',

      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
];

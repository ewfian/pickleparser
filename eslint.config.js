import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import tsdocPlugin from 'eslint-plugin-tsdoc';

export default [
  {
    ignores: ['dist/*', 'node_modules/*', '**/*.js'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
      tsdoc: tsdocPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'tsdoc/syntax': 'error',
    },
  },
];

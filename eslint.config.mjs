import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import tsdoc from 'eslint-plugin-tsdoc';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', '**/*.js', '!eslint.config.js'],
    },
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettier,
    {
        files: ['**/*.ts'],
        plugins: {
            tsdoc,
        },
        rules: {
            'prettier/prettier': 'error',
            'tsdoc/syntax': 'error',
        },
    },
);

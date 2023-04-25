module.exports = {
    ignorePatterns: ['dist/*', 'node_modules/*', '**/*.js'],
    overrides: [
        {
            files: ['**/*.ts'],
            extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-tsdoc'],
            rules: {
                'prettier/prettier': 'error',
                'tsdoc/syntax': 'error',
            },
        },
    ],
};

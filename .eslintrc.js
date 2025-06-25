module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourcetype: 'module',
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'prettier/prettier': 'error'
    },
};
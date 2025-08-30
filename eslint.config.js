import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';

export default [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      unicorn,
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,

      // Unicorn recommended rules
      ...unicorn.configs.recommended.rules,

      // Essential Airbnb-style rules
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Use TypeScript version

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Unicorn customization for Node.js
      'unicorn/prefer-module': 'off', // We're using ES modules
      'unicorn/prefer-top-level-await': 'off', // Not always available
      'unicorn/no-null': 'off', // TypeScript uses null
    },
  },

  // Prettier integration (must be last)
  prettier,
];

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Fix: Added eslint.config.mjs to ignores
    ignores: ['dist/**', 'node_modules/**', 'build/**', 'eslint.config.mjs'],
  },
  {
    languageOptions: {
      parserOptions: {
        // Change 'true' to your actual tsconfig path to be more explicit
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Added this to allow {} which you used in controllers
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  }
);

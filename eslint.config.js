const tseslint = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  // Ignore generated / build directories
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'babel.config.js',
      'metro.config.js',
      'eslint.config.js',
    ],
  },

  // TypeScript-aware rules — spreads plugin + parser setup
  ...tseslint.configs['flat/recommended'],

  // React hooks + project-wide rules
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Hooks correctness — error, not warn. Exhaustive-deps as warn to avoid noise.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Unused vars: TypeScript variant, with _ escape hatch
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      // any: warn, not error — codebase has legitimate unknowns during migration
      '@typescript-eslint/no-explicit-any': 'warn',

      // Require explicit return types only on exported functions (balance strictness/noise)
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // No direct console — must use logger utility
      'no-console': 'warn',

      // Basics
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript's own checker handles these — disable JS duplicates
      'no-undef': 'off',
      'no-redeclare': 'off',

      // require() is the standard React Native pattern for static asset imports
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Infrastructure files that use console intentionally
  {
    files: [
      'src/utils/logger.ts',
      'src/utils/perf.ts',
      'src/utils/sentry.ts',
      'src/utils/analytics.ts',
      'src/analytics/providers/console.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];

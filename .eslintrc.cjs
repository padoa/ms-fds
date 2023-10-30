module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'plugin:@padoa/base',
    'plugin:@padoa/vitest',
    'plugin:@padoa/backend',
    'plugin:@padoa/prettier',
    'plugin:import/typescript', // TODO: delete this, and fix imports (see https://app.circleci.com/pipelines/github/padoa/ms-sape-backend/3602/workflows/fcf03a88-6261-40f5-9b32-bd9542c9300f/jobs/14855/tests) or re-evaluate rules.
  ],
  plugins: ['@padoa'],
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  ignorePatterns: ['.eslintrc*.js'],
  rules: {
    'vitest/expect-expect': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'explicit',
      overrides: {
        'constructors': 'no-public',
      },
    }],
  }
};

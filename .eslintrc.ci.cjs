module.exports = {
  extends: './.eslintrc.cjs',
  rules: {
    'prettier/prettier': 'error',
    'import/no-deprecated': 'off', // Very very slow. As long as it's a warning, it is useless to run it on the CI
    'import/no-cycle': 'off', // Very very slow. We have a dedicated CI step for that (Circular)
  },
};

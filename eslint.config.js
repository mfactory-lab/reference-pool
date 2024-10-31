import antfu from '@antfu/eslint-config'

export default antfu(
  {
    gitignore: true,
    stylistic: true,
    typescript: true,
    formatters: true,
    prettier: true,
    unicorn: {
      allRecommended: true,
    },
    yaml: true,
    isInEditor: false,
    lessOpinionated: true,
    ignores: [
      '**/dist/**',
      '**/coverage/**',
    ],
  }, {
    rules: {
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-method-this-argument': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',

      'antfu/consistent-list-newline': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'curly': ['error', 'all'],

      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-imports': 'off',

      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'node/no-path-concat': 'off',

      'no-console': 'off',
    },
  },
)

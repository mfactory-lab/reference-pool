import antfu from '@antfu/eslint-config'

export default antfu(
  {
    gitignore: true,
    stylistic: true,
    typescript: true,
    formatters: true,
    yaml: true,
    toml: true,
    vue: true,
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
    ],
  }, {
    rules: {
      'antfu/consistent-list-newline': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'max-statements-per-line': ['error', { max: 2 }],
      'toml/padding-line-between-pairs': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],
      'curly': ['error', 'all'],
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'no-console': 'off',
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'regexp/no-unused-capturing-group': 'off',
    },
  },
)

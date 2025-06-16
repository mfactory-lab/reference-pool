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
      'antfu/consistent-list-newline': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      // 'max-statements-per-line': ['error', { max: 2 }],
      'regexp/no-unused-capturing-group': 'off',
      // 'curly': ['error', 'all'],
      'no-console': 'off',

      // TypeScript specific rules
      'ts/consistent-type-definitions': ['error', 'type'],

      // Vue specific rules
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],

      // Node.js specific rules
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',

      // Unicorn plugin rules
      // 'unicorn/no-array-callback-reference': 'off',
      // 'unicorn/no-array-method-this-argument': 'off',
      'unicorn/unicorn/prefer-global-this': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/switch-case-braces': ['error', 'avoid'],
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true, pascalCase: true },
          ignore: [/^[A-Z]+\..*$/], // e.g. README.md
        },
      ],
    },
  },
)

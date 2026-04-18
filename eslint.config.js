const js = require('@eslint/js');
const globals = require('globals');
const pluginVue = require('eslint-plugin-vue');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const vueParser = require('vue-eslint-parser');

module.exports = [
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'release/**',
      'node_modules/**',
      '.continue/**',
      'generate_index.js',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,js,jsx,cjs,mjs,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-undef': 'off',
      'no-case-declarations': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
]

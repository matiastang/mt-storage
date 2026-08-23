/*
 * @Author: matiastang
 * @Date: 2026-08-23 22:40:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 22:40:00
 * @FilePath: /web-storage/eslint.config.mjs
 * @Description: ESLint v9 flat config（Vue3 + TypeScript + Prettier）
 */
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginPrettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    // 全局忽略：构建产物与生成文件（buildJs/types 为 tsc --build 的输出目录）
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            'coverage/',
            'public/',
            'specs/',
            'docs/',
            'src/storage/buildJs/',
            'src/storage/types/',
        ],
    },
    // JS / TS：基础 + TS 推荐规则
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            'no-console': 'off',
            'no-debugger': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    // Vue SFC：essential 规则 + TS 子解析器
    // （core 的 no-unused-vars 不进 .vue：模板中使用的变量解析器无法感知，会误报）
    {
        files: ['**/*.vue'],
        extends: [...pluginVue.configs['flat/essential']],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
    // Prettier 统一格式（选项从 .prettierrc 解析，单一来源）
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
        plugins: { prettier: pluginPrettier },
        rules: {
            'prettier/prettier': 'error',
        },
    },
    // 必须放最后：关闭所有与 Prettier 冲突的格式类规则
    configPrettier
)

/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:10:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:10:00
 * @FilePath: /web-storage/vitest.config.ts
 * @Description: Vitest 配置（jsdom 提供 localStorage/sessionStorage）
 */
import path from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
    },
    test: {
        environment: 'jsdom',
        include: ['src/**/__tests__/**/*.spec.ts'],
        setupFiles: ['src/storage/__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/storage/**/*.ts'],
            exclude: ['src/storage/**/__tests__/**', 'src/storage/types/**', 'src/storage/tsconfig.json', 'src/storage/guard.ts'], // guard.ts 为纯类型模块，无运行时代码
            thresholds: {
                statements: 95,
                branches: 95,
                functions: 95,
                lines: 95,
            },
        },
    },
})

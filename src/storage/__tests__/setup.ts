/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:10:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:10:00
 * @FilePath: /web-storage/src/storage/__tests__/setup.ts
 * @Description: 测试环境初始化：每个用例前后清空两种 Web Storage
 */
import { afterEach, beforeEach } from 'vitest'

beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
})

afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
})

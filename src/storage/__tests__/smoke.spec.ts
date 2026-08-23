/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:12:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:12:00
 * @FilePath: /web-storage/src/storage/__tests__/smoke.spec.ts
 * @Description: 测试环境冒烟：验证 jsdom 的 Web Storage 可用与基础读写链路
 */
import { describe, expect, it } from 'vitest'
import { storageRead, storageWrite, WebStorageType } from '../index'

describe('环境冒烟测试', () => {
    it('jsdom 提供 localStorage 与 sessionStorage', () => {
        expect(typeof localStorage.setItem).toBe('function')
        expect(typeof sessionStorage.setItem).toBe('function')
    })

    it('基础类型可写入并读取（localStorage / sessionStorage）', () => {
        expect(storageWrite('SMOKE_LOCAL', 'hello')).toBe(true)
        expect(storageRead<string>('SMOKE_LOCAL')).toBe('hello')

        expect(storageWrite('SMOKE_SESSION', 100, WebStorageType.SESSION)).toBe(true)
        expect(storageRead<number>('SMOKE_SESSION', WebStorageType.SESSION)).toBe(100)
    })

    it('未存储的 key 读取返回 null', () => {
        expect(storageRead('NOT_EXIST_KEY')).toBeNull()
    })
})

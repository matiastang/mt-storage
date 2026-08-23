/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:20:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:20:00
 * @FilePath: /web-storage/src/storage/__tests__/sessionStorage.spec.ts
 * @Description: sessionStorage 封装单元测试（含 undefined 删除语义的 bug 回归）
 */
import { describe, expect, it, vi } from 'vitest'
import { sessionStorageWrite, sessionStorageRead, sessionStorageRemove, sessionStorageRemoveAll } from '../sessionStorage'

describe('sessionStorageWrite', () => {
    it('写入对象并可读取', () => {
        expect(sessionStorageWrite('OBJ', { value: 100 })).toBe(true)
        expect(sessionStorageRead('OBJ')).toEqual({ value: 100 })
    })

    it('写入 undefined 等同删除 sessionStorage 中的 key，且不影响 localStorage 同名 key', () => {
        sessionStorage.setItem('SHARED', '"session"')
        localStorage.setItem('SHARED', '"local"')

        expect(sessionStorageWrite('SHARED', undefined)).toBe(true)

        expect(sessionStorage.getItem('SHARED')).toBeNull()
        expect(localStorage.getItem('SHARED')).toBe('"local"')
        expect(sessionStorageRead('SHARED')).toBeNull()
    })

    it('写入 NaN 可存取（v0.3.0 起支持）', () => {
        expect(sessionStorageWrite('NAN', NaN)).toBe(true)
        expect(Number.isNaN(sessionStorageRead<number>('NAN'))).toBe(true)
    })

    it('序列化失败时返回 false 并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const circular: Record<string, unknown> = {}
        circular.self = circular
        expect(sessionStorageWrite('CIRCULAR', circular)).toBe(false)
        warn.mockRestore()
    })
})

describe('sessionStorageRead', () => {
    it('不存在返回 null', () => {
        expect(sessionStorageRead('NOT_EXIST')).toBeNull()
    })

    it('脏数据（非法 JSON）返回 null 并告警', () => {
        sessionStorage.setItem('DIRTY', '{invalid json')
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(sessionStorageRead('DIRTY')).toBeNull()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })
})

describe('sessionStorage 序列化错误分支', () => {
    it('底层 setItem 抛通用错误（配额满等）返回 false 并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError')
        })
        expect(sessionStorageWrite('S_QUOTA', { a: 1 })).toBe(false)
        spy.mockRestore()
        warn.mockRestore()
    })

    it('循环引用经 sessionStorageWrite 拒绝并告警（StorageSerializeError 路径）', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const circular: Record<string, unknown> = {}
        circular.self = circular
        expect(sessionStorageWrite('S_CIRCULAR', circular)).toBe(false)
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })

    it('非法 BigInt 标签载荷经 sessionStorageRead 返回 null 并告警', () => {
        sessionStorage.setItem(
            'S_BAD_BIGINT',
            JSON.stringify({ __matias_tag__: 'BigInt', __matias_value__: 'xyz' })
        )
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(sessionStorageRead('S_BAD_BIGINT')).toBeNull()
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })
})

describe('sessionStorageRemove / removeAll', () => {
    it('删除指定 key', () => {
        sessionStorageWrite('A', 1)
        sessionStorageWrite('B', 2)
        sessionStorageRemove('A')
        expect(sessionStorageRead('A')).toBeNull()
        expect(sessionStorageRead('B')).toBe(2)
    })

    it('清空所有 sessionStorage', () => {
        sessionStorageWrite('A', 1)
        localStorage.setItem('KEEP', '"keep"')
        sessionStorageRemoveAll()
        expect(sessionStorage.length).toBe(0)
        expect(localStorage.getItem('KEEP')).toBe('"keep"')
    })
})

/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:45:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:45:00
 * @FilePath: /web-storage/src/storage/__tests__/storage.spec.ts
 * @Description: 存取集成测试：storageWrite/Read 全链路（含标签序列化与向后兼容）
 */
import { describe, expect, it, vi } from 'vitest'
import { WebStorageType } from '../enum'
import { storageRead, storageRemove, storageRemoveAll, storageWrite } from '../storage'

describe('storageWrite / storageRead 集成：引用类型往返', () => {
    it('Date / Map / Set / RegExp / BigInt 经 localStorage 往返', () => {
        storageWrite('DATE', new Date(1000))
        expect(storageRead<Date>('DATE') instanceof Date).toBe(true)
        expect(storageRead<Date>('DATE')?.getTime()).toBe(1000)

        const map = new Map([['a', 1]])
        storageWrite('MAP', map)
        expect(storageRead<Map<string, number>>('MAP') instanceof Map).toBe(true)
        expect(storageRead<Map<string, number>>('MAP')?.get('a')).toBe(1)

        const set = new Set([1, 2])
        storageWrite('SET', set)
        expect(storageRead<Set<number>>('SET') instanceof Set).toBe(true)
        expect(storageRead<Set<number>>('SET')?.has(2)).toBe(true)

        storageWrite('REGEXP', /ab+c/gi)
        expect(storageRead<RegExp>('REGEXP')?.flags).toBe('gi')

        storageWrite('BIGINT', 9007199254740993n)
        expect(storageRead<bigint>('BIGINT')).toBe(9007199254740993n)
    })

    it('NaN / Infinity / -Infinity 可存取（v0.3.0 语义）', () => {
        expect(storageWrite('NAN', NaN)).toBe(true)
        expect(Number.isNaN(storageRead<number>('NAN'))).toBe(true)

        storageWrite('INF', Infinity)
        expect(storageRead<number>('INF')).toBe(Infinity)

        storageWrite('NEG_INF', -Infinity)
        expect(storageRead<number>('NEG_INF')).toBe(-Infinity)
    })

    it('嵌套结构整体往返（sessionStorage）', () => {
        const value = {
            date: new Date(0),
            map: new Map([['s', new Set([1n])]]),
            list: [undefined, NaN, new Date(5)],
        }
        expect(storageWrite('NESTED', value, WebStorageType.SESSION)).toBe(true)
        const revived = storageRead<typeof value>('NESTED', WebStorageType.SESSION)
        expect(revived?.date.getTime()).toBe(0)
        expect(revived?.map.get('s') instanceof Set).toBe(true)
        expect([...((revived?.map.get('s') as Set<bigint>) ?? [])][0]).toBe(1n)
        expect(revived?.list[0]).toBeUndefined()
        expect(Number.isNaN(revived?.list[1])).toBe(true)
        expect((revived?.list[2] as Date)?.getTime()).toBe(5)
    })

    it('普通对象底层存储仍为裸 JSON（线上格式兼容）', () => {
        storageWrite('PLAIN', { value: 100 })
        expect(localStorage.getItem('PLAIN')).toBe('{"value":100}')
        expect(storageRead('PLAIN')).toEqual({ value: 100 })
    })

    it('v0.2.0 旧格式数据可直接读取', () => {
        localStorage.setItem('OLD_OBJECT', '{"value":100}')
        localStorage.setItem('OLD_ARRAY', '[1,"a",null]')
        localStorage.setItem('OLD_STRING', '"hello"')
        localStorage.setItem('OLD_NUMBER', '100')
        localStorage.setItem('OLD_NULL', 'null')
        expect(storageRead('OLD_OBJECT')).toEqual({ value: 100 })
        expect(storageRead('OLD_ARRAY')).toEqual([1, 'a', null])
        expect(storageRead<string>('OLD_STRING')).toBe('hello')
        expect(storageRead<number>('OLD_NUMBER')).toBe(100)
        expect(storageRead('OLD_NULL')).toBeNull()
    })

    it('顶层 function / symbol 拒绝写入并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(storageWrite('FN', () => 1)).toBe(false)
        expect(storageWrite('SYM', Symbol('x'))).toBe(false)
        expect(localStorage.getItem('FN')).toBeNull()
        expect(warn).toHaveBeenCalledTimes(2)
        warn.mockRestore()
    })

    it('循环引用拒绝写入并告警，不产生半写入', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const circular: Record<string, unknown> = { name: 'c' }
        circular.self = circular
        expect(storageWrite('CIRCULAR', circular)).toBe(false)
        expect(localStorage.getItem('CIRCULAR')).toBeNull()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('底层 setItem 抛错（配额满等）返回 false 并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError')
        })
        expect(storageWrite('BIG', { a: 1 })).toBe(false)
        spy.mockRestore()
        warn.mockRestore()
    })

    it('脏数据（非法 JSON / 非法标签载荷）读取返回 null 并告警', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        localStorage.setItem('DIRTY', '{invalid json')
        expect(storageRead('DIRTY')).toBeNull()
        localStorage.setItem('BAD_BIGINT', JSON.stringify({ __matias_tag__: 'BigInt', __matias_value__: 'not-a-number' }))
        expect(storageRead('BAD_BIGINT')).toBeNull()
        expect(warn).toHaveBeenCalledTimes(2)
        warn.mockRestore()
    })
})

describe('storageRemove / storageRemoveAll', () => {
    it('删除与清空互不串扰（local 与 session 隔离）', () => {
        storageWrite('K', 1)
        storageWrite('K', 2, WebStorageType.SESSION)
        storageRemove('K')
        expect(storageRead('K')).toBeNull()
        expect(storageRead('K', WebStorageType.SESSION)).toBe(2)

        storageRemoveAll(WebStorageType.SESSION)
        expect(sessionStorage.length).toBe(0)
        expect(storageRead('K')).toBeNull() // localStorage 之前已删
        storageWrite('K2', 1)
        storageRemoveAll()
        expect(localStorage.length).toBe(0)
    })
})

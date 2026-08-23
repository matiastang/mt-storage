/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:30:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:30:00
 * @FilePath: /web-storage/src/storage/__tests__/serializer.spec.ts
 * @Description: 类型标签序列化协议单元测试（data-model.md 协议）
 */
import { describe, expect, it } from 'vitest'
import { StorageSerializeError } from '../errors'
import { deserialize, serialize } from '../serializer'

describe('serialize：特殊类型打标签', () => {
    it('普通数据保持裸 JSON（向后兼容的线上格式）', () => {
        expect(serialize({ value: 100 })).toBe('{"value":100}')
        expect(serialize([1, 'a', null])).toBe('[1,"a",null]')
        expect(serialize('str')).toBe('"str"')
        expect(serialize(100)).toBe('100')
        expect(serialize(true)).toBe('true')
        expect(serialize(null)).toBe('null')
    })

    it('Date 打标签', () => {
        expect(JSON.parse(serialize(new Date(0)))).toEqual({
            __matias_tag__: 'Date',
            __matias_value__: 0,
        })
    })

    it('Map / Set 打标签，载荷递归编码', () => {
        const encoded = JSON.parse(serialize(new Map<unknown, unknown>([['a', 1]])))
        expect(encoded).toEqual({ __matias_tag__: 'Map', __matias_value__: [['a', 1]] })

        const encodedSet = JSON.parse(serialize(new Set([1, 'a'])))
        expect(encodedSet).toEqual({ __matias_tag__: 'Set', __matias_value__: [1, 'a'] })
    })

    it('Map 的 key 为对象时也能编码', () => {
        const map = new Map<unknown, unknown>()
        map.set({ id: 1 }, 'value')
        const encoded = JSON.parse(serialize(map))
        expect(encoded.__matias_value__[0][0]).toEqual({ id: 1 })
    })

    it('RegExp 打标签（source + flags）', () => {
        expect(JSON.parse(serialize(/ab+c/gi))).toEqual({
            __matias_tag__: 'RegExp',
            __matias_value__: { s: 'ab+c', f: 'gi' },
        })
    })

    it('BigInt 以字符串打标签（无精度损失）', () => {
        const big = 9007199254740993n // > Number.MAX_SAFE_INTEGER + 1
        expect(JSON.parse(serialize(big))).toEqual({
            __matias_tag__: 'BigInt',
            __matias_value__: '9007199254740993',
        })
    })

    it('NaN / Infinity / -Infinity 打标签', () => {
        expect(JSON.parse(serialize(NaN))).toEqual({ __matias_tag__: 'NaN' })
        expect(JSON.parse(serialize(Infinity))).toEqual({ __matias_tag__: 'Infinity' })
        expect(JSON.parse(serialize(-Infinity))).toEqual({ __matias_tag__: '-Infinity' })
    })

    it('嵌套 undefined 保真（对象属性与数组元素）', () => {
        expect(JSON.parse(serialize({ a: 1, b: undefined }))).toEqual({
            a: 1,
            b: { __matias_tag__: 'undefined' },
        })
        expect(JSON.parse(serialize([1, undefined]))).toEqual([1, { __matias_tag__: 'undefined' }])
    })

    it('嵌套组合结构递归编码', () => {
        const value = { m: new Map([['d', new Date(0)]]), s: new Set([[1, 2]]), u: undefined }
        const encoded = JSON.parse(serialize(value))
        expect(encoded.m.__matias_value__[0][1]).toEqual({ __matias_tag__: 'Date', __matias_value__: 0 })
        expect(encoded.s.__matias_value__[0]).toEqual([1, 2])
        expect(encoded.u).toEqual({ __matias_tag__: 'undefined' })
    })

    it('空容器与空参数正则', () => {
        expect(JSON.parse(serialize(new Map()))).toEqual({ __matias_tag__: 'Map', __matias_value__: [] })
        expect(JSON.parse(serialize(new Set()))).toEqual({ __matias_tag__: 'Set', __matias_value__: [] })
        expect(JSON.parse(serialize(/x/))).toEqual({ __matias_tag__: 'RegExp', __matias_value__: { s: 'x', f: '' } })
    })

    it('对象的 function/symbol 属性按 JSON 语义丢弃；toJSON 语义保留', () => {
        const symbolKey = Symbol('s')
        const value = { a: 1, fn: () => 1, [symbolKey]: 'x' } as Record<string | symbol, unknown>
        expect(serialize(value)).toBe('{"a":1}')

        const withToDate = { toJSON: () => 'converted' }
        expect(serialize(withToDate)).toBe('"converted"')
    })

    it('循环引用抛出 StorageSerializeError', () => {
        const circular: Record<string, unknown> = { name: 'c' }
        circular.self = circular
        expect(() => serialize(circular)).toThrow(StorageSerializeError)
        // 共享引用（非循环）允许：重复序列化
        const shared = { id: 1 }
        expect(() => serialize({ a: shared, b: shared })).not.toThrow()
    })

    it('顶层 function / symbol 抛出 StorageSerializeError', () => {
        expect(() => serialize(() => 1)).toThrow(StorageSerializeError)
        expect(() => serialize(Symbol('x'))).toThrow(StorageSerializeError)
    })
})

describe('deserialize：标签还原', () => {
    it('特殊类型往返后类型与值一致', () => {
        const date = new Date(1234567890)
        expect(deserialize(serialize(date))).toEqual(date)
        expect(deserialize(serialize(date)) instanceof Date).toBe(true)

        const map = new Map<unknown, unknown>([['a', 1], [2, 'b']])
        const revivedMap = deserialize(serialize(map)) as Map<unknown, unknown>
        expect(revivedMap instanceof Map).toBe(true)
        expect([...revivedMap.entries()]).toEqual([['a', 1], [2, 'b']])

        const set = new Set([1, 'a', true])
        const revivedSet = deserialize(serialize(set)) as Set<unknown>
        expect(revivedSet instanceof Set).toBe(true)
        expect([...revivedSet.values()]).toEqual([1, 'a', true])

        const revivedRegExp = deserialize(serialize(/ab+c/gi)) as RegExp
        expect(revivedRegExp instanceof RegExp).toBe(true)
        expect(revivedRegExp.source).toBe('ab+c')
        expect(revivedRegExp.flags).toBe('gi')

        const big = 9007199254740993n
        expect(deserialize(serialize(big))).toBe(big)

        expect(deserialize(serialize(NaN))).toBeNaN()
        expect(deserialize(serialize(Infinity))).toBe(Infinity)
        expect(deserialize(serialize(-Infinity))).toBe(-Infinity)
    })

    it('嵌套 undefined 往返保真', () => {
        const revived = deserialize(serialize({ a: 1, b: undefined })) as Record<string, unknown>
        expect('a' in revived).toBe(true)
        expect('b' in revived).toBe(true)
        expect(revived.b).toBeUndefined()

        const revivedArray = deserialize(serialize([1, undefined])) as unknown[]
        expect(revivedArray.length).toBe(2)
        expect(revivedArray[1]).toBeUndefined()
    })

    it('嵌套组合结构往返', () => {
        const value = {
            date: new Date(0),
            map: new Map([['inner', new Set([1n, 2n])]]),
            nested: { deep: { nan: NaN, inf: Infinity } },
        }
        const revived = deserialize(serialize(value)) as typeof value
        expect(revived.date instanceof Date).toBe(true)
        expect(revived.date.getTime()).toBe(0)
        expect(revived.map.get('inner') instanceof Set).toBe(true)
        expect([...(revived.map.get('inner') as Set<bigint>)][1]).toBe(2n)
        expect(Number.isNaN(revived.nested.deep.nan)).toBe(true)
        expect(revived.nested.deep.inf).toBe(Infinity)
    })

    it('普通数据原样返回（v0.2.0 旧数据兼容）', () => {
        expect(deserialize('{"value":100}')).toEqual({ value: 100 })
        expect(deserialize('[1,"a",null]')).toEqual([1, 'a', null])
        expect(deserialize('"str"')).toBe('str')
        expect(deserialize('100')).toBe(100)
        expect(deserialize('null')).toBeNull()
        expect(deserialize('true')).toBe(true)
    })

    it('未知 tag 不还原，当作普通对象', () => {
        const raw = '{"__matias_tag__":"Future","__matias_value__":1,"other":2}'
        expect(deserialize(raw)).toEqual({ __matias_tag__: 'Future', __matias_value__: 1, other: 2 })
    })

    it('非法 JSON 抛出 SyntaxError（由调用方决定告警策略）', () => {
        expect(() => deserialize('{invalid')).toThrow(SyntaxError)
    })
})

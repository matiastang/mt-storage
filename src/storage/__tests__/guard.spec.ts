/*
 * @Author: matiastang
 * @Date: 2026-08-23 21:15:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:15:00
 * @FilePath: /web-storage/src/storage/__tests__/guard.spec.ts
 * @Description: storageRead 运行时校验（type guard）测试
 */
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { WebStorageType } from '../enum'
import { defineStorageKey } from '../key'
import { storageRead, storageWrite } from '../storage'

interface TestType {
    value: number
}

const isTestType = (v: unknown): v is TestType =>
    !!v && typeof v === 'object' && typeof (v as TestType).value === 'number'

describe('storageRead guard 校验（字符串 key）', () => {
    it('校验通过返回原值', () => {
        storageWrite('G_OK', { value: 100 })
        expect(storageRead<TestType>('G_OK', WebStorageType.LOCAL, isTestType)).toEqual({
            value: 100,
        })
    })

    it('校验失败告警并返回 null', () => {
        storageWrite('G_BAD', { value: 'not-a-number' })
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(storageRead<TestType>('G_BAD', WebStorageType.LOCAL, isTestType)).toBeNull()
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0][0]).toContain('G_BAD')
        warn.mockRestore()
    })

    it('key 不存在返回 null 且不告警、不调用 guard', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const guard = vi.fn(isTestType) as unknown as typeof isTestType
        expect(storageRead<TestType>('G_MISSING', WebStorageType.LOCAL, guard)).toBeNull()
        expect(warn).not.toHaveBeenCalled()
        expect(guard).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('sessionStorage 路径同样支持 guard', () => {
        storageWrite('G_SESSION', { value: 'bad' }, WebStorageType.SESSION)
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(storageRead<TestType>('G_SESSION', WebStorageType.SESSION, isTestType)).toBeNull()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('不传 guard 保持 v0.2.0 行为（无校验直接返回）', () => {
        storageWrite('G_RAW', { value: 'whatever' })
        expect(storageRead<TestType>('G_RAW')).toEqual({ value: 'whatever' })
    })

    it('guard 对基础类型值同样生效', () => {
        storageWrite('G_NUM', 100)
        const isNumber = (v: unknown): v is number => typeof v === 'number'
        expect(storageRead<number>('G_NUM', WebStorageType.LOCAL, isNumber)).toBe(100)

        const isString = (v: unknown): v is string => typeof v === 'string'
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(storageRead<string>('G_NUM', WebStorageType.LOCAL, isString)).toBeNull()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })
})

describe('storageRead guard 校验（typed key 组合）', () => {
    it('typed key + guard：校验失败告警返回 null，通过返回推断类型', () => {
        const userKey = defineStorageKey<TestType>('G_TYPED')
        storageWrite(userKey, { value: 100 })
        expect(storageRead(userKey, isTestType)).toEqual({ value: 100 })

        storageWrite(userKey, { value: 'corrupted' } as unknown as TestType)
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(storageRead(userKey, isTestType)).toBeNull()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()

        expectTypeOf(storageRead(userKey, isTestType)).toEqualTypeOf<TestType | null>()
    })
})

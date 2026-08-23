/*
 * @Author: matiastang
 * @Date: 2026-08-23 21:00:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:00:00
 * @FilePath: /web-storage/src/storage/__tests__/key.spec.ts
 * @Description: typed key（defineStorageKey）行为测试
 */
import { describe, expect, expectTypeOf, it } from 'vitest'
import { WebStorageType } from '../enum'
import { defineStorageKey } from '../key'
import { storageRead, storageRemove, storageWrite } from '../storage'

interface TestUser {
    name: string
    age: number
}

describe('defineStorageKey', () => {
    it('默认使用 localStorage', () => {
        const userKey = defineStorageKey<TestUser>('USER')
        storageWrite(userKey, { name: 'matias', age: 18 })
        expect(localStorage.getItem('USER')).not.toBeNull()
        expect(sessionStorage.getItem('USER')).toBeNull()
        expect(storageRead(userKey)).toEqual({ name: 'matias', age: 18 })
    })

    it('指定 SESSION 使用 sessionStorage', () => {
        const sessionKey = defineStorageKey<TestUser>('S_USER', WebStorageType.SESSION)
        storageWrite(sessionKey, { name: 't', age: 1 })
        expect(sessionStorage.getItem('S_USER')).not.toBeNull()
        expect(localStorage.getItem('S_USER')).toBeNull()
        expect(storageRead(sessionKey)).toEqual({ name: 't', age: 1 })
    })

    it('storageRemove 支持typed key（删除对应存储）', () => {
        const localKey = defineStorageKey<number>('R_LOCAL')
        const sessionKey = defineStorageKey<number>('R_SESSION', WebStorageType.SESSION)
        storageWrite(localKey, 1)
        storageWrite(sessionKey, 2)
        storageRemove(localKey)
        expect(localStorage.getItem('R_LOCAL')).toBeNull()
        expect(sessionStorage.getItem('R_SESSION')).not.toBeNull()
        storageRemove(sessionKey)
        expect(sessionStorage.getItem('R_SESSION')).toBeNull()
    })

    it('typed key 写入引用类型同样往返', () => {
        const dateKey = defineStorageKey<Date>('T_DATE')
        storageWrite(dateKey, new Date(42))
        expect(storageRead(dateKey)?.getTime()).toBe(42)
    })

    it('typed key 的值域在编译期校验（expectTypeOf）', () => {
        const userKey = defineStorageKey<TestUser>('TYPE_CHECK')
        // 读取类型自动推断为 TestUser | null
        expectTypeOf(storageRead(userKey)).toEqualTypeOf<TestUser | null>()
        // (typedKey, T) => boolean 重载存在
        const writeUser: (key: typeof userKey, value: TestUser) => boolean = storageWrite
        expectTypeOf(writeUser).toBeFunction()
        // 值类型不匹配必须编译报错
        // @ts-expect-error value 应为 TestUser
        storageWrite(userKey, 'not-a-user')
        expectTypeOf(userKey.key).toEqualTypeOf<string>()
        expectTypeOf(userKey.storageType).toEqualTypeOf<WebStorageType>()
    })
})

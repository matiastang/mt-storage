/*
 * @Author: matiastang
 * @Date: 2021-11-12 11:42:05
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:50:00
 * @FilePath: /web-storage/src/storage/localStorage.ts
 * @Description: localStorage简单封装
 */
import { StorageSerializeError } from './errors'
import { resolveKeyString, StorageKey } from './key'
import { deserialize, serialize } from './serializer'

/**
 * 存储localStorage数据
 * @param key 存储key
 * @param value 存储值(object | string | boolean | number | bigint | null | undefined)，undefined同删除。
 * @returns 成功返回true；undefined删除返回true；不支持类型（循环引用/顶层函数等）或写入失败返回false并告警。
 */
export const localStorageWrite = (
    key: string | StorageKey<unknown>,
    value: object | string | boolean | number | bigint | null | undefined
) => {
    const keyString = resolveKeyString(key)
    if (typeof value === 'undefined') {
        localStorage.removeItem(keyString)
        return true
    }
    try {
        localStorage.setItem(keyString, serialize(value))
        return true
    } catch (err) {
        console.warn(
            `mt-storage localStorage write ${keyString} value=${String(value)}:`,
            err instanceof StorageSerializeError ? err.message : err
        )
        return false
    }
}

/**
 * 读取localStorage数据
 * @param key 存储key
 * @returns 反序列化后的值；key不存在、存储null或解析失败返回null（后两者告警仅解析失败触发）
 */
export const localStorageRead = <T = any>(key: string | StorageKey<unknown>): T | null => {
    const value = localStorage.getItem(resolveKeyString(key))
    if (value === null) {
        return null
    }
    try {
        return <T>deserialize(value)
    } catch (err) {
        console.warn(
            `mt-storage localStorage read ${resolveKeyString(key)}:`,
            err instanceof StorageSerializeError ? err.message : err
        )
    }
    return null
}

/**
 * 清除localStorage数据
 * @param key 存储key
 */
export const localStorageRemove = (key: string | StorageKey<unknown>) => {
    localStorage.removeItem(resolveKeyString(key))
}

/**
 * 清除所有LocalStorage数据
 */
export const localStorageRemoveAll = () => {
    localStorage.clear()
}

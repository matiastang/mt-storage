/*
 * @Author: matiastang
 * @Date: 2022-11-17 10:45:12
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:50:00
 * @FilePath: /web-storage/src/storage/sessionStorage.ts
 * @Description: sessionStorage简单封装
 */
import { StorageSerializeError } from './errors'
import { deserialize, serialize } from './serializer'

/**
 * 存储sessionStorage数据
 * @param key 存储key
 * @param value 存储值(object | string | boolean | number | bigint | null | undefined)，undefined同删除。
 * @returns 成功返回true；undefined删除返回true；不支持类型（循环引用/顶层函数等）或写入失败返回false并告警。
 */
export const sessionStorageWrite = (
    key: string,
    value: object | string | boolean | number | bigint | null | undefined
) => {
    if (typeof value === 'undefined') {
        sessionStorage.removeItem(key)
        return true
    }
    try {
        sessionStorage.setItem(key, serialize(value))
        return true
    } catch (err) {
        console.warn(
            `mt-storage sessionStorage write ${key} value=${String(value)}:`,
            err instanceof StorageSerializeError ? err.message : err
        )
        return false
    }
}

/**
 * 读取sessionStorage数据
 * @param key 存储key
 * @returns 反序列化后的值；key不存在、存储null或解析失败返回null（解析失败会告警）
 */
export const sessionStorageRead = <T = any>(key: string): T | null => {
    const value = sessionStorage.getItem(key)
    if (value === null) {
        return null
    }
    try {
        return <T>deserialize(value)
    } catch (err) {
        console.warn(
            `mt-storage sessionStorage read ${key}:`,
            err instanceof StorageSerializeError ? err.message : err
        )
    }
    return null
}

/**
 * 清除sessionStorage数据
 * @param key 存储key
 */
export const sessionStorageRemove = (key: string) => {
    sessionStorage.removeItem(key)
}

/**
 * 清除所有sessionStorage数据
 */
export const sessionStorageRemoveAll = () => {
    sessionStorage.clear()
}

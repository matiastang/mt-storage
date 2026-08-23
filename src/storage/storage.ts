/*
 * @Author: matiastang
 * @Date: 2022-11-17 11:16:09
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:05:00
 * @FilePath: /web-storage/src/storage/storage.ts
 * @Description: storage统一入口：typed key 类型推断 + 运行时校验
 */
import { WebStorageType } from './enum'
import { StorageValueGuard } from './guard'
import { InferStorageKey, resolveKeyString, resolveStorageType, StorageKey } from './key'
import {
    localStorageWrite,
    localStorageRead,
    localStorageRemove,
    localStorageRemoveAll,
} from './localStorage'
import {
    sessionStorageWrite,
    sessionStorageRead,
    sessionStorageRemove,
    sessionStorageRemoveAll,
} from './sessionStorage'

/**
 * 可写入的值域（bigint 自 v0.3.0 起支持）
 */
export type StorageWritableValue = object | string | boolean | number | bigint | null | undefined

/**
 * 存储storage数据（typed key：值类型自动关联 key 的类型）
 * @param key typed key（defineStorageKey 创建）
 * @param value 与 key 类型一致的值
 */
export function storageWrite<K extends StorageKey<unknown>>(
    key: K,
    value: InferStorageKey<K> & StorageWritableValue
): boolean
/**
 * 存储storage数据（字符串 key：v0.2.0 兼容用法）
 * @param key 存储key
 * @param value 存储值，undefined等同删除
 * @param type 存储类型，默认localStorage
 */
export function storageWrite(
    key: string,
    value: StorageWritableValue,
    type?: WebStorageType
): boolean
export function storageWrite(
    key: string | StorageKey<unknown>,
    value: StorageWritableValue,
    type?: WebStorageType
): boolean {
    const resolvedType = resolveStorageType(key, type)
    const keyString = resolveKeyString(key)
    if (resolvedType === WebStorageType.SESSION) {
        return sessionStorageWrite(keyString, value)
    }
    return localStorageWrite(keyString, value)
}

/**
 * 读取storage数据（typed key：返回类型自动推断，可选 guard 校验）
 * @param key typed key
 * @param guard 可选运行时校验，失败告警并返回 null
 */
export function storageRead<K extends StorageKey<unknown>>(
    key: K,
    guard?: StorageValueGuard<InferStorageKey<K>>
): InferStorageKey<K> | null
/**
 * 读取storage数据（字符串 key：v0.2.0 兼容用法）
 * @param key 存储key
 * @param type 存储类型，默认localStorage
 * @param guard 可选运行时校验，失败告警并返回 null
 */
export function storageRead<T = any>(
    key: string,
    type?: WebStorageType,
    guard?: StorageValueGuard<T>
): T | null
export function storageRead(
    key: string | StorageKey<unknown>,
    typeOrGuard?: WebStorageType | StorageValueGuard<unknown>,
    maybeGuard?: StorageValueGuard<unknown>
): unknown {
    const guard = typeof typeOrGuard === 'function' ? typeOrGuard : maybeGuard
    const type = typeof typeOrGuard === 'function' ? undefined : typeOrGuard
    const resolvedType = resolveStorageType(key, type)
    const keyString = resolveKeyString(key)
    const value =
        resolvedType === WebStorageType.SESSION
            ? sessionStorageRead(keyString)
            : localStorageRead(keyString)
    if (value === null) {
        // key 不存在（或存了 null）：不视为校验失败，不告警
        return null
    }
    if (guard && !guard(value)) {
        console.warn(
            `mt-storage storage read ${keyString}: value failed the type guard, return null instead`
        )
        return null
    }
    return value
}

/**
 * 清除storage数据（支持 typed key，typed key 时可省略 type）
 * @param key 存储key
 * @param type 存储类型
 */
export function storageRemove(key: string | StorageKey<unknown>, type?: WebStorageType) {
    const resolvedType = resolveStorageType(key, type)
    const keyString = resolveKeyString(key)
    if (resolvedType === WebStorageType.SESSION) {
        sessionStorageRemove(keyString)
    } else {
        localStorageRemove(keyString)
    }
}

/**
 * 清除所有storage数据
 * @param type 存储类型，默认localStorage
 */
export const storageRemoveAll = (type: WebStorageType = WebStorageType.LOCAL) => {
    if (type === WebStorageType.SESSION) {
        sessionStorageRemoveAll()
    } else {
        localStorageRemoveAll()
    }
}

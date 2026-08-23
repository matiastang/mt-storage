/*
 * @Author: matiastang
 * @Date: 2026-08-23 21:05:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:05:00
 * @FilePath: /web-storage/src/storage/key.ts
 * @Description: typed key —— 带类型烙印的存储 key，读写时自动推断类型
 */
import { WebStorageType } from './enum'

/**
 * 类型烙印（仅编译期存在，防止不同 T 的 key 互相赋值）
 */
const StorageKeyBrand: unique symbol = Symbol('matias.storageKey')

/**
 * 带类型的存储 key
 */
export interface StorageKey<T = unknown> {
    /** 存储键名 */
    readonly key: string
    /** 目标存储类型 */
    readonly storageType: WebStorageType
    readonly [StorageKeyBrand]: T
}

/**
 * 从 typed key 提取存储值类型
 */
export type InferStorageKey<K> = K extends StorageKey<infer T> ? T : never

/**
 * 定义带类型的存储 key
 * @param key 存储键名
 * @param type 存储类型，默认 localStorage
 * @returns typed key，供 storageWrite / storageRead / storageRemove 使用，类型自动推断
 */
export const defineStorageKey = <T>(
    key: string,
    type: WebStorageType = WebStorageType.LOCAL
): StorageKey<T> => ({
    key,
    storageType: type,
    [StorageKeyBrand]: undefined as unknown as T,
})

/**
 * 解析 key 字符串（string | StorageKey → string）
 */
export const resolveKeyString = (key: string | StorageKey<unknown>): string =>
    typeof key === 'string' ? key : key.key

/**
 * 解析存储类型：typed key 携带默认存储类型，显式传入的 type 优先
 */
export const resolveStorageType = (
    key: string | StorageKey<unknown>,
    type?: WebStorageType
): WebStorageType => {
    if (type !== undefined) {
        return type
    }
    return typeof key === 'string' ? WebStorageType.LOCAL : key.storageType
}

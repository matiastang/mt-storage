/*
 * @Author: matiastang
 * @Date: 2022-11-17 11:16:09
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:37:04
 * @FilePath: /mt-storage/src/storage/storage.ts
 * @Description: torage简单封装
 */
import { WebStorageType } from './enum'
import { localStorageWrite, localStorageRead, localStorageRemove, localStorageRemoveAll } from './localStorage'
import { sessionStorageWrite, sessionStorageRead, sessionStorageRemove, sessionStorageRemoveAll } from './sessionStorage'
/**
 * 存储storage数据
 * @param key 存储key
 * @param value 存储值
 */
export const storageWrite = (key: string, value: object | string | boolean | number, type: WebStorageType = WebStorageType.LOCAL) => {
    if (type === WebStorageType.SESSION) {
        return sessionStorageWrite(key, value)
    } else {
        return localStorageWrite(key, value)
    }
}

/**
 * 读取storage数据
 * @param key 
 * @param type 
 * @returns 
 */
export const storageRead = <T>(key: string, type: WebStorageType = WebStorageType.LOCAL): T | null => {
    if (type === WebStorageType.SESSION) {
        return sessionStorageRead<T>(key)
    } else {
        return localStorageRead<T>(key)
    }
}

/**
 * 清除storage数据
 * @param key 
 * @param type 
 */
export const storageRemove = (key: string, type: WebStorageType = WebStorageType.LOCAL) => {
    if (type === WebStorageType.SESSION) {
        sessionStorageRemove(key)
    } else {
        localStorageRemove(key)
    }
}

/**
 * 清除所有storage数据
 * @param type 
 */
export const storageRemoveAll = (type: WebStorageType = WebStorageType.LOCAL) => {
    if (type === WebStorageType.SESSION) {
        sessionStorageRemoveAll()
    } else {
        localStorageRemoveAll()
    }
}

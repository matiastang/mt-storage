/*
 * @Author: matiastang
 * @Date: 2021-11-12 11:42:05
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 11:30:01
 * @FilePath: /mt-storage/src/storage/localStorage.ts
 * @Description: localStorage简单封装
 */
/**
 * 
 * @param key 存储key
 * @param value 存储值
 */

/**
 * 存储localStorage数据
 * @param key 存储key
 * @param value 存储值(object | string | boolean | number | null | undefined)，number不能为NaN，undefined同删除。
 * @returns 
 */
export const localStorageWrite = (key: string, value: object | string | boolean | number | null | undefined) => {
  if (typeof value === 'undefined') {
    localStorage.removeItem(key)
    return true
  }
  if (Number.isNaN(value)) {
    console.warn(`mt-storage localStorage write ${key} value=${value} number is NaN`)
    return false
  }
  try {
    const saveValue = JSON.stringify(value)
    localStorage.setItem(key, saveValue)
    return true
  } catch (err) {
    console.warn(`mt-storage localStorage write ${key} value=${value}`, err)
    return false
  }
}

/**
 * 读取localStorage数据
 * @param key 存储key
 * @returns
 */
export const localStorageRead = (key: string): any => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  try {
    return JSON.parse(value)
  } catch (err) {
    console.warn(`mt-storage localStorage red ${key}：`, err)
  }
  return null
}

/**
 * 清除localStorage数据
 * @param key 存储key
 * @returns 返回类型
 */
export const localStorageRemove = (key: string) => {
  localStorage.removeItem(key)
}

/**
 * 清除所有LocalStorage数据
 * @returns 返回类型
 */
export const localStorageRemoveAll = () => {
  localStorage.clear()
}

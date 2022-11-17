/*
 * @Author: matiastang
 * @Date: 2021-11-12 11:42:05
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:45:29
 * @FilePath: /mt-storage/src/storage/localStorage.ts
 * @Description: localStorage简单封装
 */
/**
 * 存储localStorage数据
 * @param key 存储key
 * @param value 存储值
 */
export const localStorageWrite = (key: string, value: object | string | boolean | number) => {
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
export const localStorageRead = <T>(key: string): T | null => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  try {
    return <T>JSON.parse(value)
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

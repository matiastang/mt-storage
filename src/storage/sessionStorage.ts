/*
 * @Author: matiastang
 * @Date: 2022-11-17 10:45:12
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:36:39
 * @FilePath: /mt-storage/src/storage/sessionStorage.ts
 * @Description: sessionStorage简单封装
 */
/**
 * 存储sessionStorage数据
 * @param key 存储key
 * @param value 存储值
 */
export const sessionStorageWrite = (key: string, value: object | string | boolean | number) => {
    try {
        const saveValue = JSON.stringify(value)
        sessionStorage.setItem(key, saveValue)
        return true
    } catch (err) {
        console.warn(`mt-storage sessionStorage write ${key} value=${value}`, err)
        return false
    }
}

/**
 * 读取sessionStorage数据
 * @param key 存储key
 * @returns
 */
export const sessionStorageRead = <T>(key: string): T | null => {
  const value = sessionStorage.getItem(key)
  if (value === null) {
    return null
  }
  try {
    return <T>JSON.parse(value)
  } catch (err) {
    console.warn(`mt-storage sessionStorage red ${key}：`, err)
  }
  return null
}

/**
 * 清除sessionStorage数据
 * @param key 存储key
 * @returns 返回类型
 */
export const sessionStorageRemove = (key: string) => {
  sessionStorage.removeItem(key)
}

/**
 * 清除所有sessionStorage数据
 * @returns 返回类型
 */
export const sessionStorageRemoveAll = () => {
  sessionStorage.clear()
}

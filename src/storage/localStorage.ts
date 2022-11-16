/*
 * @Author: matiastang
 * @Date: 2021-11-12 11:42:05
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-15 15:10:10
 * @FilePath: /mt-storage/src/storage/localStorage.ts
 * @Description: LocalStorage简单封装
 */

/**
 * 存取类型
 */
type LocalStorageType = object | string | boolean | number | symbol

/**
 * 存储LocalStorage数据
 * @param key 存储key
 * @param value 存储值
 */
const localStorageWrite = (key: string, value: LocalStorageType) => {
  let saveValue = ''
  if (typeof value === 'object') {
    saveValue = JSON.stringify(value)
  }
  if (typeof value === 'string') {
    saveValue = JSON.stringify(value)
  }
  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'symbol'
  ) {
    saveValue = JSON.stringify(value.toString())
  }
  localStorage.setItem(key, saveValue)
}

// /**
//  * 直接存储LocalStorage数据
//  * @param key 存储key
//  * @param value 存储值
//  */
// function localStorageDirectWrite(key: string, value: string) {
//   localStorage.setItem(key, value)
// }

/**
 * 读取LocalStorage数据
 * @param key 存储key
 * @param direct 是否直接取值
 * @returns
 */
const localStorageRead = <T>(key: string): T | null => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  try {
    return <T>JSON.parse(value)
  } catch (err) {
    console.warn('mt-storage：', err)
  }
  return null
}

/**
 * 直接读取LocalStorage数据
 * @param key 存储key
 * @returns
 */
// function localStorageDirectRead(key: string) {
//   return localStorage.getItem(key)
// }

/**
 * 清除LocalStorage数据
 * @param key 存储key
 * @returns 返回类型
 */
function localStorageRemove(key: string) {
  localStorage.removeItem(key)
}

/**
 * 清除所有LocalStorage数据
 * @returns 返回类型
 */
function localStorageRemoveAll() {
  localStorage.clear()
}

export {
  localStorageWrite,
  // localStorageDirectWrite,
  localStorageRead,
  // localStorageDirectRead,
  localStorageRemove,
  localStorageRemoveAll,
}

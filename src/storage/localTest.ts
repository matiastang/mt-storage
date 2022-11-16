/*
 * @Author: matiastang
 * @Date: 2022-11-14 17:10:34
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-14 17:58:16
 * @FilePath: /aigle-web/src/utils/storage/localTest.ts
 * @Description: localStorage监听测试
 */
// useEffect(() => {
//   console.log('add listener storage')
//   localStorageDirectWrite('TEST', String(Math.random() * 1000))
//   const storageChange = (event: StorageEvent) => {
//     console.log('StorageEvent', event)
//     const value = localStorageDirectRead('TEST')
//     if (value) {
//       setTestValue(value)
//     }
//   }
//   window.addEventListener('storage', storageChange)
//   return () => {
//     console.log('remove listener storage')
//     window.removeEventListener('storage', storageChange)
//   }
// }, [])
import { useState } from 'react'
import { localStorageRead, localStorageWrite } from './localStorage'

function useLocalStorage<T>(key: string) {
  const [value, setValue] = useState<T | null>(() => {
    return localStorageRead<T>(key)
  })

  const setLocalValue = (newValue: any) => {
    try {
      const saveValue = <T>newValue
      setValue(saveValue)
      localStorageWrite(key, newValue)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return [value, setLocalValue] as [T | null, (newValue: any) => boolean]
}

export { useLocalStorage }

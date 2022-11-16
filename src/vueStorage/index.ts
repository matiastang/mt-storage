/*
 * @Author: matiastang
 * @Date: 2022-11-15 14:22:23
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-15 15:46:32
 * @FilePath: /mt-storage/src/vueStorage/index.ts
 * @Description: vue 响应式storage
 */
import { ref, reactive, watch } from 'vue'
import { localStorageRead, localStorageWrite, localStorageRemove } from '../storage'

export const localRef = <T>(key: string, value?: T, deep?: boolean) => {

    console.log(key)

    const refValue = ref(value || localStorageRead<T>(key))

    watch(refValue, (newValue) => {
        if (newValue !== null && newValue !== undefined) {
            localStorageWrite(key, newValue)
        } else {
            localStorageRemove(key)
        }
    }, {
        immediate: true,
        deep: deep === undefined || deep,
    })

    return refValue
}

export const localReactive = <T extends object>(key: string, value?: T, deep?: boolean) => {

    console.log(key)

    const reactiveValue = reactive<T>(value || localStorageRead<T>(key) || {} as T)

    watch(reactiveValue, (newValue) => {
        if (Object.keys(newValue).length > 0) {
            localStorageWrite(key, newValue)
        } else {
            localStorageRemove(key)
        }
    }, {
        immediate: true,
        deep: deep === undefined || deep,
    })

    return reactiveValue
}

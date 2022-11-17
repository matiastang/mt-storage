<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:46:38
 * @FilePath: /mt-storage/src/views/index.vue
 * @Description: 测试
-->
<template>
    <div @click="changeValue">改变所有缓存值</div>
</template>
<script setup lang="ts">
import { WebStorageType, storageWrite, storageRead, storageRemove, storageRemoveAll } from '../storage'

interface TestType {
    value: number
}

const localKey = 'KEY'

storageWrite(localKey + '_OBJECT', {
    value: Math.random() * 100
})
const localObjectValue = storageRead<TestType>(localKey + '_OBJECT')
console.log(localObjectValue)

storageWrite(localKey + '_STRING', Math.random() * 100 + '')
const localStringValue = storageRead<string>(localKey + '_STRING')
console.log(localStringValue, typeof localStringValue)

storageWrite(localKey + '_BOOLEAN', true)
let localBooleanValue = storageRead<boolean>(localKey + '_BOOLEAN')
console.log(localBooleanValue, typeof localBooleanValue)

storageWrite(localKey + '_NUMBER', Math.random() * 100)
const localNumberValue = storageRead<number>(localKey + '_NUMBER')
console.log(localNumberValue, typeof localNumberValue)

storageWrite(localKey + '_NaN', NaN)
const localNaNValue = storageRead<Number>(localKey + '_NaN')
console.log(localNaNValue, Number.isNaN(localNaNValue), typeof localNaNValue)



// const testJson = localStorage.setItem('TEST', testValue.toString())
// const test = JSON.parse(testJson)

// typeof value === 'undefined'

// .toString()
// typeof value === 'bigint'
// typeof value === 'function'
// typeof value === 'symbol'
// NaN

// typeof value === 'boolean'
// typeof value === 'number'
// typeof value === 'object'
// null

const changeValue = () => {
    storageWrite(localKey + '_OBJECT', {
        value: Math.random() * 100
    })
    storageWrite(localKey + '_STRING', Math.random() * 100 + '')
    localBooleanValue = !(localBooleanValue === true)
    storageWrite(localKey + '_BOOLEAN', localBooleanValue)
    storageWrite(localKey + '_NUMBER', Math.random() * 100)
}
</script>
<style lang="scss" scoped></style>

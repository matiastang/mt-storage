<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 14:41:50
 * @FilePath: /mt-storage/src/views/index.vue
 * @Description: 测试
-->
<template>
    <div class="page" @click="changeValue">改变所有缓存值</div>
</template>
<script setup lang="ts">
import { storageWrite, storageRead } from '../storage'

const localKey = 'KEY'

// object
const objectKey = localKey + '_OBJECT'
storageWrite(objectKey, {
    value: Math.random() * 100,
})
const localObjectValue = storageRead(objectKey)
console.log(localObjectValue, typeof localObjectValue, typeof localObjectValue?.value)

// string
const stringKey = localKey + '_STRING'
storageWrite(stringKey, Math.random() * 100 + '')
const localStringValue = storageRead(stringKey)
console.log(localStringValue, typeof localStringValue)

// boolean
const booleanKey = localKey + '_BOOLEAN'
storageWrite(booleanKey, true)
const localBooleanValue = storageRead(booleanKey)
console.log(localBooleanValue, typeof localBooleanValue)

// number
const numberKey = localKey + '_NUMBER'
storageWrite(numberKey, Math.random() * 100)
const localNumberValue = storageRead(numberKey)
console.log(localNumberValue, typeof localNumberValue)

const nanKey = localKey + '_NaN'
storageWrite(nanKey, NaN)
const localNaNValue = storageRead(nanKey)
console.log(localNaNValue, Number.isNaN(localNaNValue), typeof localNaNValue)

// null
const nullKey = localKey + '_NULL'
storageWrite(nullKey, null)
const localNullValue = storageRead(nullKey)
console.log(localNullValue, typeof localNullValue)

// undefined
const undefinedKey = localKey + '_UNDEFINED'
storageWrite(undefinedKey, undefined)
const localUndefinedValue = storageRead(undefinedKey)
console.log(localUndefinedValue, typeof localUndefinedValue)

const changeValue = () => {
    storageWrite(objectKey, {
        value: Math.random() * 100,
    })
    storageWrite(stringKey, Math.random() * 100 + '')
    storageWrite(booleanKey, localBooleanValue)
    storageWrite(numberKey, Math.random() * 100)
}
</script>
<style lang="less" scoped>
.page {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    height: 100vh;
    font-size: 16px;
}
</style>

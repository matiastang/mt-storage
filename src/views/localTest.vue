<!--
 * @Author: matiastang
 * @Date: 2022-11-15 15:34:13
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-15 15:49:46
 * @FilePath: /mt-storage/src/views/localTest.vue
 * @Description: vue local storage 测试
-->
<template>
    <div @click="changeObjectValue">{{ `更新objectValue：${localObjectValue.random}` }}</div>
    <div @click="changTestValue">{{ `更新2objectValue：${localTestValue.random}` }}</div>
    <div @click="changeStringValue">{{ `更新stringValue：${localStringValue}` }}</div>
    <div @click="changeBooleanValue">{{ `更新booleanValue：${localBooleanValue}` }}</div>
    <div @click="changeNumberValue">{{ `更新numberValue：${localNumberValue}` }}</div>
    <div @click="changeSymbolValue">{{ `更新symbolValue：${localSymbolValue?.toString()}` }}</div>
</template>
<script setup lang="ts">
import { localRef, localReactive } from '../vueStorage'

interface TestType {
    random: number
}

const localKey = 'KEY'
let localObjectValue = localReactive<TestType>(localKey + '_OBJECT')

const changeObjectValue = () => {
    localObjectValue.random = Math.random() * 100
}

let localTestValue = localReactive<TestType>(localKey + '_OBJECT')

const changTestValue = () => {
    localTestValue.random = Math.random() * 100
}

let localStringValue = localRef<string>(localKey + '_STRING')

const changeStringValue = () => {
    localStringValue.value = `${Math.random() * 100}`
}

let localBooleanValue = localRef<boolean>(localKey + '_BOOLEAN')

const changeBooleanValue = () => {
    localBooleanValue.value = !localBooleanValue.value
}

let localNumberValue = localRef<number>(localKey + '_NUMBER')

const changeNumberValue = () => {
    localNumberValue.value = Math.random() * 100
}

let localSymbolValue = localRef<symbol>(localKey + '_SYMBOL')

const changeSymbolValue = () => {
    localSymbolValue.value = Symbol(Math.random() * 100)
}
</script>
<style lang="scss" scoped></style>

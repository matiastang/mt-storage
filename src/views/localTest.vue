<!--
 * @Author: matiastang
 * @Date: 2022-11-15 15:34:13
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-15 18:26:19
 * @FilePath: /mt-storage/src/views/localTest.vue
 * @Description: vue local storage 测试
-->
<template>
    <div class="page">
        <div @click="changeObjectTestValue">{{ `TEST：${localObjectValue.random.value}` }}</div>
        <div @click="changeObjectValue">{{ `更新objectValue：${localObjectValue.random}` }}</div>
        <div @click="changTestValue">{{ `更新2objectValue：${localTestValue.random}` }}</div>
        <div @click="changeStringValue">{{ `更新stringValue：${localStringValue}` }}</div>
        <div @click="changeBooleanValue">{{ `更新booleanValue：${localBooleanValue}` }}</div>
        <div @click="changeNumberValue">{{ `更新numberValue：${localNumberValue}` }}</div>
        <div @click="changeSymbolValue">{{ `更新symbolValue：${localSymbolValue?.toString()}` }}</div>
    </div>
</template>
<script setup lang="ts">
import { Ref } from 'vue'
import { localRef, localReactive } from '../vueStorage'

const localKeyTest = 'KEY'

let localStringTestValue = localRef<string>(localKeyTest + '_STRING_TEST')

interface TestType {
    random: Ref
}

let localObjectTestValue = localReactive<TestType>(localKeyTest + '_OBJECT_TEST', {
    random: localStringTestValue
})

const changeObjectTestValue = () => {
    localObjectTestValue.random.value = Math.random() * 100
}

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

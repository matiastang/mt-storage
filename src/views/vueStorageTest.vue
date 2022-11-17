<!--
 * @Author: matiastang
 * @Date: 2022-11-17 11:28:42
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 11:28:51
 * @FilePath: /mt-storage/src/views/vueStorageTest.vue
 * @Description: vueStorage测试
-->
<template>
    <div @click="changeObjectValue">{{ `test objectValue：${localObjectValue.random}` }}</div>
    <div @click="changeStringValue">{{ `test stringValue：${localStringValue}` }}</div>
    <div @click="changeBooleanValue">{{ `test booleanValue：${localBooleanValue}` }}</div>
    <div @click="changeNumberValue">{{ `test numberValue：${localNumberValue}` }}</div>
    <div @click="changeSymbolValue">{{ `test symbolValue：${localSymbolValue?.toString()}` }}</div>
    <div @click="() => {
        router.push({
            path: '/local'
        })
    }">跳转</div>
    <router-link to="/local">跳转2</router-link>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { localRef, localReactive } from '../vueStorage'

const router = useRouter()

interface TestType {
    random: number
}

const localKey = 'KEY'
let localObjectValue = localReactive<TestType>(localKey + '_OBJECT')

const changeObjectValue = () => {
    localObjectValue.random = Math.random() * 100
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

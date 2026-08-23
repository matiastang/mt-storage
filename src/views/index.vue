<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:30:00
 * @FilePath: /web-storage/src/views/index.vue
 * @Description: 测试
-->
<template>
    <div class="page">
        <div class="block" @click="changeValue">改变基础类型缓存值</div>
        <div class="block" @click="changeReferenceValue">写入引用类型（Date/Map/Set/BigInt）</div>
        <div class="block" @click="readReferenceValue">读取引用类型（控制台输出）</div>
    </div>
</template>
<script setup lang="ts">
import { defineStorageKey, storageRead, storageWrite } from '../storage'
import { WebStorageType } from '../storage'

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

// number（含 NaN/Infinity，v0.3.0 起支持）
const numberKey = localKey + '_NUMBER'
storageWrite(numberKey, Math.random() * 100)
console.log(storageRead(numberKey), typeof storageRead(numberKey))
storageWrite(localKey + '_NAN', NaN)
console.log('NaN round-trip:', storageRead(localKey + '_NAN'))
storageWrite(localKey + '_INFINITY', Infinity)
console.log('Infinity round-trip:', storageRead(localKey + '_INFINITY'))

// null / undefined（undefined 等同删除）
const nullKey = localKey + '_NULL'
storageWrite(nullKey, null)
console.log(storageRead(nullKey), typeof storageRead(nullKey))
const undefinedKey = localKey + '_UNDEFINED'
storageWrite(undefinedKey, undefined)
console.log(storageRead(undefinedKey))

// v0.3.0：typed key（TS 类型自动推断，无需手动传泛型）
interface DemoUser {
    name: string
    age: number
}
const userKey = defineStorageKey<DemoUser>('DEMO_USER')
storageWrite(userKey, { name: 'matias', age: 18 })
const user = storageRead(userKey) // 类型自动推断为 DemoUser | null
console.log('typed key:', user, user?.name)

// v0.3.0：运行时校验 guard
const isDemoUser = (v: unknown): v is DemoUser =>
    !!v && typeof v === 'object' && typeof (v as DemoUser).name === 'string'
console.log('guard pass:', storageRead(userKey, isDemoUser))
storageWrite('DEMO_BAD', { name: 123 } as unknown as DemoUser)
console.log('guard fail(should be null + warn):', storageRead(userKey, isDemoUser))

const changeValue = () => {
    storageWrite(objectKey, {
        value: Math.random() * 100,
    })
    storageWrite(stringKey, Math.random() * 100 + '')
    storageWrite(booleanKey, localBooleanValue)
    storageWrite(numberKey, Math.random() * 100)
    console.log('基础类型已更新')
}

// v0.3.0：引用类型免类型参数自动往返
const refKey = 'DEMO_REFERENCE'
const sessionRefKey = defineStorageKey<Map<string, Date>>('DEMO_SESSION_MAP', WebStorageType.SESSION)

const changeReferenceValue = () => {
    storageWrite(refKey, {
        date: new Date(),
        map: new Map([
            ['a', 1],
            ['nested', new Set([1n, 2n])],
        ]),
        regexp: /ab+c/gi,
        big: 9007199254740993n,
        maybe: undefined,
    })
    storageWrite(sessionRefKey, new Map([['created', new Date()]]))
    console.log('引用类型已写入（localStorage + sessionStorage）')
}

const readReferenceValue = () => {
    const value = storageRead<{
        date: Date
        map: Map<string, unknown>
        regexp: RegExp
        big: bigint
        maybe: undefined
    }>(refKey)
    console.log('引用类型读取：', value)
    console.log('Date instanceof:', value?.date instanceof Date)
    console.log('Map instanceof:', value?.map instanceof Map)
    console.log('Set nested instanceof:', value?.map.get('nested') instanceof Set)
    console.log('RegExp instanceof:', value?.regexp instanceof RegExp)
    console.log('bigint:', value?.big, typeof value?.big)
    console.log('undefined key preserved:', 'maybe' in (value ?? {}))
    const sessionMap = storageRead(sessionRefKey)
    console.log('session typed key map:', sessionMap, sessionMap?.get('created') instanceof Date)
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

    .block {
        padding: 12px 24px;
        margin: 8px;
        border: 1px solid #42b983;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background: #42b983;
            color: #fff;
        }
    }
}
</style>

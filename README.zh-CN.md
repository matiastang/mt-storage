<!--
 * @Author: matiastang
 * @Date: 2022-11-15 11:35:41
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:40:00
 * @FilePath: /web-storage/README.zh-CN.md
 * @Description: README 中文版
-->
# matias-storage

[English](./README.md)

一个零依赖的 Web Storage 轻封装：自动 JSON 序列化/反序列化、内置引用类型无损往返、TypeScript 类型自动推断、可选的读取运行时校验。

## 特性

- **零运行时依赖** —— 体积极小，适用于任何框架（或无框架）。
- **自动 JSON 序列化** —— 直接存对象/数组/基础类型，无需手动 `JSON.stringify`。
- **引用类型无损往返**（0.3.0 起）—— `Date`、`Map`、`Set`、`RegExp`、`BigInt`、`NaN`、`±Infinity` 与嵌套 `undefined` 读写后完整还原（`instanceof` 保持）。
- **类型安全 key**（0.3.0 起）—— `defineStorageKey<T>()` 让 TS 在读取时自动推断存储类型。
- **运行时校验**（0.3.0 起）—— `storageRead` 可传 type guard，校验失败告警并返回 `null`。
- **向后兼容** —— 0.2.x 写入的数据原样可读；普通值仍以裸 JSON 存储。

## 安装

```sh
$ pnpm add matias-storage
```

## 使用

### 基础用法（字符串 key，与 0.2.x 一致）

```ts
import { storageWrite, storageRead, storageRemove, storageRemoveAll, WebStorageType } from 'matias-storage'

storageWrite('MY_OBJECT', { value: 100 })                     // 默认 localStorage
storageWrite('MY_OBJECT', { value: 100 }, WebStorageType.SESSION) // sessionStorage

const value = storageRead<{ value: number }>('MY_OBJECT')     // { value: number } | null

storageRemove('MY_OBJECT')
storageWrite('MY_OBJECT', undefined)                          // 存 undefined 等同删除
storageRemoveAll()                                            // 清空 localStorage
storageRemoveAll(WebStorageType.SESSION)                      // 清空 sessionStorage
```

### typed key —— 类型自动推断（0.3.0）

```ts
import { defineStorageKey, storageWrite, storageRead, WebStorageType } from 'matias-storage'

interface User { name: string; age: number }

const userKey = defineStorageKey<User>('USER')

storageWrite(userKey, { name: 'matias', age: 18 })
const user = storageRead(userKey)   // 类型自动推断为 User | null，无需传泛型
```

### 引用类型 —— 无需类型参数自动解析（0.3.0）

```ts
storageWrite('DATE', new Date())
storageRead('DATE')                 // Date 实例

storageWrite('MAP', new Map([['a', 1]]))
storageRead('MAP')                  // Map 实例，entries 完整

storageWrite('NESTED', {
  date: new Date(),
  map: new Map([['set', new Set([1n, 2n])]]),
  regexp: /ab+c/gi,
  maybe: undefined,                 // 读取时保留
})
```

说明：`Array` 本就支持往返；类实例按 `JSON.stringify` 语义序列化（自有可枚举属性、尊重 `toJSON`），不还原原型。

### 读取运行时校验（0.3.0）

```ts
const isUser = (v: unknown): v is User =>
  !!v && typeof v === 'object' && typeof (v as User).name === 'string'

storageRead('USER', WebStorageType.LOCAL, isUser)  // 通过返回 User
storageRead(userKey, isUser)                        // typed key 同样支持
// 校验失败：console.warn + 返回 null
```

使用 zod 的同学可包装 `(v) => schema.safeParse(v).success` 作为 guard，库本身不引入依赖。

## 支持的值

| 类型 | 存储格式 | 读取结果 |
|---|---|---|
| `object` / `array` | 裸 JSON | 普通对象/数组 |
| `string` / `boolean` / `number` | 裸 JSON | 同类型基础值 |
| `null` | 裸 JSON | `null` |
| `undefined`（顶层） | ——（删除） | —— |
| `Date` / `Map` / `Set` / `RegExp` / `BigInt` | 类型标签 JSON | 原始类型 |
| `NaN` / `Infinity` / `-Infinity` | 类型标签 JSON | 原始值 |
| 嵌套 `undefined` | 类型标签 JSON | `undefined` |
| 循环引用、顶层 `function`/`symbol` | 拒绝 | `false` + `console.warn` |

`storageRead` 在 key 不存在、存值为 `null`、解析失败、guard 校验失败时均返回 `null`。

## 保留字段

同时含有 `__matias_tag__` 与 `__matias_value__` 且 tag 已知的数据会被视为内部类型标签并还原。请避免在自己的数据中使用这两个属性名；未知 tag 不会被还原。

## 说明

- 数据量大时建议考虑 IndexedDB —— Web Storage 是同步 API 且有约 5MB 限制。
- 版本历史见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可

MIT

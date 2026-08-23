# Data Model: typed-storage

**Branch**: `dev/tdy` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

## 序列化标签协议（TaggedValue）

仅当值属于下表"有损/不支持"类型时，encode 生成标签对象；其余值保持裸 JSON。

| tag | 原始类型 | `__matias_value__` 载荷 | 还原构造 |
|---|---|---|---|
| `Date` | `Date` | `number`（getTime()） | `new Date(v)` |
| `Map` | `Map<K,V>` | `[encode(k), encode(v)][]` | `new Map(entries)` |
| `Set` | `Set<T>` | `encode(t)[]` | `new Set(values)` |
| `RegExp` | `RegExp` | `{ s: source, f: flags }` | `new RegExp(s, f)` |
| `BigInt` | `bigint` | `string`（十进制字面量） | `BigInt(v)` |
| `NaN` | `number` | 无（省略字段） | `NaN` |
| `Infinity` | `number` | 无 | `Infinity` |
| `-Infinity` | `number` | 无 | `-Infinity` |
| `undefined` | `undefined`（嵌套位置） | 无 | `undefined` |

**还原判定**：plain object 且自有属性同时含 `__matias_tag__`（字符串且属于上表）与
`__matias_value__`（NaN/Infinity/undefined 三个 tag 允许缺失该字段）→ 还原；其余一律当普通数据。

**encode 规则补充**：

- 顶层 `undefined` 不进入序列化（写入函数层面等同删除 key）。
- 顶层 `function`/`symbol`：抛 `SerializeError`（写入函数转 `false` + warn）。嵌套位置的 function/symbol 属性按 JSON 语义丢弃（文档声明）。
- 循环引用：WeakSet 检测，抛 `SerializeError`。
- 数组元素中的 `undefined` → `undefined` 标签（JSON 默认会变 null，标签保真）。
- 类实例（非 plain object 且非上表类型）：按 JSON.stringify 原生行为处理（自身可枚举属性），不做原型还原。

## 公共 API 契约（contracts）

```ts
// key.ts —— 新增
export interface StorageKey<T = unknown> { /* branded，见 research.md */ }
export const defineStorageKey: <T>(key: string, type?: WebStorageType) => StorageKey<T>
export type InferStorageKey<K> = K extends StorageKey<infer T> ? T : never

// guard.ts —— 新增
export type StorageValueGuard<T> = (value: unknown) => value is T

// storage.ts —— 重载扩展（旧签名保留为最后一条重载）
storageWrite(key: string | StorageKey<any>, value: StorageWritableValue, type?: WebStorageType): boolean
// 返回值从 void 语义明确为 boolean（v0.2.0 底层本就返回 boolean）

storageRead<T = any>(key: string | StorageKey<T>, type?: WebStorageType, guard?: StorageValueGuard<T>): T | null
// typed key 重载：storageRead<K extends StorageKey<any>>(skey: K, guard?: StorageValueGuard<InferStorageKey<K>>): InferStorageKey<K> | null

storageRemove(key: string | StorageKey<any>, type?: WebStorageType): void
storageRemoveAll(type?: WebStorageType): void

// localStorage.ts / sessionStorage.ts —— 接受 string | StorageKey，其余语义不变
```

**写入值联合类型** `StorageWritableValue = object | string | boolean | number | bigint | null | undefined`
（新增 bigint；function/symbol 被类型系统排除，运行时仍防御）。

## 文件结构

```text
src/storage/
├── enum.ts            # 不变
├── errors.ts          # 新增：SerializeError（内部）
├── serializer.ts      # 新增：encode/decode/标签协议
├── key.ts             # 新增：StorageKey / defineStorageKey / InferStorageKey
├── guard.ts           # 新增：StorageValueGuard
├── localStorage.ts    # 扩展 key 参数与序列化接入
├── sessionStorage.ts  # 同上（含 bug 修复）
├── storage.ts         # 重载与 guard 路由
└── __tests__/         # 测试（unit / integration / usecase / types）
```

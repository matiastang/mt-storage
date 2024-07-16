<!--
 * @Author: matiastang
 * @Date: 2022-11-15 11:35:41
 * @LastEditors: matiastang
 * @LastEditTime: 2024-07-16 14:01:34
 * @FilePath: /mt-storage/README.md
 * @Description: README
-->
# mt-storage

`web storage`的简单二次封装。

## 说明

* 存储值支持对象类型`object`、`string`、 `boolean`、 `number`、 `null`、 `undefined`，`number`时值不能为`NaN`，`undefined`等同删除。
* 读取时支持传递类型，但只是为了方便在`TS`中使用。不会做任何类型转换，使用则需要自己保证存取类型的一致性。

目前支持`localStorage`和`sessionStorage`两种存储。

**注意**如果数据量比较大，可能有性能问题，可以考虑`DB`存储。

## 使用

### 安装

* `pnpm`
```sh
$ pnpm add -D matias-storage
```
* `yarn`
```sh
$ yarn add -D matias-storage
```
* `npm`
```sh
$ npm install -D matias-storage
```

### 引入

```ts
import { WebStorageType, storageWrite, storageRead, storageRemove, storageRemoveAll } from 'matias-storage'
```
### 写
```ts
interface TestType {
    value: number
}

const obj: TestType = {
    value: 100
}
// 默认使用localStorage
storageWrite('LOCL_OBJECT', obj)
// 使用sessionStorage
storageWrite('SESSION_OBJECT', obj, WebStorageType.SESSION)
```
### 读
```ts
interface TestType {
    value: number
}
const localObjectValue = storageRead<TestType>('LOCL_OBJECT')
console.log(typeof localObjectValue?.value) // number
```
### 删除
```ts
storageRemove('LOCL_OBJECT')
```
### 清除
```ts
storageRemoveAll()
```
## 版本

### 0.1.0

* 支持`object`、`string`、`boolean`、`number`类型存储。
* 支持`localStorage`和`sessionStorage`存储。
* 读取支持泛型指定类型。
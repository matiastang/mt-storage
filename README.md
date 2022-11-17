<!--
 * @Author: matiastang
 * @Date: 2022-11-15 11:35:41
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 18:40:48
 * @FilePath: /mt-storage/README.md
 * @Description: README
-->
# mt-storage

`web storage` 的二次封装、提供`TS`类型支持

## 说明

`matias-storage`支持保存`object`、`string`、`boolean`、`number`类型的数据。其他类型的数据可以包装在`object`中使用，其实这个库主要也是使用`stringify`对实现`object`的支持。同时通过泛型支持在读取的时候指定类型。以前都是每个项目处理，感觉可以简单封装一下。

目前支持持久化目的地只支持`localStorage`和`sessionStorage`，后面考虑扩展其他。

**注意**我平常使用`object`比较简单，如果数据比较大，可能有性能问题，后续考虑支持`DB`。

## 使用

### 安装

* `pnpm`导入
> $ pnpm add -D matias-storage
* `yarn`导入
> $ yarn add -D matias-storage
* `npm`导入
> $ npm install -D matias-storage

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
storageWrite('LOCL_OBJECT', obj)
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
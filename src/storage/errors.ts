/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:35:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:35:00
 * @FilePath: /web-storage/src/storage/errors.ts
 * @Description: 序列化错误（内部使用，不随公共 API 导出）
 */

/**
 * 不支持序列化的值（循环引用、顶层 function/symbol 等）
 */
export class StorageSerializeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'StorageSerializeError'
    }
}

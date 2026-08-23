/*
 * @Author: matiastang
 * @Date: 2026-08-23 21:05:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 21:05:00
 * @FilePath: /web-storage/src/storage/guard.ts
 * @Description: 读取时的运行时校验协议（无依赖 type-guard）
 */

/**
 * 读取校验函数：返回 true 视为 T
 * zod 等校验库可包装使用，如 `(v) => schema.safeParse(v).success`
 */
export type StorageValueGuard<T> = (value: unknown) => value is T

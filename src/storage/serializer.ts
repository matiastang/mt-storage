/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:35:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:35:00
 * @FilePath: /web-storage/src/storage/serializer.ts
 * @Description: 类型标签序列化协议（内部使用，不随公共 API 导出）
 *
 * 协议见 specs/001-typed-storage/data-model.md：
 * 仅对 JSON 有损/不支持的类型打标签（__matias_tag__ / __matias_value__），
 * 普通数据保持裸 JSON，保证 v0.2.0 旧数据与新版本互相可读。
 */
import { StorageSerializeError } from './errors'

/**
 * 标签字段名（库保留字前缀 __matias_，见项目宪法 IV）
 */
const TAG_KEY = '__matias_tag__'
const VALUE_KEY = '__matias_value__'

/**
 * 支持的标签集合；NaN/Infinity/-Infinity/undefined 无载荷
 */
type TagName =
    'Date' | 'Map' | 'Set' | 'RegExp' | 'BigInt' | 'NaN' | 'Infinity' | '-Infinity' | 'undefined'

const VALUELESS_TAGS = new Set<string>(['NaN', 'Infinity', '-Infinity', 'undefined'])

/**
 * 无标签载荷的标签对象构造
 */
const tagWithoutValue = (tag: TagName): Record<string, string> => ({ [TAG_KEY]: tag })

/**
 * 带载荷的标签对象构造
 */
const tagWithValue = (tag: TagName, encodedValue: unknown): Record<string, unknown> => ({
    [TAG_KEY]: tag,
    [VALUE_KEY]: encodedValue,
})

/**
 * 判断解析结果是否为已知标签对象；未知 tag 视为普通数据（防用户字段碰撞）
 */
const asKnownTag = (value: object): TagName | null => {
    // 仅接收非数组对象（decode 已先行处理数组分支）
    const record = value as Record<string, unknown>
    if (typeof record[TAG_KEY] !== 'string') {
        return null
    }
    const tag = record[TAG_KEY] as string
    // 无载荷标签（NaN/Infinity/-Infinity/undefined）不携带 VALUE_KEY
    if (VALUELESS_TAGS.has(tag)) {
        return tag as TagName
    }
    if (!Object.prototype.hasOwnProperty.call(record, VALUE_KEY)) {
        return null
    }
    return ['Date', 'Map', 'Set', 'RegExp', 'BigInt'].includes(tag) ? (tag as TagName) : null
}

/**
 * encode：递归把特殊类型转为标签结构
 * @param value 输入值（顶层 undefined 由调用方拦截，不会进入此处）
 * @param ancestors 当前遍历路径上的对象集合（循环引用检测）
 */
const encode = (value: unknown, ancestors: Set<object>): unknown => {
    if (value === null) {
        return null
    }
    if (typeof value === 'string' || typeof value === 'boolean') {
        return value
    }
    if (typeof value === 'number') {
        if (Number.isNaN(value)) {
            return tagWithoutValue('NaN')
        }
        if (value === Infinity) {
            return tagWithoutValue('Infinity')
        }
        if (value === -Infinity) {
            return tagWithoutValue('-Infinity')
        }
        return value
    }
    if (typeof value === 'bigint') {
        return tagWithValue('BigInt', value.toString())
    }
    if (typeof value === 'undefined') {
        return tagWithoutValue('undefined')
    }
    if (typeof value === 'function' || typeof value === 'symbol') {
        throw new StorageSerializeError(`unsupported top-level value type: ${typeof value}`)
    }
    // object 分支
    if (value instanceof Date) {
        return tagWithValue('Date', value.getTime())
    }
    if (value instanceof RegExp) {
        return tagWithValue('RegExp', { s: value.source, f: value.flags })
    }
    if (value instanceof Map) {
        return tagWithValue(
            'Map',
            Array.from(value.entries(), ([k, v]) => [encode(k, ancestors), encode(v, ancestors)])
        )
    }
    if (value instanceof Set) {
        return tagWithValue(
            'Set',
            Array.from(value.values(), (v) => encode(v, ancestors))
        )
    }
    if (Array.isArray(value)) {
        // 数组元素中的 function/symbol 按 JSON 语义落为 null
        return value.map((item) =>
            typeof item === 'function' || typeof item === 'symbol' ? null : encode(item, ancestors)
        )
    }
    // 普通对象 / 类实例：保持 JSON.stringify 语义（toJSON、自有可枚举字符串键）
    const objectValue = value as Record<string, unknown>
    if (typeof objectValue.toJSON === 'function') {
        return encode(objectValue.toJSON(), ancestors)
    }
    if (ancestors.has(value)) {
        throw new StorageSerializeError('circular reference detected')
    }
    ancestors.add(value)
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(objectValue)) {
        const item = objectValue[key]
        // 对象属性中的 function/symbol 按 JSON 语义丢弃，其余递归
        if (typeof item === 'function' || typeof item === 'symbol') {
            continue
        }
        result[key] = encode(item, ancestors)
    }
    ancestors.delete(value)
    return result
}

/**
 * serialize：编码 + JSON 序列化
 * @param value 不含顶层 undefined 的待存值
 * @returns JSON 字符串
 * @throws StorageSerializeError 循环引用 / 顶层 function/symbol
 */
export const serialize = (value: unknown): string => {
    return JSON.stringify(encode(value, new Set()))
}

/**
 * decode：递归还原标签结构
 * @throws StorageSerializeError BigInt 载荷非法
 */
const decode = (value: unknown): unknown => {
    if (value === null || typeof value !== 'object') {
        return value
    }
    if (Array.isArray(value)) {
        return value.map(decode)
    }
    const tag = asKnownTag(value)
    if (tag === 'undefined') {
        return undefined
    }
    if (tag === 'NaN') {
        return NaN
    }
    if (tag === 'Infinity') {
        return Infinity
    }
    if (tag === '-Infinity') {
        return -Infinity
    }
    const payload = (value as Record<string, unknown>)[VALUE_KEY]
    if (tag === 'Date') {
        return new Date(payload as number)
    }
    if (tag === 'RegExp') {
        const { s, f } = payload as { s: string; f: string }
        return new RegExp(s, f)
    }
    if (tag === 'BigInt') {
        try {
            return BigInt(payload as string)
        } catch {
            throw new StorageSerializeError(`invalid BigInt payload: ${String(payload)}`)
        }
    }
    if (tag === 'Map') {
        return new Map((payload as [unknown, unknown][]).map(([k, v]) => [decode(k), decode(v)]))
    }
    if (tag === 'Set') {
        return new Set((payload as unknown[]).map(decode))
    }
    // 普通对象：逐属性递归；__proto__ 用 defineProperty 赋值，避免触发原型 setter（防原型污染）
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
        const decoded = decode((value as Record<string, unknown>)[key])
        if (key === '__proto__') {
            Object.defineProperty(result, key, {
                value: decoded,
                enumerable: true,
                writable: true,
                configurable: true,
            })
        } else {
            result[key] = decoded
        }
    }
    return result
}

/**
 * deserialize：JSON 解析 + 标签还原
 * @param text 存储中的字符串
 * @throws SyntaxError JSON 非法；StorageSerializeError 标签载荷非法
 */
export const deserialize = (text: string): unknown => {
    return decode(JSON.parse(text))
}

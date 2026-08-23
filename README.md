# matias-storage

[中文文档](./README.zh-CN.md)

A lightweight, zero-dependency wrapper for Web Storage with automatic JSON serialization/deserialization, lossless built-in reference-type round-trips, TypeScript type inference, and optional runtime validation.

## Features

- **Zero runtime dependencies** — tiny footprint, works in any framework (or none).
- **Automatic JSON serialization** — store objects/arrays/primitives directly; no manual `JSON.stringify`.
- **Lossless reference types** (since 0.3.0) — `Date`, `Map`, `Set`, `RegExp`, `BigInt`, `NaN`, `±Infinity` and nested `undefined` survive a write/read cycle intact (`instanceof` preserved).
- **Type-safe keys** (since 0.3.0) — `defineStorageKey<T>()` lets TypeScript infer stored types automatically on read.
- **Runtime validation** (since 0.3.0) — pass an optional type guard to `storageRead`; failed validation warns and returns `null`.
- **Backward compatible** — data written by 0.2.x is read as-is; plain values are still stored as raw JSON.

## Installation

```sh
$ pnpm add matias-storage
# or
$ yarn add matias-storage
# or
$ npm install matias-storage
```

## Usage

### Basics (string keys, works like 0.2.x)

```ts
import { storageWrite, storageRead, storageRemove, storageRemoveAll, WebStorageType } from 'matias-storage'

storageWrite('MY_OBJECT', { value: 100 })                     // localStorage by default
storageWrite('MY_OBJECT', { value: 100 }, WebStorageType.SESSION) // sessionStorage

const value = storageRead<{ value: number }>('MY_OBJECT')     // { value: number } | null

storageRemove('MY_OBJECT')
storageWrite('MY_OBJECT', undefined)                          // storing undefined === delete
storageRemoveAll()                                            // clear localStorage
storageRemoveAll(WebStorageType.SESSION)                      // clear sessionStorage
```

### Typed keys — automatic type inference (0.3.0)

```ts
import { defineStorageKey, storageWrite, storageRead, WebStorageType } from 'matias-storage'

interface User { name: string; age: number }

const userKey = defineStorageKey<User>('USER')
const sessionKey = defineStorageKey<User>('USER', WebStorageType.SESSION)

storageWrite(userKey, { name: 'matias', age: 18 })
const user = storageRead(userKey)   // type is User | null — no generic needed
```

### Reference types — no type parameters needed (0.3.0)

```ts
storageWrite('DATE', new Date())
storageRead('DATE')                 // Date instance

storageWrite('MAP', new Map([['a', 1]]))
storageRead('MAP')                  // Map instance with all entries

storageWrite('NESTED', {
  date: new Date(),
  map: new Map([['set', new Set([1n, 2n])]]),
  regexp: /ab+c/gi,
  maybe: undefined,                 // preserved on read
})
```

Note: `Array` round-trips natively (it always did). Class instances are serialized like `JSON.stringify` does (own enumerable properties, `toJSON` respected) — prototypes are not restored.

### Runtime validation on read (0.3.0)

```ts
import { storageRead } from 'matias-storage'

const isUser = (v: unknown): v is User =>
  !!v && typeof v === 'object' && typeof (v as User).name === 'string'

const ok = storageRead('USER', WebStorageType.LOCAL, isUser) // User if valid
storageWrite('USER', { name: 123 } as unknown as User)       // corrupt it
const bad = storageRead('USER', WebStorageType.LOCAL, isUser) // null + console.warn
// works with typed keys too:
storageRead(userKey, isUser)
```

zod users can wrap a schema: `(v) => schema.safeParse(v).success` as a guard — no dependency is imposed by the library.

## Supported values

| Type | Stored as | Restored as |
|---|---|---|
| `object` / `array` | raw JSON | plain object / array |
| `string` / `boolean` / `number` | raw JSON | same primitive |
| `null` | raw JSON | `null` |
| `undefined` (top level) | — (delete) | — |
| `Date` / `Map` / `Set` / `RegExp` / `BigInt` | type-tagged JSON | original type |
| `NaN` / `Infinity` / `-Infinity` | type-tagged JSON | original value |
| nested `undefined` | type-tagged JSON | `undefined` |
| circular references, top-level `function`/`symbol` | rejected | `false` + `console.warn` |

`storageRead` returns `null` when the key does not exist, the stored value is `null`, parsing fails, or a guard rejects the value.

## Reserved fields

Values containing both `__matias_tag__` and `__matias_value__` properties with a known tag are treated as internal type tags and revived. Avoid these two property names in your own data; unknown tags are left untouched.

## Notes

- For large datasets consider IndexedDB — Web Storage is synchronous and size-limited (~5MB).
- Version history: see [CHANGELOG.md](./CHANGELOG.md).

## License

MIT

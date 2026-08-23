# Research: typed-storage

**Branch**: `dev/tdy` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

## 结论（技术选型）

### 1. 类型标签序列化（type-tagged JSON）

**方案**：仅对 JSON.stringify 有损/不支持的类型打标签，普通数据保持裸 JSON。
与 superjson、redux-persist transform 同一思路，但零依赖自实现（宪法 I）。已用 Node 验证
`JSON.stringify` 的边界行为：`Infinity → "null"`、`new Date(0) → ISO 字符串`、
`Map/Set → "{}"`、嵌套 `undefined` 键被丢弃、嵌套 `NaN → null`、`BigInt` 抛 TypeError。

**标签格式**（详见 [data-model.md](./data-model.md)）：`{ __matias_tag__: string, __matias_value__: unknown }`。
还原规则：对象同时含两个保留字段且 tag 已知才还原，否则当普通对象（防用户数据碰撞）。

**循环引用**：encode 阶段用 WeakSet 检测，抛内部 `SerializeError`，由写入函数捕获 → `false` + warn。

### 2. typed key 类型推断

**方案**：branded object + 函数重载（推荐路径，已确认）。

```ts
declare const storageKeyBrand: unique symbol
export interface StorageKey<T = unknown> {
    readonly key: string
    readonly storageType: WebStorageType
    readonly [storageKeyBrand]: { readonly __type: T } // 烙印，仅类型层
}
export const defineStorageKey = <T>(key: string, type: WebStorageType = WebStorageType.LOCAL): StorageKey<T>
```

读写重载放最前面（更具体的签名优先），字符串 key 签名兜底：
`storageRead<K extends StorageKey<any>>(skey: K, guard?): InferStorageKey<K> | null`，
`InferStorageKey<K> = K extends StorageKey<infer T> ? T : never`。
放弃全局声明合并注册表（隐晦、跨文件声明顺序敏感）；放弃纯重载（无跨调用记忆）。

### 3. 运行时校验

**方案**：`StorageValueGuard<T> = (value: unknown) => value is T`，可选参数传入。
失败：`console.warn('[matias-storage] ...')` + 返回 `null`；key 不存在：直接 `null` 不告警。
zod 用户可包一层 `(v) => schema.safeParse(v).success` 使用（文档说明），不引入 peer 依赖。

### 4. null 歧义处理（本版决策）

保持 `storageRead → T | null`（v0.2.0 语义），key 不存在/存 null/解析失败/校验失败均返回 `null`；
区分需求交给后续版本（如 `storageContains`），避免本版 API 膨胀。

### 5. 测试环境

- Vitest 2（与 Vite 5 兼容）+ jsdom（localStorage/sessionStorage 原生实现，比 happy-dom 更接近真实浏览器）。
- 覆盖率 `@vitest/coverage-v8`（v8 原生，比 istanbul 快且无额外转译）。
- `@vue/test-utils` 仅用于 demo 组件用例（US4 范畴，满足"前端 Vitest + VTU"要求）。
- 类型断言用 `expectTypeOf`（编译期由 `tsc --noEmit` 校验，纳入 CI）。
- 测试目录 `src/storage/__tests__/`（在 tsconfig include 内，类型断言被 CI 的 type-check 覆盖）。

### 6. CI

GitHub Actions：`pnpm/action-setup` + `actions/setup-node`（node 20，pnpm 缓存）→
`pnpm install --frozen-lockfile` → `tsc --noEmit` → `vitest run --coverage` → `pnpm build`。
触发：push 到 main + PR 到 main。Windows 本地 / ubuntu CI 双环境脚本差异用 pnpm script 屏蔽。

## 风险

- **保留字段碰撞**：极低概率；未知 tag 不还原已兜底，README 声明保留字。
- **vite build 库模式 + 新增源文件**：入口 `src/storage/index.ts` 重导出新模块即可，无构建配置改动。
- **eslint 9 + eslintrc 兼容**：CI 不跑 lint（type-check/test/build 已覆盖宪法要求），避免 flat-config 迁移范围蔓延。

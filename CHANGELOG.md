# Changelog

本项目的所有版本变更记录。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.3.0] - 2026-08-23

### 新增

- **typed key 类型推断**：`defineStorageKey<T>(key, type?)` 创建带类型的 key，`storageWrite` / `storageRead` / `storageRemove`（含 local/session 底层函数）支持 typed key，读取时 TS 自动推断存储类型，无需手动传泛型。
- **内置引用类型无损往返**：`Date`、`Map`、`Set`、`RegExp`、`BigInt`、`NaN`、`Infinity`、`-Infinity` 及嵌套 `undefined` 采用类型标签序列化（保留字段 `__matias_tag__` / `__matias_value__`），读写后 `instanceof` 与值保持一致。
- **读取运行时校验**：`storageRead(key, type?, guard?)` 支持传入 type guard（`(v: unknown) => v is T`），校验失败 `console.warn` 并返回 `null`；key 不存在不告警。
- **工程化**：Vitest + jsdom 测试体系（语句/分支覆盖率 ≥95% 门槛）；commitlint + husky 提交规范强制；GitHub Actions CI（main push/PR：type-check + test + build）；GitHub Issue 模板（Bug 报告/功能建议）；中英双语 README（默认英文）；CHANGELOG。
- SpecKit spec-driven 开发流程接入（constitution / spec / plan / tasks 见 `specs/001-typed-storage/`）。

### 修复

- 修复 `sessionStorageWrite(key, undefined)` 误删 localStorage 同名 key 的 bug（现正确删除 sessionStorage）。

### 变更

- `NaN` 由"拒绝写入"改为可存取（往返保真）；`Infinity` 不再静默变 `null`。
- 嵌套对象中的 `undefined` 属性由"丢弃"改为"保留"（读取时字段存在且值为 `undefined`）。
- 顶层 `function` / `symbol` 写入由"存入脏数据"改为拒绝（返回 `false` + 告警）。
- 清理无用依赖（ts-node、rollup-plugin-terser、less-loader、path）与失效的 gulp 发布脚本（改为 `publish:npm`）。

### 兼容性

- 字符串 key 的全部旧 API 行为不变；0.2.x 写入的裸 JSON 数据原样可读；普通值仍以裸 JSON 存储（线上格式不变）。

## [0.2.0] - 2024-07-16

- 添加存储值类型为 `null`、`undefined` 的支持。
- 调整逻辑 `number` 时值不能为 `NaN`，`undefined` 等同删除。

## [0.1.0] - 2022-11-17

- 支持 `object`、`string`、`boolean`、`number` 类型存储。
- 支持 `localStorage` 和 `sessionStorage` 存储。
- 读取支持指定类型。

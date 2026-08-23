# matias-storage Constitution

## Core Principles

### I. 零运行时依赖（Library-First, Zero-Dependency）
本库定位是 Web Storage 的"简单封装"，发布产物 MUST NOT 引入任何运行时依赖（dependencies 为空）。运行时类型校验通过使用者传入 type-guard 函数实现，不绑定 zod/valibot 等校验库。

### II. 测试先行（Test-First，不可协商）
先写测试、后写实现；红-绿-重构循环。每个功能点提交前测试必须全绿。测试覆盖目标：语句与分支覆盖率 ≥95%（Vitest + coverage-v8）。纯前端库无后端，pytest 要求豁免；e2e（Playwright）暂缓，待 demo 页有独立价值时再评估。

### III. 类型安全（Type Safety）
源码全部 TypeScript（`strict: true`）。公共 API 的输入输出类型必须完备；类型自动推断通过 typed key（`defineStorageKey<T>`）实现，不使用全局声明合并注册表。`tsc --noEmit` 必须零错误。

### IV. 向后兼容（Backward Compatibility）
不破坏 v0.2.0 的公共 API 与已存储数据：字符串 key 的旧用法继续可用；v0.2.0 写入的裸 JSON 数据在新版本必须原样可读。类型标签只对特殊类型（Date/Map/Set/RegExp/BigInt/NaN/Infinity/嵌套 undefined）生效，普通数据保持裸 JSON 格式。保留字段名前缀 `__matias_` 视为库保留字。

### V. 一个功能点一个提交（One Feature, One Commit）
每个功能点（特性/修复/基建/文档）独立 commit，不混合。commit message 遵循 Conventional Commits（commitlint + husky 强制）。

### VI. 循环 Code Review（Loop Review Until Clean）
每个版本需求完成后，执行循环 code review，修复中等严重及以上问题，直到不存在中等严重问题为止，方可发版。

## 版本与发布规范

- 版本号格式 `MAJOR.MINOR.PATCH`：package.json、需求文档、git tag 三处保持一致，tag 统一为 `v` + 版本号（如 `0.3.0` / tag `v0.3.0`）。
- 每个版本必须有 CHANGELOG.md 条目与版本更新说明。
- README 默认英文（README.md），中文版 README.zh-CN.md，两者互链。

## 技术栈约束

- 前端包管理：pnpm；Python 工具链：uv。
- 构建：Vite 5 库模式（ES/CJS/UMD/IIFE）+ tsc 生成类型声明。
- 测试：Vitest + jsdom（localStorage/sessionStorage 环境）+ @vue/test-utils（demo 组件用例）。
- CI：GitHub Actions，main 分支 push 与 PR 触发校验（type-check + test + build），暂不做自动部署。

## Governance

- 本宪法效力高于其他工程实践；修改需记录变更说明与迁移方案。
- 所有提交与 review 必须对照本宪法检查合规性。
- 需求来源与版本决策记录于 docs/requirements.md，用户确认的补充信息追加到对应版本小节末尾。

**Version**: 1.0.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23

# Implementation Plan: typed-storage

**Branch**: `dev/tdy` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

## Summary

在保持 v0.2.0 API 与数据格式完全兼容的前提下，为 matias-storage 引入三层能力：
①类型标签序列化层（Date/Map/Set/RegExp/BigInt/NaN/±Infinity/嵌套 undefined 无损往返）；
②typed key 类型推断层（`defineStorageKey<T>` + 读写重载）；③读取运行时校验层（type-guard）。
同时补齐工程质量基建：Vitest 全覆盖测试、commitlint+husky、GitHub Actions CI、Issue 模板、双语 README、CHANGELOG，版本升至 0.3.0。

## Technical Context

**Language/Version**: TypeScript 5.5（strict）

**Primary Dependencies**: 运行时零依赖；开发期 vite 5 / vitest 2 / jsdom / @vue/test-utils / @vitest/coverage-v8 / husky / @commitlint/*

**Storage**: Web Storage（localStorage / sessionStorage）

**Testing**: Vitest + jsdom（单元/集成/用例）+ expectTypeOf 类型断言（tsc 校验）

**Target Platform**: 现代浏览器（ES2015+）

**Project Type**: library（npm 包 matias-storage）

**Performance Goals**: 标签仅对特殊类型增加少量字节；普通数据序列化路径与 v0.2.0 相同（多一层纯函数遍历，库体量小可忽略）

**Constraints**: 构建产物四种格式（es/cjs/umd/iife）；`tsc --noEmit` 零错误

**Scale/Scope**: 库源码 ~300 行；测试 ~800 行

## Constitution Check

| 原则 | 结论 |
|---|---|
| I 零运行时依赖 | ✅ 无新增 dependencies |
| II 测试先行 | ✅ 每个功能点先写失败测试再实现 |
| III 类型安全 | ✅ typed key + strict + expectTypeOf |
| IV 向后兼容 | ✅ 旧 API/旧数据回归测试是 US2 验收项 |
| V 一功能一提交 | ✅ tasks.md 按功能点组织提交 |
| VI 循环 review | ✅ 收尾阶段执行 |

## Project Structure

### Documentation (this feature)

```text
specs/001-typed-storage/
├── spec.md          # 规格（$speckit-specify）
├── research.md      # 技术调研（$speckit-plan Phase 0）
├── data-model.md    # 标签协议 + API 契约（$speckit-plan Phase 1）
├── quickstart.md    # 验证手册（$speckit-plan Phase 1）
├── checklists/      # 规格/任务质量清单
└── tasks.md         # 任务清单（$speckit-tasks）
```

### Source Code (repository root)

```text
src/storage/                 # 库源码（含新增 serializer.ts / key.ts / guard.ts / errors.ts）
src/storage/__tests__/       # 单元 / 集成 / 用例 / 类型测试
src/views/index.vue          # demo 页（展示新特性）
.github/workflows/ci.yml     # CI（main push/PR）
.github/ISSUE_TEMPLATE/      # Bug 报告 / 功能建议
CHANGELOG.md                 # 版本更新说明
README.md / README.zh-CN.md  # 英文默认 / 中文
.husky/                      # pre-commit / commit-msg 钩子
```

## Implementation Phases

**Phase 1 基建**（TDD 地基，先于功能）：Vitest+jsdom+coverage 初始化（冒烟测试）→
修复 sessionStorage undefined bug（先写复现测试）→ 清理无用依赖与失效脚本。

**Phase 2 核心库**：serializer（标签协议 encode/decode + 错误路径）→
接入 local/session 读写 → typed key（key.ts + 重载 + 类型断言）→ guard 校验。
每步先写失败测试，绿后单独提交。

**Phase 3 工程化**：commitlint+husky → GitHub Actions CI → Issue 模板。

**Phase 4 文档与发版准备**：demo 页更新 → 双语 README + CHANGELOG →
requirements.md 决策回填 → 版本 0.3.0 → 全量回归 + 覆盖率核查 + 循环 code review。

## Verification

- `pnpm type-check`（tsc --noEmit，含测试与类型断言）
- `pnpm test` / `pnpm test:coverage`（全量 + 覆盖率 ≥95%）
- `pnpm build`（四格式产物 + 类型声明）
- 手工：demo 页（`pnpm dev`）验证新特性

# Quickstart: typed-storage

**Branch**: `dev/tdy` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

## 环境准备

```sh
pnpm install          # 安装依赖（含 Vitest/jsdom 等测试栈）
```

## 全量验证命令

```sh
pnpm type-check       # tsc --noEmit（含类型断言测试）
pnpm test             # vitest run
pnpm test:coverage    # 覆盖率报告（语句/分支 ≥95%）
pnpm build            # 库模式构建（ts:build + vite build + 拷贝类型）
pnpm dev              # demo 页（人工验证新特性）
```

## 新特性人工验证（demo 页 + 控制台）

```ts
import { defineStorageKey, storageWrite, storageRead, WebStorageType } from 'matias-storage'

// 1. typed key：类型自动推断
const userKey = defineStorageKey<{ name: string; age: number }>('USER')
storageWrite(userKey, { name: 'matias', age: 18 })
const user = storageRead(userKey)   // 类型自动推断为 { name: string; age: number } | null

// 2. 引用类型无损往返（无需任何类型参数）
storageWrite('DATE', new Date())
storageRead('DATE')                 // Date 实例
storageWrite('MAP', new Map([['a', 1]]))
storageRead('MAP')                  // Map 实例，entries 完整

// 3. 读取校验
const isUser = (v: unknown): v is { name: string } =>
    !!v && typeof v === 'object' && typeof (v as any).name === 'string'
storageRead('USER', WebStorageType.LOCAL, isUser)  // 通过返回值，失败 warn + null
```

## 交付物核对

- [ ] `specs/001-typed-storage/` 规格四件套 + tasks 全勾
- [ ] `src/storage/` 新模块（serializer/key/guard/errors）+ 测试全绿
- [ ] `.github/workflows/ci.yml`、`.github/ISSUE_TEMPLATE/`
- [ ] `.husky/` + commitlint 配置
- [ ] `README.md`（EN 默认）+ `README.zh-CN.md` + `CHANGELOG.md`
- [ ] package.json version 0.3.0；`docs/requirements.md` v0.3.0 小节回填决策

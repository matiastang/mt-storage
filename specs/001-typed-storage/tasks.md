# Tasks: typed-storage（v0.3.0）

**Input**: Design documents from `/specs/001-typed-storage/`

**Prerequisites**: plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅

**Tests**: 测试强制（宪法 II：TDD，覆盖 ≥95%）。每个功能任务先写失败测试再实现。

## Phase 1: 基建（Shared Infrastructure）

- [ ] T1.1 [P] 测试基建：安装 vitest/jsdom/@vue/test-utils/@vitest/coverage-v8；vitest.config.ts（jsdom 环境、setup 清理 storage、coverage 阈值 95）；package.json 增加 `test`/`test:coverage`/`type-check` 脚本；冒烟测试验证环境。**Commit: test: 测试基建**
- [ ] T1.2 修复 bug：先写复现测试（sessionStorage 写入 undefined 应删除 sessionStorage 而非 localStorage），再修复 `sessionStorageWrite`。**Commit: fix: sessionStorage bug**
- [ ] T1.3 [P] 清理：移除 ts-node/rollup-plugin-terser/less-loader/path 依赖与失效 gulp 脚本（push:npm:package、plugin:build:push:npm:package、updata:package 改造为直接 npm publish 说明）。**Commit: chore: 依赖与脚本清理**

## Phase 2: 核心库（User Story 1-3）

### US2 类型标签序列化（P1，先做：US1 依赖其值域扩展 bigint）

- [ ] T2.1 serializer 单元测试：encode/decode 各标签类型（Date/Map/Set/RegExp/BigInt/NaN/±Infinity/嵌套 undefined）、嵌套组合、未知 tag 不还原、循环引用抛 SerializeError、顶层 function/symbol 拒绝。先写测试（红）。**Commit: feat: serializer（标签协议）**
- [ ] T2.2 serializer 实现：`errors.ts` + `serializer.ts`（serialize/deserialize，见 data-model.md 协议）。测试转绿。
- [ ] T2.3 集成：local/session 读写接入 serializer；向后兼容测试（v0.2.0 裸 JSON 旧数据原样可读；普通新数据仍存裸 JSON）。**Commit: feat: 存取接入标签序列化**

### US1 typed key 类型推断（P1）

- [ ] T2.4 typed key 测试：defineStorageKey 行为（默认 LOCAL、SESSION 指定）；读写经 typed key 落对存储；expectTypeOf 类型断言（读回 `T | null`；写字面量校验）。**Commit: feat: typed key 与类型推断**
- [ ] T2.5 key.ts 实现 + storage.ts/localStorage.ts/sessionStorage.ts 重载扩展（string | StorageKey）。

### US3 读取运行时校验（P2）

- [ ] T2.6 guard 测试：通过返回原值；失败 warn + null；key 不存在不告警；typed key + guard 组合。**Commit: feat: storageRead guard 校验**
- [ ] T2.7 guard.ts 类型 + storageRead 第三参接入。

### US4 demo

- [ ] T2.8 [P] demo 页展示 typed key / 引用类型往返 / guard。**Commit: feat: demo 展示 v0.3.0 特性**

## Phase 3: 工程化（User Story 4）

- [ ] T3.1 commitlint + husky：`prepare` 脚本、.husky/pre-commit（type-check + test）、.husky/commit-msg（commitlint，config-conventional）；验证不合规消息被拒。**Commit: feat: commit 规范**
- [ ] T3.2 [P] GitHub Actions：`.github/workflows/ci.yml`（push/PR main：install → type-check → test:coverage → build，pnpm + node 20 + 缓存）。**Commit: ci: GitHub Actions**
- [ ] T3.3 [P] Issue 模板：Bug 报告 / 功能建议（`.github/ISSUE_TEMPLATE/`）。**Commit: chore: Issue 模板**

## Phase 4: 文档与发版准备

- [ ] T4.1 [P] README 英文默认 + README.zh-CN.md（互链、新 API 文档、保留字段声明）；CHANGELOG.md（0.1.0/0.2.0 迁移 + 0.3.0）。**Commit: docs: 双语 README 与 CHANGELOG**
- [ ] T4.2 requirements.md v0.3.0 小节末尾回填用户确认的决策（typed key/guard/兼容策略/版本规范/pytest 豁免/e2e 暂缓）。**Commit: docs: 需求决策回填**
- [ ] T4.3 版本 0.3.0（package.json）；全量回归：type-check/test:coverage/build 全绿，覆盖率 ≥95%。**Commit: chore(release): 0.3.0**
- [ ] T4.4 循环 code review：对照宪法逐文件审查，修复中等严重及以上问题（单独 commit），直到无中等问题；更新本清单与 checklists。

## 验收核对（对照 spec.md SC-001~SC-005）

- [ ] SC-001 内置类型往返断言全过
- [ ] SC-002 旧数据兼容测试全过
- [ ] SC-003 覆盖率 ≥95%
- [ ] SC-004 type-check/test/build 全绿
- [ ] SC-005 commit 拦截 / 双语 README / CHANGELOG 齐备

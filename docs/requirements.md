# 需求

解决原生 Web Storage 只能存字符串痛点的小工具库——自动做 JSON 序列化/反序列化

## 说明

- 项目所有原始需求在 docs/requirements.md 文件中
- 使用 SpecKit 分析需求，并生成 SpecKit 文件
- 前端使用 **Vue + TypeScript + Vite** 实现。

## 开发基本要求

- 项目使用 git 来管理版本
- python使用uv来管理、使用pnpm来管理前端包
- 项目需要实现完整的测试，包括：单元测试（后端用 pytest、前端用 Vitest + Vue Test Utils）、集成测试、Use Case 测试、e2e 测试（用 Playwright）。
- 要实现 git commit 规范，包括 commitlint 和 husky。
- 项目需要实现 CI/CD，包括 GitHub Actions。先只做校验，不做自动部署，后面再考虑。
- 前端使用 TypeScript，并且需要使用 TypeScript 的类型系统来保证代码的类型安全。
- 项目 main 分支的 push、 PR 需要跑 CI 测试
- 需要先写测试，再写代码，测试驱动开发，开发完成后，测试通过，代码完成
- 每个版本的需求完成后，都需要做完整的**循环 code review 并修复中等严重及以上问题，直到没有中等严重问题**
- **重要** 每一个功能点一个 commit，不要把多个功能点放在一个 commit 中，这样不利于代码的维护和回滚
- 项目需要提供 GitHub Issue 模板，规范 issue 提交（如 Bug 报告、功能建议）
- 每个版本需要实现的功能，有不确定的可以问我。并且将我的回答或补充信息放到对应的版本（如：v0.0.1）信息的最后面。
- README.md文件需要有中文和英文版本，默认显示英文自述文档
- 需要有版本更新说明文件

## v0.3.0

* JS 的基础类型能能够通过该项目来存取，并且读取的时候要是能做到类型的自动推断最好（就是如果时在TS中读取能自动关联到类型）
* JS 的对象类型也能通过该项目来存取，读取的时候能知道类型就好了，比如读取的时候可以传入类型（泛型）读取后如果能转成对应的类型就返回，如果不能转成对应的类型需要有提示。比如读取的时候返回使用知识可选类型。
* 对于一些常见的类型（Array、Map等JS中常见的类型），是否能做到不传入类型，而自动解析出来？这个要分析确认一些

### 已确认决策（2026-08-23）

1. 类型自动推断采用 **typed key 模式**（`defineStorageKey<T>`），不使用全局注册表。
2. 运行时校验采用**无依赖 type-guard 协议**（`storageRead` 可选第三参），不绑定 zod/valibot（用户可自行包装 zod guard）。
3. 序列化兼容策略：**仅特殊类型打标签**（保留字段 `__matias_tag__`/`__matias_value__`），普通数据保持裸 JSON，0.2.x 旧数据原样可读；未知 tag 不还原。同时修复 `Infinity`/嵌套 `NaN`/嵌套 `undefined` 丢失的暗坑（均可正确往返）。
4. 版本号规范统一：package.json `0.3.0` + git tag `v0.3.0`（后续版本同理）。
5. 本项目为纯前端库无后端，**pytest 要求豁免**；Playwright e2e 本版**暂缓**，demo 页人工验证；测试范围为 Vitest 单测 + 集成 + 用例（demo 组件）测试，覆盖率 ≥95%。
6. 工程化按"先补地基再动功能"顺序执行：Vitest 测试基建 → bug 修复 → 依赖清理 → 核心功能 → commitlint/husky → CI → Issue 模板 → 文档/CHANGELOG → 发版准备；每个功能点独立 commit。


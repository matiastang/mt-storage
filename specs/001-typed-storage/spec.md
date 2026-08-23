# Feature Specification: typed-storage（v0.3.0 类型安全存储）

**Feature Branch**: `dev/tdy`

**Created**: 2026-08-23

**Status**: Approved

**Input**: User description: "docs/requirements.md 中 v0.3.0：JS 基础类型存取 + TS 读取类型自动推断；对象类型存取 + 读取传入泛型可校验、不能转换时提示；Array/Map 等常见类型不传类型自动解析。同时完成开发基本要求中的测试、commit 规范、CI、Issue 模板、双语 README、CHANGELOG。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 类型自动推断的读写（Priority: P1）

使用者（TS 项目开发者）通过 `defineStorageKey<T>('KEY')` 定义带类型的 key，之后 `storageWrite(myKey, value)` 写入、`storageRead(myKey)` 读取时无需再传泛型，TS 自动推断出存入时的类型；基础类型（string/number/boolean/null）与对象类型均适用。旧的字符串 key 用法完全保留。

**Why this priority**: 类型自动关联是 v0.3.0 的第一诉求，决定开发体验的核心改善。

**Independent Test**: 定义 `StorageKey<TestType>` 后写入再读取，`expectTypeOf(读回值).toEqualTypeOf<TestType | null>()` 编译期断言通过；运行时值等价。

**Acceptance Scenarios**:

1. **Given** 一个 `defineStorageKey<{ value: number }>('OBJ')`，**When** `storageWrite(key, { value: 1 })` 后 `storageRead(key)`，**Then** 返回 `{ value: 1 }`，TS 类型为 `{ value: number } | null`，无需手动传泛型。
2. **Given** 字符串 key 旧用法 `storageWrite('K', 1)`，**When** `storageRead<number>('K')`，**Then** 行为与 v0.2.0 完全一致。
3. **Given** typed key 声明了 SESSION 存储类型，**When** 读写，**Then** 数据落在 sessionStorage 而非 localStorage。

---

### User Story 2 - 内置引用类型无损自动往返（Priority: P1）

使用者直接存 `Date`、`Map`、`Set`、`RegExp`、`BigInt`、`NaN`、`±Infinity` 或含以上类型（含嵌套 undefined）的对象，不传任何类型参数，读取后自动还原为原始类型与值（instanceof 保持）。v0.2.0 写入的旧数据（裸 JSON）读取行为不变。

**Why this priority**: 消除当前 Map/Set 存储丢数据、Date 变字符串、NaN/Infinity 变 null 的静默数据损坏，是库的可靠性底线。

**Independent Test**: 对每个内置类型执行写→读→`instanceof`/`Object.is` 断言；构造 v0.2.0 格式旧数据写入底层 storage 后用新版本读取，断言原样返回。

**Acceptance Scenarios**:

1. **Given** `new Map([['a', 1]])`，**When** 写入后读取，**Then** 返回值 `instanceof Map` 且 entries 相等。
2. **Given** 嵌套结构 `{ d: new Date(0), m: new Set([1, 2]), u: undefined, n: NaN }`，**When** 写入后读取，**Then** 所有字段类型与值完整还原（含 `u === undefined` 与 `Number.isNaN(n)`）。
3. **Given** 底层已有 v0.2.0 格式数据 `{"value":100}`，**When** 新版本读取，**Then** 返回 `{ value: 100 }`，无标签参与。
4. **Given** 循环引用对象，**When** 写入，**Then** 返回 `false` 并 `console.warn`，不抛异常、不产生半写入。

---

### User Story 3 - 读取时运行时校验与失败提示（Priority: P2）

使用者 `storageRead<TestType>(key, guard)` 传入 type-guard，读取后能通过校验则返回 `T`，不能通过则 `console.warn` 提示并返回 `null`（返回类型 `T | null`，满足"可选类型"诉求）。不传 guard 时保持 v0.2.0 行为。

**Why this priority**: 解决"存 A 读 B 静默类型错配"的问题，但依赖前两个故事奠定的类型体系。

**Independent Test**: 存入 `{ a: 1 }` 后分别用通过/不通过的 guard 读取，断言返回值与 warn 调用；guard 通过时返回原值。

**Acceptance Scenarios**:

1. **Given** 已存 `{ value: 100 }`，**When** `storageRead<Test>(key, isTest)` 且 guard 返回 true，**Then** 返回原对象。
2. **Given** 已存 `{ value: 'str' }`（类型不符），**When** guard 返回 false，**Then** `console.warn` 被调用且返回 `null`。
3. **Given** 未存任何数据的 key，**When** 带 guard 读取，**Then** 返回 `null` 且不调用 warn（不存在数据不是校验失败）。

---

### User Story 4 - 工程质量基建（Priority: P3）

开发者在本仓库提交代码时：commit 规范由 commitlint + husky 强制；push/PR 到 main 触发 GitHub Actions CI（type-check + test + build）；Issue 有规范模板；README 中英双语、CHANGELOG 记录版本变更；测试覆盖率达 ≥95%。

**Why this priority**: 支撑前三个故事的持续交付质量，属配套基建。

**Independent Test**: 制造一个不规范的 commit message 断言被拒；本地 `pnpm test` 与 `pnpm build` 全绿；`.github/` 下工作流与模板文件齐备。

**Acceptance Scenarios**:

1. **Given** husky 已安装，**When** 提交 `随便写的信息`，**Then** commit 被拒绝。
2. **Given** CI 工作流存在，**When** PR 到 main，**Then** type-check/test/build 三个检查全部执行。
3. **Given** 全部实现完成，**When** `vitest run --coverage`，**Then** 库源码语句/分支覆盖率 ≥95%。

### Edge Cases

- 用户数据对象恰好包含 `__matias_tag__`/`__matias_value__` 保留字段且 tag 未知 → 当作普通对象返回，不误还原。
- 空 Map/Set/数组/对象、Map 以对象为 key、超长 BigInt（> Number.MAX_SAFE_INTEGER）→ 均需正确往返（BigInt 以字符串存储无精度损失）。
- `undefined` 顶层写入 → 仍等同删除该 key（v0.2.0 语义），且 SESSION 存储删除的是 sessionStorage 而非 localStorage（修复历史 bug）。
- 存储配额满/隐私模式 setItem 抛错 → 捕获，warn，返回 `false`。
- 存量数据 JSON.parse 失败（脏数据）→ warn 并返回 `null`，不抛异常。
- 顶层传入 function/symbol → 返回 `false` + warn（不支持的类型，安全失败）。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST 完整保留 v0.2.0 公共 API（storageWrite/Read/Remove/RemoveAll 与 localStorage/sessionStorage 系列）的字符串 key 用法与语义。
- **FR-002**: MUST 提供 `defineStorageKey<T>(key, type?)` 返回 typed key；`storageWrite`/`storageRead`（含 local/session 底层函数）接受 typed key 并自动推断类型。
- **FR-003**: MUST 对 Date/Map/Set/RegExp/BigInt/NaN/Infinity/-Infinity/嵌套 undefined 做类型标签序列化，读写往返后类型（instanceof）与值一致。
- **FR-004**: MUST 保持普通数据的裸 JSON 存储格式；v0.2.0 旧数据在新版本读取结果不变（向后兼容）。
- **FR-005**: MUST 支持 `storageRead<T>(key, guard)` 运行时校验：通过返回 `T`，失败 `console.warn` 并返回 `null`；key 不存在返回 `null` 且不告警。
- **FR-006**: MUST 对循环引用、顶层 function/symbol 等不支持情况返回 `false` + warn，不抛异常。
- **FR-007**: MUST 修复 sessionStorage 写入 undefined 时误删 localStorage 数据的 bug。
- **FR-008**: MUST 清理无用依赖（ts-node、rollup-plugin-terser、less-loader、path）与失效的 gulp 脚本。
- **FR-009**: MUST 建立 Vitest + jsdom 测试体系（单测/集成/用例三层），库源码语句与分支覆盖率 ≥95%。
- **FR-010**: MUST 接入 commitlint + husky；提供 GitHub Actions CI（main push/PR：type-check + test + build）；提供 GitHub Issue 模板（Bug 报告/功能建议）。
- **FR-011**: MUST 提供默认英文 README.md 与 README.zh-CN.md 互链，以及 CHANGELOG.md；版本号统一为 0.3.0（tag v0.3.0）。
- **FR-012**: 应在 demo 页展示新特性（typed key、引用类型往返），供人工验证。

### Key Entities

- **StorageKey<T>**: 带类型烙印的 key 对象（key 字符串 + 存储类型 + 类型信息），由 `defineStorageKey` 创建。
- **TaggedValue**: 序列化中间结构 `{ __matias_tag__: string, __matias_value__: unknown }`，仅特殊类型生成。
- **StorageValueGuard<T>**: `(value: unknown) => value is T` 的 type-guard 函数类型。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 全部内置类型（含嵌套组合）读写往返后 `instanceof`/`Object.is` 断言 100% 通过。
- **SC-002**: v0.2.0 格式旧数据在新版本 100% 原样可读（向后兼容测试全通过）。
- **SC-003**: 库源码（src/storage/**）语句与分支覆盖率 ≥95%。
- **SC-004**: `tsc --noEmit`（strict）与 `vitest run` 全绿；CI 工作流本地等价命令全部成功。
- **SC-005**: 不合规 commit message 被 husky/commitlint 拒绝；README 双语与 CHANGELOG 齐备。

## Assumptions

- 本项目为纯前端库，无后端，"pytest 后端单测"豁免；Playwright e2e 本版暂缓（demo 页当前仅用于人工验证）。
- 运行时校验不引入 zod 等依赖，采用无依赖 type-guard 协议（宪法 I）。
- 类型标签采用双保留字段 `__matias_tag__`/`__matias_value__`，未知 tag 视为普通数据。
- 发布（npm publish）不在本版本范围内，仅完成版本号与 CHANGELOG 准备。

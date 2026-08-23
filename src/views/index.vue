<!--
 * @Author: matiastang
 * @Date: 2022-03-31 15:28:39
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 22:30:00
 * @FilePath: /web-storage/src/views/index.vue
 * @Description: matias-storage 功能演示页（交互式 Playground）
-->
<template>
    <div class="page">
        <header class="hero">
            <h1 class="title">matias-storage Playground</h1>
            <p class="subtitle">
                零依赖的 Web Storage 封装：自动 JSON 序列化、引用类型无损往返、 TypeScript
                类型推断、运行时校验。点击下方卡片按钮， 右侧检查器与日志会实时展示存储的真实变化。
            </p>
            <div class="badges">
                <span class="badge">v0.3.0</span>
                <span class="badge">零运行时依赖</span>
                <span class="badge">MIT</span>
            </div>
        </header>

        <div class="layout">
            <main class="cards">
                <!-- ① 基础读写 -->
                <section class="card">
                    <h2 class="card-title">① 基础读写 Playground</h2>
                    <p class="card-desc">
                        storageWrite / storageRead / storageRemove
                        支持两种存储目标，任意值直接存取，无需手动 JSON.stringify。
                    </p>
                    <div class="form">
                        <label class="field">
                            <span class="field-label">key</span>
                            <input v-model="pgKey" data-testid="input-key" />
                        </label>
                        <label class="field">
                            <span class="field-label">值类型</span>
                            <select v-model="pgKind" data-testid="select-kind">
                                <option value="json">JSON / 对象</option>
                                <option value="string">string</option>
                                <option value="number">number</option>
                                <option value="boolean">boolean</option>
                            </select>
                        </label>
                        <label class="field field-wide">
                            <span class="field-label">值</span>
                            <input v-model="pgValue" data-testid="input-value" />
                        </label>
                        <label class="field">
                            <span class="field-label">存储目标</span>
                            <select v-model="pgTarget" data-testid="select-target">
                                <option :value="WebStorageType.LOCAL">localStorage</option>
                                <option :value="WebStorageType.SESSION">sessionStorage</option>
                            </select>
                        </label>
                    </div>
                    <div class="actions">
                        <button class="btn primary" data-testid="btn-write" @click="pgWrite">
                            写入 storageWrite
                        </button>
                        <button class="btn" data-testid="btn-read" @click="pgRead">
                            读取 storageRead
                        </button>
                        <button class="btn" data-testid="btn-remove" @click="pgRemove">
                            删除 storageRemove
                        </button>
                        <button
                            class="btn danger"
                            data-testid="btn-remove-all"
                            @click="pgRemoveAll"
                        >
                            清空 storageRemoveAll
                        </button>
                    </div>
                </section>

                <!-- ② 引用类型无损往返 -->
                <section class="card">
                    <h2 class="card-title">② 引用类型无损往返（0.3.0）</h2>
                    <p class="card-desc">
                        Date / Map / Set / RegExp / BigInt / NaN / 嵌套 undefined
                        写入后完整还原，instanceof 保持不变。
                    </p>
                    <div class="actions">
                        <button
                            class="btn primary"
                            data-testid="btn-ref-write"
                            @click="writeReference"
                        >
                            写入复杂对象（localStorage + sessionStorage）
                        </button>
                        <button class="btn" data-testid="btn-ref-verify" @click="verifyReference">
                            读取并逐项校验类型
                        </button>
                    </div>
                    <table v-if="refChecks.length" class="check-list">
                        <thead>
                            <tr>
                                <th>字段</th>
                                <th>读回结果</th>
                                <th>类型校验</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="check in refChecks"
                                :key="check.label"
                                class="check-row"
                                :class="check.pass ? 'pass' : 'fail'"
                            >
                                <td>{{ check.label }}</td>
                                <td class="check-actual">{{ check.actual }}</td>
                                <td>
                                    <span class="state">{{
                                        check.pass ? '✓ 还原' : '✗ 丢失'
                                    }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else class="placeholder">点击「读取并逐项校验类型」查看还原结果。</p>
                </section>

                <!-- ③ 特殊值与删除语义 -->
                <section class="card">
                    <h2 class="card-title">③ 特殊值与删除语义</h2>
                    <p class="card-desc">
                        JSON 存不了的值也能无损往返；写入 undefined 等同删除 key。
                    </p>
                    <div class="actions">
                        <button
                            class="btn primary"
                            data-testid="btn-special-run"
                            @click="runSpecialValues"
                        >
                            一键往返 NaN / ±Infinity / BigInt / null
                        </button>
                        <button
                            class="btn"
                            data-testid="btn-undef-delete"
                            @click="runUndefinedDelete"
                        >
                            写入 undefined（等同删除）
                        </button>
                    </div>
                </section>

                <!-- ④ typed key -->
                <section class="card">
                    <h2 class="card-title">④ typed key 类型推断（0.3.0）</h2>
                    <p class="card-desc">
                        defineStorageKey 让 key 携带类型与存储目标，读写时 TS
                        自动推断，无需手写泛型。
                    </p>
                    <pre class="code">{{ typedCode }}</pre>
                    <div class="actions">
                        <button
                            class="btn primary"
                            data-testid="btn-typed-write"
                            @click="typedWrite"
                        >
                            storageWrite(userKey, …)
                        </button>
                        <button class="btn" data-testid="btn-typed-read" @click="typedRead">
                            storageRead(userKey)
                        </button>
                    </div>
                    <pre v-if="typedResult" class="result" data-testid="result-typed">{{
                        typedResult
                    }}</pre>
                </section>

                <!-- ⑤ 运行时 guard -->
                <section class="card">
                    <h2 class="card-title">⑤ 运行时 guard 校验（0.3.0）</h2>
                    <p class="card-desc">
                        storageRead 可传 type guard：脏数据被拦截为 null 并告警，
                        避免外部篡改/旧版本数据流入业务。
                    </p>
                    <div class="actions">
                        <button
                            class="btn primary"
                            data-testid="btn-guard-valid"
                            @click="guardWriteValid"
                        >
                            写入合法数据
                        </button>
                        <button
                            class="btn danger"
                            data-testid="btn-guard-tamper"
                            @click="guardTamper"
                        >
                            模拟脏数据（name 被改成 number）
                        </button>
                        <button class="btn" data-testid="btn-guard-read" @click="guardReadWith">
                            带 guard 读取
                        </button>
                        <button
                            class="btn"
                            data-testid="btn-guard-read-raw"
                            @click="guardReadWithout"
                        >
                            不带 guard 读取
                        </button>
                    </div>
                    <pre v-if="guardResult" class="result" data-testid="result-guard">{{
                        guardResult
                    }}</pre>
                </section>

                <!-- ⑥ 序列化格式透视 -->
                <section class="card">
                    <h2 class="card-title">⑥ 序列化格式透视</h2>
                    <p class="card-desc">
                        普通数据保持裸 JSON；特殊类型仅打
                        <code>__matias_tag__</code> 标签，0.2.x 旧数据原样可读。
                    </p>
                    <div class="actions">
                        <button class="btn primary" data-testid="btn-raw-write" @click="writeRaw">
                            写入并查看原始存储字符串
                        </button>
                        <button class="btn" data-testid="btn-legacy-read" @click="readLegacyJson">
                            读取裸 JSON 旧数据（兼容演示）
                        </button>
                    </div>
                    <pre
                        v-if="rawText"
                        class="raw"
                        data-testid="result-raw"
                        v-html="rawHighlighted"
                    ></pre>
                    <p v-else class="placeholder">
                        点击上方按钮后，这里会显示 localStorage 中的原始字符串（高亮为类型标签）。
                    </p>
                </section>
            </main>

            <aside class="side">
                <!-- 实时存储检查器 -->
                <section class="panel">
                    <div class="panel-head">
                        <h2 class="panel-title">存储检查器</h2>
                        <button class="btn mini" data-testid="btn-refresh" @click="refreshStorages">
                            刷新
                        </button>
                    </div>
                    <div class="store" data-testid="panel-local">
                        <div class="store-head">
                            localStorage
                            <span class="count">{{ localEntries.length }} 条</span>
                        </div>
                        <p v-if="!localEntries.length" class="placeholder">（空）</p>
                        <div
                            v-for="entry in localEntries"
                            :key="entry.key"
                            class="entry"
                            :title="entry.value"
                        >
                            <span class="entry-key">{{ entry.key }}</span>
                            <span class="entry-value">{{ truncate(entry.value) }}</span>
                        </div>
                    </div>
                    <div class="store" data-testid="panel-session">
                        <div class="store-head">
                            sessionStorage
                            <span class="count">{{ sessionEntries.length }} 条</span>
                        </div>
                        <p v-if="!sessionEntries.length" class="placeholder">（空）</p>
                        <div
                            v-for="entry in sessionEntries"
                            :key="entry.key"
                            class="entry"
                            :title="entry.value"
                        >
                            <span class="entry-key">{{ entry.key }}</span>
                            <span class="entry-value">{{ truncate(entry.value) }}</span>
                        </div>
                    </div>
                </section>

                <!-- 操作日志 -->
                <section class="panel">
                    <div class="panel-head">
                        <h2 class="panel-title">操作日志</h2>
                        <button class="btn mini" data-testid="btn-log-clear" @click="logs = []">
                            清空
                        </button>
                    </div>
                    <p v-if="!logs.length" class="placeholder">暂无操作</p>
                    <ul class="logs" data-testid="panel-log">
                        <li v-for="(log, index) in logs" :key="index" class="log-item">
                            <span class="log-time">{{ log.time }}</span>
                            <span class="log-kind" :class="`kind-${log.kind}`">{{ log.kind }}</span>
                            <span class="log-text">{{ log.text }}</span>
                        </li>
                    </ul>
                </section>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { StorageWritableValue } from '../storage'
import {
    defineStorageKey,
    storageRead,
    storageRemove,
    storageRemoveAll,
    storageWrite,
    WebStorageType,
} from '../storage'

// ---------- 通用：日志与存储检查器 ----------
type LogKind = 'write' | 'read' | 'remove' | 'info' | 'warn'
interface LogItem {
    time: string
    kind: LogKind
    text: string
}
const logs = ref<LogItem[]>([])
const pushLog = (kind: LogKind, text: string) => {
    logs.value.unshift({ time: new Date().toLocaleTimeString(), kind, text })
    if (logs.value.length > 80) {
        logs.value.pop()
    }
}

interface StorageEntryView {
    key: string
    value: string
}
const localEntries = ref<StorageEntryView[]>([])
const sessionEntries = ref<StorageEntryView[]>([])
const collectEntries = (store: Storage): StorageEntryView[] => {
    const list: StorageEntryView[] = []
    for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (key !== null) {
            list.push({ key, value: store.getItem(key) ?? '' })
        }
    }
    return list
}
const refreshStorages = () => {
    localEntries.value = collectEntries(localStorage)
    sessionEntries.value = collectEntries(sessionStorage)
}

const targetName = (type: WebStorageType) =>
    type === WebStorageType.SESSION ? 'sessionStorage' : 'localStorage'

const jsonReplacer = (_key: string, value: unknown) => {
    if (typeof value === 'bigint') {
        return `${value}n`
    }
    if (typeof value === 'number') {
        if (Number.isNaN(value)) {
            return 'NaN'
        }
        if (value === Infinity) {
            return 'Infinity'
        }
        if (value === -Infinity) {
            return '-Infinity'
        }
    }
    return value
}
const previewValue = (value: unknown): string => {
    if (value === null) {
        return 'null'
    }
    if (value === undefined) {
        return 'undefined'
    }
    if (typeof value === 'string') {
        return JSON.stringify(value)
    }
    if (typeof value === 'bigint') {
        return `${value}n (bigint)`
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return `${String(value)} (${typeof value})`
    }
    if (value instanceof Date) {
        return `${value.toISOString()} (Date)`
    }
    if (value instanceof RegExp) {
        return `${value.toString()} (RegExp)`
    }
    if (value instanceof Map) {
        return `Map(${value.size}) {…} (Map)`
    }
    if (value instanceof Set) {
        return `Set(${value.size}) {…} (Set)`
    }
    try {
        return `${JSON.stringify(value, jsonReplacer)} (${Array.isArray(value) ? 'array' : 'object'})`
    } catch {
        return String(value)
    }
}
const truncate = (text: string) => (text.length > 160 ? `${text.slice(0, 160)}…` : text)

// ---------- ① 基础读写 ----------
const pgKey = ref('MY_OBJECT')
const pgKind = ref<'json' | 'string' | 'number' | 'boolean'>('json')
const pgValue = ref('{"hello":"matias","list":[1,2,3]}')
const pgTarget = ref<WebStorageType>(WebStorageType.LOCAL)

const parsePgValue = (): { value?: StorageWritableValue; error?: string } => {
    if (pgKind.value === 'string') {
        return { value: pgValue.value }
    }
    if (pgKind.value === 'boolean') {
        return { value: pgValue.value === 'true' }
    }
    if (pgKind.value === 'number') {
        const num = Number(pgValue.value)
        if (Number.isNaN(num) && pgValue.value.trim() !== 'NaN') {
            return { error: `「${pgValue.value}」无法解析为 number` }
        }
        return { value: num }
    }
    try {
        return { value: JSON.parse(pgValue.value) as StorageWritableValue }
    } catch (err) {
        return { error: `JSON 解析失败：${err instanceof Error ? err.message : String(err)}` }
    }
}
const pgWrite = () => {
    const { value, error } = parsePgValue()
    if (error !== undefined || value === undefined) {
        pushLog('warn', `写入取消：${error ?? '值为空'}`)
        return
    }
    const ok = storageWrite(pgKey.value, value, pgTarget.value)
    pushLog(
        ok ? 'write' : 'warn',
        `storageWrite('${pgKey.value}', …) → ${ok}（${targetName(pgTarget.value)}）`
    )
    refreshStorages()
}
const pgRead = () => {
    const value = storageRead(pgKey.value, pgTarget.value)
    pushLog(
        value === null ? 'warn' : 'read',
        `storageRead('${pgKey.value}') → ${previewValue(value)}（${targetName(pgTarget.value)}）`
    )
}
const pgRemove = () => {
    storageRemove(pgKey.value, pgTarget.value)
    pushLog('remove', `storageRemove('${pgKey.value}')（${targetName(pgTarget.value)}）`)
    refreshStorages()
}
const pgRemoveAll = () => {
    storageRemoveAll(pgTarget.value)
    pushLog('remove', `storageRemoveAll() 已清空 ${targetName(pgTarget.value)}`)
    refreshStorages()
}

// ---------- ② 引用类型无损往返 ----------
interface RefCheck {
    label: string
    actual: string
    pass: boolean
}
const refChecks = ref<RefCheck[]>([])
const REF_KEY = 'DEMO_REFERENCE'
const SESSION_MAP_KEY = defineStorageKey<Map<string, Date>>(
    'DEMO_SESSION_MAP',
    WebStorageType.SESSION
)

const writeReference = () => {
    const ok = storageWrite(REF_KEY, {
        date: new Date(),
        map: new Map<string, unknown>([
            ['count', 42],
            ['tags', new Set(['vue', 'storage'])],
            ['big', 9007199254740993n],
        ]),
        regexp: /matias-\d+/gi,
        nan: NaN,
        infinity: Infinity,
        maybe: undefined,
    })
    const okSession = storageWrite(SESSION_MAP_KEY, new Map([['created', new Date()]]))
    pushLog(
        'write',
        `storageWrite('${REF_KEY}', { Date/Map/Set/RegExp/BigInt/NaN/undefined… }) → ${ok}`
    )
    pushLog(
        'write',
        `storageWrite(SESSION_MAP_KEY, new Map([['created', new Date()]])) → ${okSession}（typed key 绑定 sessionStorage）`
    )
    refreshStorages()
}
const verifyReference = () => {
    const value = storageRead<Record<string, unknown>>(REF_KEY)
    const map = value?.map
    const sessionMap = storageRead(SESSION_MAP_KEY)
    refChecks.value = [
        {
            label: 'date',
            actual: previewValue(value?.date),
            pass: value?.date instanceof Date,
        },
        {
            label: 'map',
            actual: previewValue(map),
            pass: map instanceof Map,
        },
        {
            label: 'map.get("tags")',
            actual: previewValue(map instanceof Map ? map.get('tags') : undefined),
            pass: map instanceof Map && map.get('tags') instanceof Set,
        },
        {
            label: 'map.get("big")',
            actual: previewValue(map instanceof Map ? map.get('big') : undefined),
            pass: map instanceof Map && typeof map.get('big') === 'bigint',
        },
        {
            label: 'regexp',
            actual: previewValue(value?.regexp),
            pass: value?.regexp instanceof RegExp,
        },
        {
            label: 'nan',
            actual: previewValue(value?.nan),
            pass: Number.isNaN(value?.nan as number),
        },
        {
            label: 'infinity',
            actual: previewValue(value?.infinity),
            pass: value?.infinity === Infinity,
        },
        {
            label: 'maybe（嵌套 undefined 保留）',
            actual: `'maybe' in value → ${value !== null && 'maybe' in value}`,
            pass: value !== null && 'maybe' in value,
        },
        {
            label: 'sessionStorage 的 Map',
            actual: previewValue(sessionMap),
            pass: sessionMap instanceof Map && sessionMap.get('created') instanceof Date,
        },
    ]
    const passed = refChecks.value.filter((check) => check.pass).length
    pushLog(
        'read',
        `storageRead('${REF_KEY}') 类型校验：${passed}/${refChecks.value.length} 项还原`
    )
}

// ---------- ③ 特殊值与删除语义 ----------
const SPECIAL_KEY = 'DEMO_SPECIAL'
const runSpecialValues = () => {
    const demos: { label: string; value: StorageWritableValue }[] = [
        { label: 'NaN', value: NaN },
        { label: 'Infinity', value: Infinity },
        { label: '-Infinity', value: -Infinity },
        { label: 'BigInt', value: 9007199254740993n },
        { label: 'null', value: null },
    ]
    demos.forEach(({ label, value }) => {
        const key = `${SPECIAL_KEY}_${label}`
        storageWrite(key, value)
        pushLog('read', `${label}：写入 → 读回 ${previewValue(storageRead(key))}`)
    })
    refreshStorages()
}
const runUndefinedDelete = () => {
    storageWrite(SPECIAL_KEY, 'temporary')
    storageWrite(SPECIAL_KEY, undefined)
    pushLog(
        'remove',
        `storageWrite('${SPECIAL_KEY}', undefined) 等同删除 → 再读取返回 ${storageRead(SPECIAL_KEY)}`
    )
    refreshStorages()
}

// ---------- ④ typed key ----------
interface DemoUser {
    name: string
    age: number
}
const userKey = defineStorageKey<DemoUser>('DEMO_USER')
const typedResult = ref('')
const typedCode = `interface DemoUser { name: string; age: number }

const userKey = defineStorageKey<DemoUser>('DEMO_USER')
storageWrite(userKey, { name: 'matias', age: 18 })
const user = storageRead(userKey)   // DemoUser | null，类型自动推断`
const typedWrite = () => {
    const ok = storageWrite(userKey, { name: 'matias', age: 18 })
    typedResult.value = `storageWrite(userKey, { name: 'matias', age: 18 }) → ${ok}`
    pushLog('write', typedResult.value)
    refreshStorages()
}
const typedRead = () => {
    const user = storageRead(userKey)
    typedResult.value = `storageRead(userKey) → ${previewValue(user)}（编辑器中返回类型为 DemoUser | null，无需手写泛型）`
    pushLog('read', typedResult.value)
}

// ---------- ⑤ 运行时 guard ----------
const isDemoUser = (value: unknown): value is DemoUser =>
    !!value && typeof value === 'object' && typeof (value as DemoUser).name === 'string'
const guardResult = ref('')

const guardWriteValid = () => {
    storageWrite(userKey, { name: 'matias', age: 18 })
    guardResult.value = `已写入合法数据 → 带 guard 读取：${previewValue(storageRead(userKey, isDemoUser))}`
    pushLog('write', guardResult.value)
    refreshStorages()
}
const guardTamper = () => {
    // 模拟外部篡改或旧版本脏数据：name 不是 string
    localStorage.setItem(userKey.key, JSON.stringify({ name: 12345, age: 18 }))
    guardResult.value = '已写入脏数据 { name: 12345 }，分别试试下面两种读取方式'
    pushLog('warn', guardResult.value)
    refreshStorages()
}
const guardReadWith = () => {
    const value = storageRead(userKey, isDemoUser)
    guardResult.value =
        `storageRead(userKey, isDemoUser) → ${previewValue(value)}` +
        (value === null
            ? '（校验失败：console.warn 告警 + 返回 null，脏数据不流入业务）'
            : '（校验通过）')
    pushLog(value === null ? 'warn' : 'read', guardResult.value)
}
const guardReadWithout = () => {
    const value = storageRead(userKey)
    guardResult.value = `storageRead(userKey)（不带 guard）→ ${previewValue(value)}（原样返回，类型由调用方自负）`
    pushLog('read', guardResult.value)
}

// ---------- ⑥ 序列化格式透视 ----------
const RAW_KEY = 'DEMO_RAW'
const rawText = ref('')
const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rawHighlighted = computed(() =>
    escapeHtml(rawText.value)
        .replace(/__matias_tag__/g, '<mark>__matias_tag__</mark>')
        .replace(/__matias_value__/g, '<mark>__matias_value__</mark>')
)
const writeRaw = () => {
    storageWrite(RAW_KEY, {
        createdAt: new Date('2026-08-23T08:00:00.000Z'),
        tags: new Set(['a', 'b']),
        factor: 9007199254740993n,
        ratio: NaN,
    })
    rawText.value = localStorage.getItem(RAW_KEY) ?? ''
    pushLog('write', `storageWrite('${RAW_KEY}', …) 完成，localStorage 原始字符串见下方高亮`)
    refreshStorages()
}
const readLegacyJson = () => {
    // 模拟 0.2.x 或其他库写入的裸 JSON
    localStorage.setItem('DEMO_LEGACY', JSON.stringify({ from: '0.2.x', list: [1, 2] }))
    const value = storageRead<{ from: string }>('DEMO_LEGACY')
    pushLog(
        'read',
        `裸 JSON 旧数据 storageRead('DEMO_LEGACY') → ${previewValue(value)}（向后兼容，无需迁移）`
    )
    refreshStorages()
}

// ---------- 初始化 ----------
onMounted(() => {
    storageWrite(userKey, { name: 'matias', age: 18 })
    writeReference()
    pushLog('info', '页面初始化：已写入演示数据，点击卡片按钮体验各项能力')
    refreshStorages()
})
</script>

<style lang="less" scoped>
.page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 20px 60px;
    font-size: 14px;
}

.hero {
    margin-bottom: 20px;
    .title {
        margin: 0 0 8px;
        font-size: 26px;
        color: #1f2d3d;
    }
    .subtitle {
        margin: 0 0 10px;
        max-width: 860px;
        line-height: 1.7;
        color: #5e6d82;
    }
    .badges {
        display: flex;
        gap: 8px;
    }
    .badge {
        padding: 2px 10px;
        border: 1px solid #42b983;
        border-radius: 999px;
        color: #42b983;
        font-size: 12px;
    }
}

.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: 16px;
    align-items: start;
}

// ---------- 卡片 ----------
.cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
}
.card {
    padding: 16px 18px;
    background: #fff;
    border: 1px solid #e4e8ee;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(31, 45, 61, 0.05);
    .card-title {
        margin: 0 0 6px;
        font-size: 16px;
        color: #1f2d3d;
    }
    .card-desc {
        margin: 0 0 12px;
        line-height: 1.7;
        color: #5e6d82;
    }
}

.form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
    .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }
    .field-wide {
        grid-column: 1 / -1;
    }
    .field-label {
        font-size: 12px;
        color: #8492a6;
    }
    input,
    select {
        padding: 6px 10px;
        border: 1px solid #d8dce5;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
        &:focus {
            border-color: #42b983;
        }
    }
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.btn {
    padding: 6px 14px;
    border: 1px solid #d8dce5;
    border-radius: 6px;
    background: #fff;
    color: #1f2d3d;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
        border-color: #42b983;
        color: #42b983;
    }
    &.primary {
        border-color: #42b983;
        background: #42b983;
        color: #fff;
        &:hover {
            background: #33a06f;
        }
    }
    &.danger {
        border-color: #e5322d;
        color: #e5322d;
        &:hover {
            background: #e5322d;
            color: #fff;
        }
    }
    &.mini {
        padding: 2px 10px;
        font-size: 12px;
    }
}

// 代码与结果展示
.code,
.result,
.raw {
    margin: 12px 0 0;
    padding: 12px;
    border-radius: 8px;
    font-family: Consolas, Menlo, Monaco, 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
}
.code {
    background: #282c34;
    color: #abb2bf;
}
.result {
    background: #f4f6f9;
    color: #1f2d3d;
}
.raw {
    background: #282c34;
    color: #abb2bf;
    mark {
        padding: 0 2px;
        border-radius: 3px;
        background: #e6c07b;
        color: #282c34;
        font-weight: bold;
    }
}
.placeholder {
    margin: 12px 0 0;
    color: #99a9bf;
    font-size: 13px;
}

// ② 校验表
.check-list {
    width: 100%;
    margin-top: 12px;
    border-collapse: collapse;
    font-size: 13px;
    th,
    td {
        padding: 6px 10px;
        border: 1px solid #e4e8ee;
        text-align: left;
    }
    th {
        background: #f4f6f9;
        color: #5e6d82;
        font-weight: normal;
    }
    .check-actual {
        font-family: Consolas, Menlo, monospace;
        font-size: 12px;
        word-break: break-all;
    }
    .check-row.pass .state {
        color: #42b983;
        font-weight: bold;
    }
    .check-row.fail .state {
        color: #e5322d;
        font-weight: bold;
    }
}

// ---------- 右侧面板 ----------
.side {
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: calc(100vh - 32px);
    overflow: auto;
}
.panel {
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #e4e8ee;
    border-radius: 10px;
    .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    .panel-title {
        margin: 0;
        font-size: 15px;
        color: #1f2d3d;
    }
    .store {
        margin-bottom: 10px;
    }
    .store-head {
        padding: 4px 0;
        border-bottom: 1px solid #e4e8ee;
        font-weight: bold;
        color: #1f2d3d;
        .count {
            margin-left: 6px;
            color: #8492a6;
            font-size: 12px;
            font-weight: normal;
        }
    }
    .entry {
        display: flex;
        gap: 8px;
        padding: 5px 0;
        border-bottom: 1px dashed #f0f2f5;
        font-size: 12px;
        .entry-key {
            flex-shrink: 0;
            max-width: 40%;
            color: #42b983;
            font-family: Consolas, Menlo, monospace;
            word-break: break-all;
        }
        .entry-value {
            flex: 1;
            min-width: 0;
            color: #5e6d82;
            font-family: Consolas, Menlo, monospace;
            word-break: break-all;
        }
    }
}

.logs {
    margin: 0;
    padding: 0;
    list-style: none;
    .log-item {
        display: flex;
        gap: 8px;
        padding: 4px 0;
        border-bottom: 1px dashed #f0f2f5;
        font-size: 12px;
        line-height: 1.5;
    }
    .log-time {
        flex-shrink: 0;
        color: #99a9bf;
        font-family: Consolas, Menlo, monospace;
    }
    .log-kind {
        flex-shrink: 0;
        font-weight: bold;
        &.kind-write {
            color: #2db7f5;
        }
        &.kind-read {
            color: #42b983;
        }
        &.kind-remove {
            color: #ff9800;
        }
        &.kind-info {
            color: #8492a6;
        }
        &.kind-warn {
            color: #e5322d;
        }
    }
    .log-text {
        flex: 1;
        min-width: 0;
        color: #5e6d82;
        word-break: break-all;
    }
}

// 响应式：窄屏右侧面板沉底
@media (max-width: 1100px) {
    .layout {
        grid-template-columns: 1fr;
    }
    .side {
        position: static;
        max-height: none;
    }
}
</style>

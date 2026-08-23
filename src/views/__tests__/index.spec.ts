/*
 * @Author: matiastang
 * @Date: 2026-08-23 22:30:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 22:30:00
 * @FilePath: /web-storage/src/views/__tests__/index.spec.ts
 * @Description: Playground 演示页用例：覆盖各功能卡片交互（用例层冒烟）
 */
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { storageRead } from '@/storage'
import Index from '../index.vue'

type IndexWrapper = ReturnType<typeof mount>
const byTestId = (wrapper: IndexWrapper, id: string) => wrapper.find(`[data-testid="${id}"]`)

describe('Playground 演示页', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('挂载后渲染六个功能卡片与存储检查器', () => {
        const wrapper = mount(Index)
        expect(wrapper.findAll('.card')).toHaveLength(6)
        expect(byTestId(wrapper, 'panel-local').exists()).toBe(true)
        expect(byTestId(wrapper, 'panel-session').exists()).toBe(true)
        expect(byTestId(wrapper, 'panel-log').exists()).toBe(true)
    })

    it('初始化写入 typed key 与引用类型演示数据', () => {
        mount(Index)
        expect(localStorage.getItem('DEMO_USER')).toContain('matias')
        expect(localStorage.getItem('DEMO_REFERENCE')).toContain('__matias_tag__')
        expect(sessionStorage.getItem('DEMO_SESSION_MAP')).toContain('Map')
    })

    it('基础读写：写入 → 读取 → 删除', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'input-key').setValue('PLAY_KEY')
        await byTestId(wrapper, 'input-value').setValue('{"n":1}')
        await byTestId(wrapper, 'btn-write').trigger('click')
        expect(localStorage.getItem('PLAY_KEY')).toBe('{"n":1}')
        await byTestId(wrapper, 'btn-read').trigger('click')
        await byTestId(wrapper, 'btn-remove').trigger('click')
        expect(localStorage.getItem('PLAY_KEY')).toBeNull()
    })

    it('基础读写：切换到 sessionStorage 后数据写入对应存储', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'input-key').setValue('PLAY_SESSION')
        await byTestId(wrapper, 'input-value').setValue('"hello-session"')
        await byTestId(wrapper, 'select-target').setValue('sessionStorage')
        await byTestId(wrapper, 'btn-write').trigger('click')
        expect(localStorage.getItem('PLAY_SESSION')).toBeNull()
        expect(sessionStorage.getItem('PLAY_SESSION')).toBe('"hello-session"')
    })

    it('引用类型往返：Date/Map/Set/RegExp/BigInt/NaN 全部还原', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-ref-write').trigger('click')
        await byTestId(wrapper, 'btn-ref-verify').trigger('click')
        const rows = wrapper.findAll('.check-row')
        expect(rows).toHaveLength(9)
        expect(rows.filter((row) => row.classes().includes('pass'))).toHaveLength(9)
        const value = storageRead<Record<string, any>>('DEMO_REFERENCE') as Record<string, any>
        expect(value.date instanceof Date).toBe(true)
        expect(value.map instanceof Map).toBe(true)
        expect(value.map.get('tags') instanceof Set).toBe(true)
        expect(value.map.get('big')).toBe(9007199254740993n)
        expect(value.regexp instanceof RegExp).toBe(true)
        expect(Number.isNaN(value.nan)).toBe(true)
        expect('maybe' in value).toBe(true)
    })

    it('特殊值：NaN / ±Infinity / BigInt / null 一键往返', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-special-run').trigger('click')
        expect(Number.isNaN(storageRead('DEMO_SPECIAL_NaN'))).toBe(true)
        expect(storageRead('DEMO_SPECIAL_Infinity')).toBe(Infinity)
        expect(storageRead('DEMO_SPECIAL_-Infinity')).toBe(-Infinity)
        expect(storageRead('DEMO_SPECIAL_BigInt')).toBe(9007199254740993n)
        expect(storageRead('DEMO_SPECIAL_null')).toBeNull()
    })

    it('写入 undefined 等同删除', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-undef-delete').trigger('click')
        expect(localStorage.getItem('DEMO_SPECIAL')).toBeNull()
    })

    it('typed key：写入并读取', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-typed-write').trigger('click')
        expect(localStorage.getItem('DEMO_USER')).toContain('matias')
        await byTestId(wrapper, 'btn-typed-read').trigger('click')
        expect(byTestId(wrapper, 'result-typed').text()).toContain('matias')
    })

    it('guard：脏数据被拦截为 null，不带 guard 原样返回', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-guard-tamper').trigger('click')
        expect(localStorage.getItem('DEMO_USER')).toBe('{"name":12345,"age":18}')
        await byTestId(wrapper, 'btn-guard-read').trigger('click')
        expect(byTestId(wrapper, 'result-guard').text()).toContain('null')
        await byTestId(wrapper, 'btn-guard-read-raw').trigger('click')
        expect(byTestId(wrapper, 'result-guard').text()).toContain('12345')
    })

    it('序列化透视：原始字符串含类型标签，裸 JSON 旧数据可读', async () => {
        const wrapper = mount(Index)
        await byTestId(wrapper, 'btn-raw-write').trigger('click')
        expect(byTestId(wrapper, 'result-raw').text()).toContain('__matias_tag__')
        await byTestId(wrapper, 'btn-legacy-read').trigger('click')
        expect(storageRead('DEMO_LEGACY')).toEqual({ from: '0.2.x', list: [1, 2] })
    })

    it('storageRemoveAll 清空当前存储目标', async () => {
        const wrapper = mount(Index)
        expect(localStorage.length).toBeGreaterThan(0)
        await byTestId(wrapper, 'btn-remove-all').trigger('click')
        expect(localStorage.length).toBe(0)
    })
})

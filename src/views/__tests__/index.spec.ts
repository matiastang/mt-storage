/*
 * @Author: matiastang
 * @Date: 2026-08-23 20:12:00
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23 20:12:00
 * @FilePath: /web-storage/src/views/__tests__/index.spec.ts
 * @Description: demo 页组件用例：挂载即执行真实存取链路（用例层冒烟）
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Index from '../index.vue'

describe('demo 页组件', () => {
    it('挂载后向 localStorage 写入测试数据', () => {
        const wrapper = mount(Index)
        expect(wrapper.find('.page').exists()).toBe(true)
        // 组件 setup 阶段写入的 object 数据
        const value = localStorage.getItem('KEY_OBJECT')
        expect(value).not.toBeNull()
    })

    it('点击"改变所有缓存值"后数据更新', async () => {
        const before = localStorage.getItem('KEY_NUMBER')
        const wrapper = mount(Index)
        await wrapper.find('.page').trigger('click')
        const after = localStorage.getItem('KEY_NUMBER')
        expect(after).not.toBeNull()
        expect(after).not.toBe(before)
    })
})

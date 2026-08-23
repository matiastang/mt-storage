name: ✨ 功能建议
description: 为 matias-storage 提出新功能建议
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: 要解决的问题
      description: 该功能建议解决什么痛点或场景
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: 期望的方案
      description: 你期望的 API 或行为，可附代码示例
      placeholder: |
        const key = defineStorageKey<MyType>('KEY')
        storageWrite(key, value)
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: 备选方案
      description: 你考虑过的其他做法

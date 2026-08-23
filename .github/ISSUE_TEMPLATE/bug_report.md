name: 🐛 Bug 报告
description: 报告 matias-storage 的问题
labels: [bug]
body:
  - type: textarea
    id: description
    attributes:
      label: 问题描述
      description: 清晰简洁地描述问题现象
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: 复现步骤
      description: 如何复现该问题
      placeholder: |
        1. 调用 storageWrite('KEY', new Map(...))
        2. 刷新页面后 storageRead('KEY')
        3. 观察到 ...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 期望行为
      description: 你预期应该发生什么
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: 实际行为
      description: 实际发生了什么（含控制台告警/报错信息）
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: 环境信息
      description: matias-storage 版本、浏览器及版本、Node/pnpm 版本等
    validations:
      required: true

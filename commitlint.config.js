export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // 中文 subject 允许较长描述
        'header-max-length': [2, 'always', 120],
        // scope 可选（如 chore(release)、docs(spec)）
        'scope-empty': [0],
    },
}

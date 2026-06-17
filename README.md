# Personal Toolbox

本地优先、静态 Web 可运行的个人工具台。工具逻辑使用 TypeScript 源码管理，用户数据使用 IndexedDB 持久化。

## 运行

```bash
pnpm install
pnpm dev
```

## 构建和测试

```bash
pnpm generate:tools
pnpm build
pnpm test
```

## 新增工具

在 `tools/builtin/<tool-id>/` 下创建：

- `manifest.ts`
- `examples.ts`
- `index.ts`
- `test.ts`
- `README.md`

然后执行：

```bash
pnpm generate:tools
```

工具会自动进入 `src/generated/tool-registry.ts` 和 `src/generated/tool-search-index.ts`。

# Helios Kanban Web Companion — 设计说明

## 项目定位

为 [Helios Kanban](https://github.com/SolomonFang/helios-kanban) 提供"点选页面元素 → 定位组件源码"的开发辅助能力，供其在 iframe 中预览应用时使用。

设计来源：[ericclemmons/click-to-component](https://github.com/ericclemmons/click-to-component)。

## 与 click-to-component 的关系与差异

click-to-component 的核心机制：

- 通过 React 内部实例（fiber）反查 DOM 元素对应的组件，借助构建工具注入的 `__source` / `data-source` 信息拿到源码路径与行列号。
- Option+Click 后直接跳转到 `vscode://file/...` 协议 URL，在 VS Code 中打开源码。

本项目在其基础上做了关键改造：

- **不直接跳转编辑器**。点击后通过 `window.parent.postMessage` 向宿主页面（Helios Kanban）发送 `open-in-editor` 消息，由宿主决定如何处理（打开编辑器、创建任务等）。这是为了在 iframe 场景下工作——iframe 内无法直接触发 `vscode://` 协议跳转。
- **消息协议**：所有消息携带 `source: 'click-to-component'`，主要类型为 `ready`（工具加载完成）和 `open-in-editor`（携带选中组件名、源码路径、编辑器、点击坐标、被点击 DOM 元素信息等）。协议格式见根目录 `parent-example.html` 中的宿主侧示例。
- **双框架实现**：拆分为 React 与 Vue 2.7 两个独立包，各自实现同一套 postMessage 协议（见 `.changeset/helios-kanban-companion-split.md`）。

## 仓库结构（pnpm monorepo）

```
packages/                          # 可发布包（发包对象）
  react-helios-kanban-companion/   # React 实现，组件名 HeliosKanbanCompanion
  vue-helios-kanban-companion/     # Vue 2.7 实现，同一套 postMessage 协议
apps/                              # 演示/开发调试用的示例应用，不发布
  cra/                             # Create React App 示例
  next/                            # Next.js 示例
parent-example.html                # 宿主页面（iframe 父级）协议示例
```

设计原则：**`packages/` 是唯一的发包来源，`apps/` 只是消费者**。

- `apps/*` 全部 `private: true`，通过 `workspace:*` 协议引用 packages 里的包，用于本地联调和验证。
- `.changeset/config.json` 中已 `ignore` 掉 `cra-app`、`next-app`，版本管理与发布流程完全不涉及它们。
- 后续新增框架支持时，同样走 `packages/<framework>-helios-kanban-companion` 的模式新增包，而不是改 apps。

## 技术选型

- **pnpm workspace**：依赖管理与跨包引用（`pnpm-workspace.yaml` 声明 `packages/*` 与 `apps/*`）。
- **turbo**：任务编排（`build` / `lint` / `dev`），根目录脚本用 `--filter=*-helios-kanban-companion` 只对可发布包跑构建。
- **无构建步骤**：两个包均直接发布 `src/` 下的 ESM 源码（`files: ["src"]`，`exports` 指向 `src/index.js`），由使用方的打包器处理。这是沿用 click-to-component 的策略——该工具只在开发环境使用，源码直出便于调试。
- **changesets**：版本号与 CHANGELOG 管理、npm 发布。

## 发布流程

1. 开发时通过 `pnpm changeset` 记录变更（指定哪些包、semver 级别、变更说明），生成 `.changeset/*.md`。
2. 推送到 `main` 后，`.github/workflows/release.yml` 中的 `changesets/action` 自动执行：
   - 存在未消费的 changeset 时，开出一个 "Version Packages" PR（聚合版本号升级与 CHANGELOG）；
   - 该 PR 合并后自动执行 `pnpm release`（即 `changeset publish`）发布到 npm。
3. 需要在仓库 secrets 中配置 `NPM_TOKEN`（npm access token，publish 权限）；`access: "public"` 已在 changeset 配置中声明。
4. 首次发布注意：`react-helios-kanban-companion` 与 `vue-helios-kanban-companion` 在 npm 上尚不存在，发布会创建新包。

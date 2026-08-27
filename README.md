# Helios Kanban Web Companion

Point-and-click component source locating for web apps, built for [Helios Kanban](https://github.com/SolomonFang/helios-kanban).

Alt+Click (⌥ Option on macOS) any element in your running app to identify the component that rendered it and its source file. Instead of navigating to an editor directly, the companion sends an `open-in-editor` message to the parent window via `postMessage`, so it works inside the Helios Kanban iframe preview. See [`parent-example.html`](./parent-example.html) for the host-side protocol.

Forked from [click-to-component](https://github.com/ericclemmons/click-to-component) by [Eric Clemmons](https://github.com/ericclemmons).

## Packages

| Package | Description |
| --- | --- |
| [`react-helios-kanban-companion`](./packages/react-helios-kanban-companion) | React implementation (`HeliosKanbanCompanion`). Works with Next.js, Create React App, Vite, and other setups that inject JSX source metadata. |
| [`vue-helios-kanban-companion`](./packages/vue-helios-kanban-companion) | Vue 2.7 implementation speaking the same `postMessage` protocol. Works with Vite (`vite-plugin-vue2`) and webpack (`vue-loader`). |

Both packages ship unbuilt ESM source and are tree-shaken out of production builds.

## Repository layout

```
packages/   # publishable packages (React / Vue companions)
apps/       # private demo apps (Create React App, Next.js) for local development
```

See [DESIGN.md](./DESIGN.md) for the design notes (in Chinese).

## Development

```shell
pnpm install
pnpm dev      # run demo apps in parallel
pnpm build    # build the publishable packages
pnpm lint     # type-check the publishable packages
```

## Release

Versioning and publishing are managed with [Changesets](https://github.com/changesets/changesets):

1. Run `pnpm changeset` to record your changes.
2. Merging to `main` opens a "Version Packages" PR via the release workflow.
3. Merging that PR publishes the packages to npm.

## License

[ISC](./LICENSE)

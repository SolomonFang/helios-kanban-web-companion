# Vue Helios Kanban Companion

This package adds point-and-click edit functionality to Vue 2 apps, when used with Helios Kanban.

Works with Vue 2.7 projects built by [Vite](https://vitejs.dev/) (`vite-plugin-vue2`)
or webpack (`vue-loader`) — both inject `options.__file` into every component
in development builds, which is how clicked elements are mapped back to their
source `.vue` files.

For React apps, use [`react-helios-kanban-companion`](../react-helios-kanban-companion) instead.

## Installation

Even though `vue-helios-kanban-companion` is added to `dependencies`, [tree-shaking](https://esbuild.github.io/api/#tree-shaking) will remove `vue-helios-kanban-companion` from `production` builds.

Add this dependency to your project:
```shell
npm i vue-helios-kanban-companion
```

## Usage

Register the component once, near the root of your app (e.g. `App.vue`):

```diff
 <template>
   <div id="app">
+    <helios-kanban-companion />
     <router-view />
   </div>
 </template>

 <script>
+import { HeliosKanbanCompanion } from 'vue-helios-kanban-companion'

 export default {
   name: 'App',
+  components: { HeliosKanbanCompanion },
 }
 </script>
```

The component renders nothing visible until the parent window (Helios Kanban)
sends the `enable-button` message; hold <kbd>Alt</kbd> (<kbd>⌥ Option</kbd> on
macOS) and click any element to locate its source component.

### Selecting modules

Targeting mode is entered either by holding <kbd>Alt</kbd>/<kbd>⌥ Option</kbd>
or by clicking the floating HK button (shown after the `enable-button`
message). While active, moving the mouse highlights the whole Vue **module**
(component) under the cursor — the outline snaps to the component's root
element, not to whichever inner DOM node the pointer touches. Clicking
reports the highlighted module to the parent window.

## Notes

- Vue 2 does not record line/column numbers for components, so `pathToSource`
  always points at `file.vue:1:1`. The file path itself is exact.
- Source mapping relies on `__file`, which only exists in development builds —
  make sure you test with the dev server, not a production bundle.
- The component speaks the same `postMessage` protocol
  (`source: 'click-to-component', version: 1`) as the React package, so the
  parent-side integration is identical.

## Credits

Thanks to [Eric Clemmons](https://github.com/ericclemmons) for creating the original [Click-To-Component](https://github.com/ericclemmons/click-to-component) library, from which our helper is forked from.

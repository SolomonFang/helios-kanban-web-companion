# React Helios Kanban Companion

This package adds point-and-click edit functionality to React apps, when used with Helios Kanban.

Works with frameworks like [Next.js](https://nextjs.org/),
  [Create React App](https://create-react-app.dev/),
  & [Vite](https://github.com/vitejs/vite/tree/main/packages/plugin-react)
  that use [@babel/plugin-transform-react-jsx-source](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source)
  (or the equivalent `jsxDev` mode of esbuild / SWC).

For Vue 2 apps, use [`vue-helios-kanban-companion`](../vue-helios-kanban-companion) instead.

## Installation

Even though `react-helios-kanban-companion` is added to `dependencies`, [tree-shaking](https://esbuild.github.io/api/#tree-shaking) will remove `react-helios-kanban-companion` from `production` builds.

Add this dependency to your project:
```shell
npm i react-helios-kanban-companion
```

## Usage

<details>
<summary>Create React App</summary>

```diff
+import { HeliosKanbanCompanion } from 'react-helios-kanban-companion';
 import React from 'react';
 import ReactDOM from 'react-dom/client';
 import './index.css';
@@ -8,7 +7,6 @@ import reportWebVitals from './reportWebVitals';
 const root = ReactDOM.createRoot(document.getElementById('root'));
 root.render(
   <React.StrictMode>
+    <HeliosKanbanCompanion />
     <App />
   </React.StrictMode>
 );
```

</details>

<details>
<summary>Next.js</summary>

```diff
+import { HeliosKanbanCompanion } from 'react-helios-kanban-companion'
 import type { AppProps } from 'next/app'
 import '../styles/globals.css'

 function MyApp({ Component, pageProps }: AppProps) {
   return (
     <>
+      <HeliosKanbanCompanion />
       <Component {...pageProps} />
     </>
   )
```

</details>

<details>
<summary>Vite</summary>

```diff
+import { HeliosKanbanCompanion } from "react-helios-kanban-companion";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
+   <HeliosKanbanCompanion />
  </React.StrictMode>
);
```

</details>

<details>
<summary>React 16 + react-hot-loader v3 (legacy)</summary>

`AppContainer` from `react-hot-loader@3` only accepts a single child
(`React.Children.only`), so wrap siblings in a fragment:

```diff
+import { HeliosKanbanCompanion } from "react-helios-kanban-companion";

 ReactDOM.render(
   <AppContainer warnings={false}>
+    <>
       <Provider store={store}>
         <App />
       </Provider>
+      <HeliosKanbanCompanion />
+    </>
   </AppContainer>,
   document.getElementById("app")
 );
```

</details>

## Credits

Thanks to [Eric Clemmons](https://github.com/ericclemmons) for creating the original [Click-To-Component](https://github.com/ericclemmons/click-to-component) library, from which our helper is forked from.

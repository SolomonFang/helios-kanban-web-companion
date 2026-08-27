/**
 * @typedef {import('./types.js').PathModifier} PathModifier
 * @typedef {import('./types.js').VueInstance} VueInstance
 */

import { getDisplayNameForInstance } from './getDisplayNameForInstance.js'
import { getPathToSource } from './getPathToSource.js'
import { getPropsForInstance } from './getPropsForInstance.js'
import { getSourceForInstance } from './getSourceForInstance.js'
import { getUrl } from './getUrl.js'
import { getVueInstancesForElement } from './getVueInstancesForElement.js'
import { hkIcon } from './hkIcon.js'

export const State = /** @type {const} */ ({
  IDLE: 'IDLE',
  HOVER: 'HOVER',
  SELECT: 'SELECT',
})

export const Trigger = /** @type {const} */ ({
  ALT_KEY: 'alt-key',
  BUTTON: 'button',
})

// Message source and version for iframe communication
const MESSAGE_SOURCE = 'click-to-component'
const MESSAGE_VERSION = 1

/**
 * Extract component instances data for a target element
 * @param {HTMLElement} target
 * @param {PathModifier} pathModifier
 * @returns {Array}
 */
function getComponentInstances(target, pathModifier) {
  if (!target) return []

  const instances = getVueInstancesForElement(target).filter((instance) =>
    getSourceForInstance(instance)
  )

  return instances.map((instance) => {
    const name = getDisplayNameForInstance(instance)
    const source = getSourceForInstance(instance)
    const path = getPathToSource(source, pathModifier)
    const props = getPropsForInstance(instance)

    return {
      name,
      props,
      source: {
        fileName: source.fileName,
        lineNumber: source.lineNumber,
        columnNumber: source.columnNumber
      },
      pathToSource: path
    }
  })
}

/**
 * Send a message to the parent window when opening in editor.
 * No-ops when not inside an iframe.
 * @param {Object} args
 * @param {string} args.editor
 * @param {string} args.pathToSource
 * @param {string} args.url
 * @param {'alt-click'|'context-menu'} args.trigger
 * @param {MouseEvent} [args.event]
 * @param {HTMLElement} [args.element]
 * @param {PathModifier} [args.pathModifier]
 * @param {string} [args.selectedComponent] - Name of the selected component
 */
function postOpenToParent({ editor, pathToSource, url, trigger, event, element, pathModifier, selectedComponent }) {
  try {
    const el = element || (event && event.target instanceof HTMLElement ? event.target : null)

    // Get all component instances for the clicked element
    const allComponents = el ? getComponentInstances(el, pathModifier) : []

    // Find the selected component in the list (or use the first one)
    const selected = selectedComponent
      ? allComponents.find(comp => comp.name === selectedComponent)
      : allComponents.find(comp => comp.pathToSource === pathToSource) || allComponents[0]

    const elementInfo = el
      ? {
        tag: el.tagName?.toLowerCase?.() || undefined,
        id: el.id || undefined,
        className:
          typeof el.className === 'string'
            ? el.className
            : String(el.className || ''),
        role: el.getAttribute('role') || undefined,
        dataset: { ...el.dataset },
      }
      : undefined

    const message = {
      source: MESSAGE_SOURCE,
      version: MESSAGE_VERSION,
      type: 'open-in-editor',
      payload: {
        selected: selected ? {
          editor,
          pathToSource: selected.pathToSource,
          url,
          name: selected.name,
          props: selected.props,
          source: selected.source
        } : {
          editor,
          pathToSource,
          url,
          name: selectedComponent || 'Unknown',
          props: {},
          source: {}
        },
        components: allComponents,
        trigger,
        coords: event
          ? { x: event.clientX ?? undefined, y: event.clientY ?? undefined }
          : undefined,
        clickedElement: elementInfo,
      },
    }

    if (
      typeof window !== 'undefined' &&
      window.parent &&
      window.parent !== window &&
      typeof window.parent.postMessage === 'function'
    ) {
      window.parent.postMessage(message, '*') // dev-only, permissive
    }
  } catch (err) {
    // Never break product flows due to messaging
    console.warn('[click-to-component] postMessage failed', err)
  }
}

const ICON_DATA_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(hkIcon)

export const HeliosKanbanCompanion = {
  name: 'HeliosKanbanCompanion',

  data() {
    return {
      /** @type {State[keyof State]} */
      state: State.IDLE,
      /** @type {Trigger[keyof Trigger] | null} */
      trigger: null,
      showButton: false,
    }
  },

  computed: {
    editor() {
      return 'vscode' // legacy
    },
    /** @returns {PathModifier} */
    pathModifier() {
      return (path) => path // legacy
    },
  },

  watch: {
    state: 'applyIndicator',
    trigger: 'applyIndicator',
  },

  created() {
    // Non-reactive on purpose: a DOM element must not be observed by Vue
    /** @type {HTMLElement | null} */
    this.target = null
  },

  mounted() {
    window.addEventListener('click', this.onClick, { capture: true })
    window.addEventListener('contextmenu', this.onContextMenu, { capture: true })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('blur', this.onBlur)
    window.addEventListener('message', this.onMessage)

    // Send ready message to parent when component mounts
    if (
      typeof window !== 'undefined' &&
      window.parent &&
      window.parent !== window &&
      typeof window.parent.postMessage === 'function'
    ) {
      try {
        window.parent.postMessage(
          {
            source: MESSAGE_SOURCE,
            version: MESSAGE_VERSION,
            type: 'ready'
          },
          '*'
        )
      } catch (err) {
        console.warn('[click-to-component] ready message failed', err)
      }
    }
  },

  beforeDestroy() {
    window.removeEventListener('click', this.onClick, { capture: true })
    window.removeEventListener('contextmenu', this.onContextMenu, { capture: true })
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('blur', this.onBlur)
    window.removeEventListener('message', this.onMessage)
  },

  methods: {
    toggleTargeting() {
      if (this.state === State.HOVER && this.trigger === Trigger.BUTTON) {
        this.state = State.IDLE
        this.trigger = null
      } else {
        this.state = State.HOVER
        this.trigger = Trigger.BUTTON
      }
    },

    /** @param {MessageEvent} event */
    onMessage(event) {
      const data = event && event.data
      if (
        data &&
        data.source === MESSAGE_SOURCE &&
        data.version === MESSAGE_VERSION &&
        data.type === 'enable-button'
      ) {
        this.showButton = true
      }
    },

    /** @param {MouseEvent} event */
    onContextMenu(event) {
      // Only interfere when the tool is active
      if (this.state !== State.IDLE && event.target instanceof HTMLElement) {
        event.preventDefault()

        // Optional: notify the parent for visualization
        postOpenToParent({
          editor: this.editor,
          pathToSource: '',
          url: '',
          trigger: 'context-menu',
          event,
          element: event.target,
          pathModifier: this.pathModifier
        })
      }
    },

    /** @param {MouseEvent} event */
    onClick(event) {
      // Prevent all default actions when targeting is active
      if (this.state === State.HOVER) {
        event.preventDefault()
        event.stopPropagation()
      }

      // Handle targeting mode click (left-click sends message to parent)
      if (this.state === State.HOVER && this.trigger === Trigger.BUTTON && this.target instanceof HTMLElement) {
        // Notify parent window with component info
        postOpenToParent({
          editor: this.editor,
          pathToSource: '', // Will be determined when user selects
          url: '',
          trigger: 'context-menu',
          event,
          element: this.target,
          pathModifier: this.pathModifier,
        })

        this.state = State.IDLE
        this.trigger = null
        return
      }

      // Handle Alt+click mode (use postMessage instead of navigation)
      if (this.state === State.HOVER && this.trigger === Trigger.ALT_KEY && this.target instanceof HTMLElement) {
        const instance = getVueInstancesForElement(this.target).find((vm) =>
          getSourceForInstance(vm)
        )

        if (!instance) {
          return console.warn(
            'Could not find Vue instance for element',
            this.target
          )
        }

        const source = getSourceForInstance(instance)

        if (!source) {
          return console.warn(
            'Could not find source for Vue instance',
            instance
          )
        }
        const path = getPathToSource(source, this.pathModifier)
        const url = getUrl({
          editor: this.editor,
          pathToSource: path,
        })

        event.preventDefault()

        // Use postMessage instead of direct navigation
        postOpenToParent({
          editor: this.editor,
          pathToSource: path,
          url,
          trigger: 'alt-click',
          event,
          element: this.target,
          pathModifier: this.pathModifier
        })

        this.state = State.IDLE
        this.trigger = null
      }
    },

    /** @param {KeyboardEvent} event */
    onKeyDown(event) {
      switch (this.state) {
        case State.IDLE:
          if (event.altKey) {
            this.state = State.HOVER
            this.trigger = Trigger.ALT_KEY
          }
          break

        case State.HOVER:
          if (event.key === 'Escape' && this.trigger === Trigger.BUTTON) {
            this.state = State.IDLE
            this.trigger = null
          }
          break

        default:
      }
    },

    /** @param {KeyboardEvent} event */
    onKeyUp(event) {
      switch (this.state) {
        case State.HOVER:
          if (this.trigger === Trigger.ALT_KEY) {
            this.state = State.IDLE
            this.trigger = null
          }
          break

        default:
      }
    },

    /** @param {MouseEvent} event */
    onMouseMove(event) {
      if (!(event.target instanceof HTMLElement)) {
        return
      }

      switch (this.state) {
        case State.IDLE:
        case State.HOVER:
          this.target = event.target
          this.applyIndicator()
          break

        default:
          break
      }
    },

    onBlur() {
      switch (this.state) {
        case State.HOVER:
          this.state = State.IDLE
          this.trigger = null
          break

        default:
      }
    },

    applyIndicator() {
      for (const element of Array.from(
        document.querySelectorAll('[data-click-to-component-target]')
      )) {
        if (element instanceof HTMLElement) {
          delete element.dataset.clickToComponentTarget
        }
      }

      const target = this.target

      if (this.state === State.IDLE) {
        delete window.document.body.dataset.clickToComponent
        window.document.body.style.removeProperty('--click-to-component-cursor')
        if (target) {
          delete target.dataset.clickToComponentTarget
        }
        return
      }

      if (target instanceof HTMLElement) {
        window.document.body.dataset.clickToComponent = this.state
        target.dataset.clickToComponentTarget = this.state

        // Set cursor to crosshair for targeting
        window.document.body.style.setProperty(
          '--click-to-component-cursor',
          'crosshair'
        )
      }
    },
  },

  /** @param {import('vue').CreateElement} h */
  render(h) {
    const children = [
      h('style', `
        [data-click-to-component] * {
          pointer-events: auto !important;
        }

        [data-click-to-component-target] {
          cursor: var(--click-to-component-cursor, crosshair) !important;
          outline: auto 1px;
          outline: var(
            --click-to-component-outline,
            -webkit-focus-ring-color auto 1px
          ) !important;
        }
      `),
    ]

    if (this.showButton) {
      const active = this.state === State.HOVER && this.trigger === Trigger.BUTTON

      children.push(
        h(
          'button',
          {
            attrs: {
              'aria-pressed': active,
              title: 'Toggle targeting mode',
            },
            style: {
              position: 'fixed',
              bottom: '16px',
              right: '16px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: active ? 'royalblue' : 'white',
              color: active ? 'white' : 'black',
              border: '1px solid #ccc',
              boxShadow: '0 2px 6px rgba(0,0,0,.3)',
              zIndex: 2147483647,
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
            },
            on: {
              click: (/** @type {MouseEvent} */ e) => {
                e.stopPropagation()
                this.toggleTargeting()
              },
            },
          },
          [
            h('img', {
              attrs: {
                src: ICON_DATA_URI,
                alt: 'HK Icon',
              },
              style: {
                width: '32px',
                height: '32px',
                filter: active ? 'brightness(0) invert(1)' : 'none',
              },
            }),
          ]
        )
      )
    }

    // display: contents keeps the wrapper out of the layout
    return h('div', { style: { display: 'contents' } }, children)
  },
}

<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { computed, defineComponent, PropType, reactive, ref } from '@vue/runtime-core'
// eslint-disable-next-line no-unused-vars
import { ResizeHandle } from './SplitPane.vue'

const GUTTER = 10
const SNAP_RANGE = 10

export default defineComponent({
  props: {
    containerSize: {
      type: Object as PropType<{ width: number, height: number }>,
      required: true
    },
    handle: {
      type: Object as PropType<ResizeHandle>,
      required: true
    },
    onStartMove: {
      type: Function as PropType<(key: number[], value: number) => void>
    },
    onMove: {
      type: Function as PropType<(key: number[], value: number) => void>
    },
    onMoved: {
      type: Function as PropType<(key: number[], value: number) => void>
    },
    snapLines: {
      type: Object as PropType<{ vertical: number[], horizontal: number[] }>
    }
  },
  emits: ['moved'],
  setup(props) {
    const state = ref<'moving' | 'stopped'>('stopped')
    const hasMouse = ref(false)
    const id = ref<number>(-1)

    const pointerStart = reactive({
      x: 0,
      y: 0
    })

    const pointerEnd = reactive({
      x: 0,
      y: 0
    })

    const snapables = computed(() => {
      if (state.value === 'stopped') {
        return []
      }

      if (props.snapLines == null) {
        return []
      }

      if (props.handle.type === 'horizontal') {
        const hori = props.handle
        return props.snapLines.horizontal.filter(it => {
          return it > hori.leftMin && it < hori.leftMax
        })
      } else {
        const vert = props.handle
        return props.snapLines.horizontal.filter(it => {
          return it > vert.topMin && it < vert.topMax
        })
      }
    })

    const computePercentage = () => {
      const holder = props.handle.holder
      const holderSize = {
        width: props.containerSize.width * (holder.right - holder.left),
        height: props.containerSize.height * (holder.bottom - holder.top),
      }
      const localePercent = {
        left: (props.handle.left - holder.left) / (holder.right - holder.left),
        top: (props.handle.top - holder.top) / (holder.bottom - holder.top),
      }
      return props.handle.type === 'horizontal'
        ? relativePosition.value.x / holderSize.width + localePercent.left
        : relativePosition.value.y / holderSize.height + localePercent.top
    }

    const onElementStart = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hasMouse.value = true

      if (state.value === 'moving') return
      state.value = 'moving'
      id.value = event.pointerId

      pointerStart.x = pointerEnd.x = event.x
      pointerStart.y = pointerEnd.y = event.y

      props.onStartMove?.(
        props.handle.key,
        computePercentage()
      )
    }

    const onElementMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hasMouse.value = true

      if (state.value === 'stopped') return
      if (id.value !== event.pointerId) return

      pointerEnd.x = event.x
      pointerEnd.y = event.y

      props.onMove?.(
        props.handle.key,
        computePercentage()
      )
    }

    const onElementEnd = (event: PointerEvent) => {
      hasMouse.value = false

      if (state.value === 'stopped') return
      if (id.value !== event.pointerId) return

      pointerEnd.x = event.x
      pointerEnd.y = event.y

      props.onMoved?.(
        props.handle.key,
        computePercentage()
      )

      state.value = 'stopped'
    }

    const clamp = (v: number, min: number, max: number) => {
      return Math.min(Math.max(v, min), max)
    }

    const trySnapping = (val: number) => {
      let recommend: number | undefined

      if (props.handle.type === 'horizontal') {
        const pos = val / props.containerSize.width + props.handle.left
        recommend = snapables.value
          .sort((x, y) => Math.abs(pos - x) - Math.abs(pos - y))
          .find(it => Math.abs(it - pos) * props.containerSize.width < SNAP_RANGE)
        if (recommend != null) {
          recommend = (recommend - props.handle.left) * props.containerSize.width
        }
      } else {
        const pos = val / props.containerSize.height + props.handle.top
        recommend = snapables.value
          .sort((x, y) => Math.abs(pos - x) - Math.abs(pos - y))
          .find(it => Math.abs(it - pos) * props.containerSize.height < SNAP_RANGE)
        if (recommend != null) {
          recommend = (recommend - props.handle.top) * props.containerSize.height
        }
      }
      return recommend ?? val
    }

    const relativePosition = computed(() => {
      if (state.value !== 'moving') return {
        x: 0,
        y: 0
      }
      if (props.handle.type === 'horizontal') {
        return {
          x: trySnapping(clamp(
            pointerEnd.x - pointerStart.x,
            (props.handle.leftMin - props.handle.left) * props.containerSize.width + GUTTER,
            (props.handle.leftMax - props.handle.left) * props.containerSize.width - GUTTER
          )),
          y: 0
        }
      } else {
        return {
          x: 0,
          y: trySnapping(clamp(
            pointerEnd.y - pointerStart.y,
            (props.handle.topMin - props.handle.top) * props.containerSize.height + GUTTER,
            (props.handle.topMax - props.handle.top) * props.containerSize.height - GUTTER
          ))
        }
      }
    })

    return {
      hasMouse,
      state,
      onElementStart,
      onElementMove,
      onElementEnd,
      relativePosition
    }
  },
  render() {
    const formatPercentage = (v: number) => {
      return String(v * 100) + '%'
    }

    if (this.handle.type === 'horizontal') {
      return <div
        class={['resize-horizontal', this.state, this.hasMouse ? 'has-mouse' : '']}
        onPointerdown={this.onElementStart}
        onPointermove={this.onElementMove}
        onPointerup={this.onElementEnd}
        style={{
          top: formatPercentage(this.handle.top),
          left: formatPercentage(this.handle.left),
          bottom: formatPercentage(1 - this.handle.bottom),
          transform: `translateX(calc(-50% + ${this.relativePosition.x}px))`
        }}
      />
    } else {
      return <div
        class={['resize-vertical', this.state, this.hasMouse ? 'has-mouse' : '']}
        onPointerdown={this.onElementStart}
        onPointermove={this.onElementMove}
        onPointerup={this.onElementEnd}
        style={{
          top: formatPercentage(this.handle.top),
          left: formatPercentage(this.handle.left),
          right: formatPercentage(1 - this.handle.right),
          transform: `translateY(calc(-50% + ${this.relativePosition.y}px))`
        }}
      />
    }
  }
})
</script>

<style>
.resize-horizontal,
.resize-vertical {
  position: absolute;
  background: #888;
  opacity: 0;
  transition: opacity 0.5s;
  touch-action: none;
}
.resize-horizontal.moving,
.resize-vertical.moving {
  z-index: 2;
  opacity: 0 !important;
}
.resize-horizontal.moving::after,
.resize-vertical.moving::after {
  position: absolute;
  content: "";
  display: block;
  left: -1000px;
  right: -1000px;
  top: -1000px;
  bottom: -1000px;
}

.resize-horizontal {
  width: 10px;
  transform: translateX(-50%);
  border-left: 1px solid #555;
  border-right: 1px solid #555;
  cursor: ew-resize;
}

.resize-vertical {
  height: 10px;
  transform: translateY(-50%);
  border-top: 1px solid #555;
  border-bottom: 1px solid #555;
  cursor: ns-resize;
}

.resize-horizontal.has-mouse:hover,
.resize-vertical.has-mouse:hover {
  opacity: 1;
}
</style>
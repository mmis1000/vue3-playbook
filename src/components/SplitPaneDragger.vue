<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { computed, defineComponent, PropType, reactive, ref } from '@vue/runtime-core'
// eslint-disable-next-line no-unused-vars
import { ResizeHandle } from './SplitPane.vue'

const GUTTER = 10

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
  },
  emits: ['moved'],
  setup (props) {
    const state = ref<'moving' | 'stopped'>('stopped')
    const id = ref<number>(-1)

    const pointerStart = reactive({
      x: 0,
      y: 0
    })

    const pointerEnd = reactive({
      x: 0,
      y: 0
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

    const relativePosition = computed(() => {
      if (state.value !== 'moving') return {
        x: 0,
        y: 0
      }
      if (props.handle.type === 'horizontal') {
        return {
          x: clamp(
            pointerEnd.x - pointerStart.x,
            (props.handle.leftMin - props.handle.left) * props.containerSize.width + GUTTER,
            (props.handle.leftMax - props.handle.left) * props.containerSize.width - GUTTER
          ),
          y: 0
        }
      } else {
        return {
          x: 0,
          y: clamp(
            pointerEnd.y - pointerStart.y,
            (props.handle.topMin - props.handle.top) * props.containerSize.height + GUTTER,
            (props.handle.topMax - props.handle.top) * props.containerSize.height - GUTTER
          )
        }
      }
    })

    return {
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
        class={['resize-horizontal', this.state]}
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
        class={['resize-vertical', this.state]}
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
.resize-horizontal, .resize-vertical {
  position: absolute;
  background: #888;
  opacity: 0;
  transition: opacity .5s;
}
.resize-horizontal.moving, .resize-vertical.moving {
  z-index: 2;
  opacity: 0 !important;
}
.resize-horizontal.moving::after, .resize-vertical.moving::after {
  position: absolute;
  content: '';
  display: block;
  left: -100px;
  right: -100px;
  top: -100px;
  bottom: -100px;
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

.resize-horizontal:hover, .resize-vertical:hover {
  opacity: 1;
}
</style>
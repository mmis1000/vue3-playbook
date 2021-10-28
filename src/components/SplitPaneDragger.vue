<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { computed, defineComponent, inject, PropType, reactive, Ref, ref } from '@vue/runtime-core'
// eslint-disable-next-line no-unused-vars
import { containerSizeKey, ResizeHandle } from './SplitPane.vue'

export default defineComponent({
  props: {
    handle: {
      type: Object as PropType<ResizeHandle>,
      required: true
    },
    onMoved: {
      type: Function as PropType<(key: number[], value: number) => void>
    }
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

    const onStart = (event: PointerEvent) => {
      if (state.value === 'moving') return
      state.value = 'moving'
      id.value = event.pointerId
      pointerStart.x = pointerEnd.x = event.x
      pointerStart.y = pointerEnd.y = event.y
    }

    const onMove = (event: PointerEvent) => {
      if (state.value === 'stopped') return
      if (id.value !== event.pointerId) return
      pointerEnd.x = event.x
      pointerEnd.y = event.y
    }

    const onEnd = (event: PointerEvent) => {
      if (state.value === 'stopped') return
      if (id.value !== event.pointerId) return

      const holder = props.handle.holder
      const holderSize = {
        width: containerSize.width * (holder.right - holder.left),
        height: containerSize.height * (holder.bottom - holder.top),
      }
      const localePercent = {
        left: (props.handle.left - holder.left) / (holder.right - holder.left),
        top: (props.handle.top - holder.top) / (holder.bottom - holder.top),
      }
      console.log(JSON.parse(JSON.stringify([props.handle, relativePosition.value, holderSize, containerSize, holder])))
      props.onMoved?.(
        props.handle.key,
        props.handle.type === 'horizontal'
          ? relativePosition.value.x / holderSize.width + localePercent.left
          : relativePosition.value.y / holderSize.height + localePercent.top
      )
      state.value = 'stopped'
      pointerEnd.x = event.x
      pointerEnd.y = event.y
    }

    const clamp = (v: number, min: number, max: number) => {
      return Math.min(Math.max(v, min), max)
    }

    const containerSize = inject(containerSizeKey)!

    const relativePosition = computed(() => {
      if (state.value !== 'moving') return {
        x: 0,
        y: 0
      }
      if (props.handle.type === 'horizontal') {
        return {
          x: clamp(
            pointerEnd.x - pointerStart.x,
            (props.handle.leftMin - props.handle.left) * containerSize.width,
            (props.handle.leftMax - props.handle.left) * containerSize.width
          ),
          y: 0
        }
      } else {
        return {
          x: 0,
          y: clamp(
            pointerEnd.y - pointerStart.y,
            (props.handle.topMin - props.handle.top) * containerSize.height,
            (props.handle.topMax - props.handle.top) * containerSize.height
          )
        }
      }
    })

    return {
      state,
      onStart,
      onMove,
      onEnd,
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
        onPointerdown={this.onStart}
        onPointermove={this.onMove}
        onPointerup={this.onEnd}
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
        onPointerdown={this.onStart}
        onPointermove={this.onMove}
        onPointerup={this.onEnd}
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
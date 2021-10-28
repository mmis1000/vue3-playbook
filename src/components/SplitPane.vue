<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { defineComponent, reactive, computed, ref, onMounted, provide, InjectionKey } from "vue"
// eslint-disable-next-line no-unused-vars
import type { PropType } from "vue"
import SplitPaneDragger from "./SplitPaneDragger.vue"
import SplitPanePhantom from "./SplitPanePhantom.vue"

interface AbstractZone {
  type: 'horizontal' | 'vertical' | 'content'
}

export interface HorizontalPane extends AbstractZone {
  type: 'horizontal'
  zones: (Content | VerticalPane)[]
}

export interface VerticalPane extends AbstractZone {
  type: 'vertical'
  zones: (Content | HorizontalPane)[]
}

export interface Content extends AbstractZone {
  type: 'content'
  name: string
}

export type AnyZone = HorizontalPane | VerticalPane | Content

type SplitName = string

type Split = number[]
type Splits = Record<SplitName, Split>

interface Border {
  left: number
  right: number
  top: number
  bottom: number
}

export interface Zone extends Border {
  name: string
}

interface AbstractResizeHandle {
  type: 'horizontal' | 'vertical'
  key: number[]
  holder: Border
}

export interface ResizeHandleHorizontal extends AbstractResizeHandle {
  type: 'horizontal'
  top: number
  bottom: number
  left: number
  leftMin: number
  leftMax: number
}

export interface ResizeHandleVertical extends AbstractResizeHandle {
  type: 'vertical'
  top: number
  left: number
  right: number
  topMin: number
  topMax: number
}

export type ResizeHandle = ResizeHandleHorizontal | ResizeHandleVertical

type SplitContainer = {
  splits: Splits
  getOrCreateSplit: (path: number[], count: number) => number[]
}

export const containerSizeKey = Symbol('containerSizeKey') as InjectionKey<{ width: number, height: number }>

export default defineComponent({
  props: {
    zones: {
      type: Object as PropType<AnyZone>,
      required: true
    },
    defaultSplit: {
      type: Object as PropType<Splits>
    }
  },
  setup(props) {
    const getBorder = (
      current: Border,
      split: Split,
      direction: 'horizontal' | 'vertical',
      index: number
    ): Border => {
      if (direction === 'horizontal') {
        const top = current.top
        const bottom = current.bottom
        const percentLeft = index === 0 ? 0 : split[index - 1]
        const percentRight = index === split.length ? 1 : split[index]
        const newLeft = current.left + (current.right - current.left) * percentLeft
        const newRight = current.left + (current.right - current.left) * percentRight
        return {
          top,
          bottom,
          left: newLeft,
          right: newRight
        }
      } else if (direction === 'vertical') {
        const left = current.left
        const right = current.right
        const percentTop = index === 0 ? 0 : split[index - 1]
        const percentBottom = index === split.length ? 1 : split[index]
        const newTop = current.top + (current.bottom - current.top) * percentTop
        const newBottom = current.top + (current.bottom - current.top) * percentBottom
        return {
          top: newTop,
          bottom: newBottom,
          left,
          right
        }
      } else {
        throw 'how?'
      }
    }

    const createSplit = (initialValue?: Splits | undefined): SplitContainer => {
      const getContainer = (): SplitContainer => container
      const container = reactive<SplitContainer>({
        splits: 
          initialValue
            ? JSON.parse(JSON.stringify(initialValue))
            : {},
        getOrCreateSplit (path: number[], count: number) {
          const pathStr = path.join(',')

          if (getContainer().splits[pathStr]) {
            return getContainer().splits[pathStr]
          } else {
            const newSplit: Split = reactive([])
            for (let i = 1; i < count; i++) {
              newSplit.push(i / count)
            }
            getContainer().splits[pathStr] = newSplit
            return newSplit
          }
        }
      })

      return container
    }

    const splitData = createSplit(props.defaultSplit)

    const rootBorder: Border = {
      left: 0,
      right: 1,
      top: 0,
      bottom: 1
    }

    const getZones = (
      zone: AnyZone,
      zonePath: number[],
      parentBorder: Border,
      splitContainer: SplitContainer
    ): { zones: Zone[], borderMap: Record<string, Border> } => {
      const zones: Zone[] = []
      const borderMap: Record<string, Border> = {}

      borderMap[zonePath.join(',')] = parentBorder

      switch (zone.type) {
        case 'horizontal':
        case 'vertical': {
          const split = splitContainer.getOrCreateSplit(zonePath, zone.zones.length)
          for (let [k, childZone] of zone.zones.entries()) {
            const childBorder = getBorder(parentBorder, split, zone.type, k)
            const childInfo = getZones(childZone, [...zonePath, k], childBorder, splitContainer)
            zones.push(...childInfo.zones)
            Object.assign(borderMap, childInfo.borderMap)
          }
        }
          break
        case 'content':
          zones.push({
            name: zone.name,
            ...parentBorder
          })
          break
      }

      return {
        zones,
        borderMap
      }
    }

    const zones = computed(() => {
      return getZones(props.zones, [], rootBorder, splitData)
    })

    const getResizeHandles = (
      zone: AnyZone,
      zonePath: number[],
    ): ResizeHandle[] => {
      const resizeHandle: ResizeHandle[] = []

      switch (zone.type) {
        case 'horizontal':
        case 'vertical': {
          const info = zones.value.borderMap[zonePath.join(',')]
          const childBorders = zone.zones.map((z, i) => zones.value.borderMap[[...zonePath, i].join(',')])

          for (let k = 0; k < zone.zones.length - 1; k++) {
            const min = childBorders[k]
            const max = childBorders[k + 1]
            if (zone.type === 'horizontal') {
              resizeHandle.push({
                key: [...zonePath, k],
                type: 'horizontal',
                top: info.top,
                bottom: info.bottom,
                left: min.right,
                leftMin: min.left,
                leftMax: max.right,
                holder: info
              })
            } else {
              resizeHandle.push({
                key: [...zonePath, k],
                type: 'vertical',
                left: info.left,
                right: info.right,
                top: min.bottom,
                topMin: min.top,
                topMax: max.bottom,
                holder: info
              })
            }
          }

          for (const [k, childZone] of zone.zones.entries()) {
            if (childZone.type !== 'content') {
              const handles = getResizeHandles(childZone, [...zonePath, k])
              resizeHandle.push(...handles)
            }
          }
        }
          break
        case 'content':
          break
      }

      return resizeHandle
    }

    const resizeHandles = computed(() => {
      return getResizeHandles(props.zones, [])
    })

    const rootElement = ref<HTMLDivElement>()

    const containerSize = reactive({ 
      width: 0,
      height: 0
    })

    provide(containerSizeKey, containerSize)

    onMounted(() => {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          containerSize.width = entry.contentRect.width
          containerSize.height = entry.contentRect.height
        }
      })
      resizeObserver.observe(rootElement.value!)
    })

    const phantomSplitData = createSplit()
    const phantomZones = computed(() => {
      return getZones(props.zones, [], rootBorder, phantomSplitData)
    })

    const moving = ref(false)

    const onStartMove = (key: number[], value: number) => {
      const row = key.slice(0, key.length - 1).join(',')
      const index = key[key.length - 1]
      phantomSplitData.splits = JSON.parse(JSON.stringify(splitData.splits))
      console.log(phantomSplitData.splits, splitData.splits)
      phantomSplitData.splits[row][index] = value
      moving.value = true
    }
    const onMove = (key: number[], value: number) => {
      const row = key.slice(0, key.length - 1).join(',')
      const index = key[key.length - 1]
      phantomSplitData.splits[row][index] = value
    }
    const onMoved = (key: number[], value: number) => {
      const row = key.slice(0, key.length - 1).join(',')
      const index = key[key.length - 1]
      console.log(row, index, value)
      phantomSplitData.splits[row][index] = value
      splitData.splits[row][index] = value
      moving.value = false
    }
    
    return {
      onStartMove,
      onMove,
      onMoved,
      rootElement,
      moving,
      phantomZones,
      mappedZones: zones,
      resizeHandles
    }
  },
  render() {
    const children: JSX.Element[] = []

    const formatPercentage = (v: number) => {
      return String(v * 100) + '%'
    }

    const zones: JSX.Element[] = []
    for (const zone of this.mappedZones.zones) {
      zones.push(
        <div
          key={zone.name}
          class='zone'
          style={{
            top: formatPercentage(zone.top),
            left: formatPercentage(zone.left),
            bottom: formatPercentage(1 - zone.bottom),
            right: formatPercentage(1 - zone.right),
          }}
        >
          {
            this.$slots[zone.name] ? this.$slots[zone.name]!() : undefined
          }
        </div>
      )
    }

    children.push(<div>
      {zones}
    </div>)

    children.push(<SplitPanePhantom style={{ display: this.moving ? 'block' : 'none' }} zones={this.phantomZones.zones} />)

    for (const handle of [...this.resizeHandles].reverse()) {
      children.push(<SplitPaneDragger
        onStartMove={this.onStartMove}
        onMove={this.onMove}
        onMoved={this.onMoved}
        key={handle.key.join(',')}
        handle={handle}
      />)
    }

    return (<div class="zone-wrapper" ref="rootElement">
      {children}
    </div>)
  }
})
</script>

<style scoped>
.zone-wrapper {
  position: relative;
  overflow: hidden;
}

.zone {
  position: absolute;
  border: 1px solid grey;
  /* border-radius: 5px; */
  transition-property: top left bottom right;
  transition-duration: 0.5s;
  padding: 5px;
  overflow: hidden;
}
</style>
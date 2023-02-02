<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { defineComponent, reactive, computed, ref, onMounted, VNode, Comment } from "vue"
// eslint-disable-next-line no-unused-vars
import type { PropType } from "vue"
import SplitPaneDragger from "./SplitPaneDragger.vue"
import SplitPanePhantom from "./SplitPanePhantom.vue"
import SplitPaneLayoutContentVue from "./SplitPaneLayoutContent.vue"
import SplitPaneLayoutHoriVue from "./SplitPaneLayoutHori.vue"
import SplitPaneLayoutVertVue from "./SplitPaneLayoutVert.vue"

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

export default defineComponent({
  props: {
    zones: {
      type: Object as PropType<AnyZone>
    },
    defaultSplit: {
      type: Object as PropType<Splits>
    }
  },
  setup(props, ctx) {
    const filterComment = (vNode: VNode) => {
      return vNode.type != Comment
    }
    const map = (vNode: VNode): AnyZone => {
      switch (vNode.type) {
        case SplitPaneLayoutContentVue:
          return {
            type: 'content',
            name: vNode.props?.name as string
          }
        case SplitPaneLayoutVertVue: 
        case SplitPaneLayoutHoriVue: {
          const children: VNode[] = Array.isArray(vNode.children)
            ? vNode.children
            : (vNode.children as any).default()
          return {
            type: vNode.type === SplitPaneLayoutHoriVue ? 'horizontal' : 'vertical',
            zones: children.filter(filterComment).map(map) as any
          }
        }
        default:
          console.error(vNode.type)
          throw new Error(`unknown type ${String(vNode.type)}`)
      }
    }

    const layout = computed<AnyZone>(() => {
      if (props.zones) {
        return props.zones
      }
      const layoutVNode = ctx.slots.layout!().filter(filterComment)[0]
      const layout = map(layoutVNode)
      return layout
    })

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
            const splits = getContainer().splits[pathStr]
            // validate split
            if (splits.length !== count - 1) {
              console.warn(`invalid split ${splits.join(',')} for path ${path.join(',')}`)

              const newSplit = [...splits]
              newSplit.length = count - 1

              for (let i = 0; i < count - 1; i++) {
                newSplit[i] = newSplit[i] ?? 1
              }

              getContainer().splits[pathStr] = newSplit
            }
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
      return getZones(layout.value, [], rootBorder, splitData)
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
      return getResizeHandles(layout.value, [])
    })

    const rootElement = ref<HTMLDivElement>()

    const containerSize = reactive({ 
      width: 0,
      height: 0
    })

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
      return getZones(layout.value, [], rootBorder, phantomSplitData)
    })

    const moving = ref(false)

    const onStartMove = (key: number[], value: number) => {
      const row = key.slice(0, key.length - 1).join(',')
      const index = key[key.length - 1]
      phantomSplitData.splits = JSON.parse(JSON.stringify(splitData.splits))
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
      phantomSplitData.splits[row][index] = value
      splitData.splits[row][index] = value
      moving.value = false
    }
    const snapLines = computed(() => {
      const lines = {
        vertical: [] as number[],
        horizontal: [] as number []
      }
      for (let item of resizeHandles.value) {
        if (item.type === 'horizontal') {
          lines.vertical.push(item.left)
        } else {
          lines.horizontal.push(item.top)
        }
      }
      return lines
    })
    
    return {
      onStartMove,
      onMove,
      onMoved,
      containerSize,
      rootElement,
      moving,
      snapLines,
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

    const computeTransform = (dimension: { width: number, height: number }, oldZone: Border, newZone: Border) => {
      const oldCenter = {
        x: (oldZone.left + oldZone.right) / 2 * dimension.width,
        y: (oldZone.top + oldZone.bottom) / 2 * dimension.height
      }

      const newCenter = {
        x: (newZone.left + newZone.right) / 2 * dimension.width,
        y: (newZone.top + newZone.bottom) / 2 * dimension.height
      }

      const scale = {
        x: (newZone.right - newZone.left) / (oldZone.right - oldZone.left),
        y: (newZone.bottom - newZone.top) / (oldZone.bottom - oldZone.top)
      }

      return `translate(${newCenter.x - oldCenter.x}px, ${newCenter.y - oldCenter.y}px) scale(${scale.x}, ${scale.y})`
    }

    const zones: JSX.Element[] = []
    const zoneBorders: JSX.Element[] = []
    for (const zone of this.mappedZones.zones) {
      let transform
      const phantomZone = this.moving ? this.phantomZones.zones.find(it => it.name === zone.name)! : null
      if (phantomZone) {
        transform = computeTransform(this.containerSize, zone, phantomZone)
      } else {
        transform = 'none'
      }
      zoneBorders.push(
        <div
          class='zone-border'
          style={{
            top: formatPercentage((phantomZone ?? zone).top),
            left: formatPercentage((phantomZone ?? zone).left),
            bottom: formatPercentage(1 - (phantomZone ?? zone).bottom),
            right: formatPercentage(1 - (phantomZone ?? zone).right)
          }}
        />
      )
      zones.push(
        <div
          key={zone.name}
          class='zone-item-wrapper'
          style={{
            top: formatPercentage(zone.top),
            left: formatPercentage(zone.left),
            bottom: formatPercentage(1 - zone.bottom),
            right: formatPercentage(1 - zone.right),
            transform
          }}
        >
          <div class="zone">
            {
              this.$slots[zone.name] ? this.$slots[zone.name]!() : undefined
            }
          </div>
        </div>
      )
    }
    children.push(<div>
      {zoneBorders}
    </div>)

    children.push(<div style={{ opacity: this.moving ? '0.5' : '1' }} >
      {zones}
    </div>)

    children.push(<SplitPanePhantom style={{ visibility: this.moving ? 'visible' : 'hidden' }} zones={this.phantomZones.zones} />)

    for (const handle of [...this.resizeHandles].reverse()) {
      children.push(<SplitPaneDragger
        containerSize={this.containerSize}
        onStartMove={this.onStartMove}
        onMove={this.onMove}
        onMoved={this.onMoved}
        key={handle.key.join(',')}
        handle={handle}
        snapLines={this.snapLines}
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
.zone-border {
  position: absolute;
  /* border-radius: 5px; */
  border: 1px solid grey;
}
.zone-item-wrapper {
  position: absolute;
  /* border: 1px solid grey; */
  /* transition-property: top left bottom right;
  transition-duration: 0.5s; */
  /* padding: 5px; */
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  /* overflow-y: auto; */
}
.zone {
  flex-grow: 1;
  width: 0;
  margin: 5px;
}
</style>
<template>
  <div class="parallax-container" ref="parallaxContainer" @scroll.passive="handleScroll">
    <div class="parallax-container-root" ref="parallaxContainerRoot" />
    <ParallaxSticky
      :parent-context="parentContext"
      :child-contexts="childContexts"
    />
    <slot/>
  </div>
</template>
<script lang="tsx">
import ParallaxSticky from './ParallaxSticky.vue'
import { defineComponent, provide, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
// eslint-disable-next-line no-unused-vars
import type { VNode, InjectionKey } from 'vue'
export type VNodeLike = VNode | JSX.Element
export type TemplateFn = (data: { height: number, scroll: number }) => VNodeLike[]
export type ChildContext = {
  /** child container */
  element: HTMLElement

  parentContainerHeight: number

  top: number
  left: number
  height: number
  width: number

  template: TemplateFn
}
export type ParentContext = {
  height: number
  width: number
  scroll: number
}
export type TemplateRegisterFn = (fn: ChildContext) => (() => void)
export const templateRegisterKey = Symbol('Key') as InjectionKey<TemplateRegisterFn>
export default defineComponent({
  components: {
    ParallaxSticky
  },
  setup () {
    const childContexts: ChildContext[] = reactive([])
    
    const childResizeObserver = new ResizeObserver((entrys) => {
      const parentRect = parallaxContainer.value.getBoundingClientRect()
      const parentScroll = parallaxContainer.value.scrollTop

      for (const e of entrys) {
        for (const ctx of childContexts) {
          if (e.target === ctx.element) {
            const childRect = ctx.element.getBoundingClientRect()

            ctx.top = childRect.y - parentRect.y + parentScroll
            ctx.left = childRect.x - parentRect.x
            ctx.height = childRect.height
            ctx.width = childRect.width
          }
        }
      }
    })

    provide(templateRegisterKey, (ctx) => {
      childContexts.push(ctx)

      const parentRect = parallaxContainer.value.getBoundingClientRect()
      const parentScroll = parallaxContainer.value.scrollTop
      const childRect = ctx.element.getBoundingClientRect()

      ctx.parentContainerHeight = parallaxContainer.value.clientHeight

      ctx.top = childRect.y - parentRect.y + parentScroll
      ctx.left = childRect.x - parentRect.x
      ctx.height = childRect.height
      ctx.width = childRect.width

      childResizeObserver.observe(ctx.element)

      return () => {
        if (childContexts.indexOf(ctx) >= 0) {
          childContexts.splice(childContexts.indexOf(ctx), 1)
          childResizeObserver.unobserve(ctx.element)
        }
      }
    })

    const parallaxContainer = ref(null! as HTMLDivElement)
    const parallaxContainerRoot = ref(null! as HTMLDivElement)

    const parentContext: ParentContext = reactive({
      width: 0,
      height: 0,
      scroll: 0
    })

    // const width = ref(0)
    // const height = ref(0)
    // const scroll = ref(0)

    const getRealScroll = () => {
      const outRect = parallaxContainer.value.getBoundingClientRect()
      const rootRect = parallaxContainerRoot.value.getBoundingClientRect()
      return -(rootRect.y - outRect.y)
    }

    let watcher: null | (() => void) = null

    const watchScroll = () => {
      let id: ReturnType<typeof requestAnimationFrame> = 0

      const tick: () => void = function tick () {
        'use strict'
        const real = getRealScroll()

        if (real != parentContext.scroll) {
          parentContext.scroll = real;
        }

        id = requestAnimationFrame(tick)
      }

      id = requestAnimationFrame(tick)

      return () => cancelAnimationFrame(id)
    }

    let stopTimer: ReturnType<typeof setTimeout> = 0

    const handleScroll = () => {
      const updateTimer = () => {
        clearTimeout(stopTimer)
        stopTimer = setTimeout(() => {
          if (watcher) {
            watcher()
            watcher = null
          }
        }, 500)
      }

      if (watcher) {
        updateTimer()
      } else {
        parentContext.scroll = getRealScroll()
        watcher = watchScroll()
        updateTimer()
      }
    }

    const observer = new ResizeObserver((entrys) => {
      for (const e of entrys) {
        parentContext.height = e.contentRect.height
        parentContext.width = e.contentRect.width
        for (const ctx of childContexts) {
          ctx.parentContainerHeight = e.contentRect.height
        }
      }
    })
  
    onMounted(() => {
      parentContext.height = parallaxContainer.value.clientHeight
      parentContext.width = parallaxContainer.value.clientWidth
      parentContext.scroll = parallaxContainer.value.scrollTop
      observer.observe(parallaxContainer.value)
    })

    onBeforeUnmount(() => {
      observer.unobserve(parallaxContainer.value)
      observer.disconnect()
    })

    return {
      parallaxContainer,
      parallaxContainerRoot,
      childContexts,
      parentContext,
      handleScroll
    }
  },
})
</script>
<style scoped>
.parallax-container {
  overflow-x: hidden;
  overflow-y: auto;
  will-change: scroll-position;
  position: relative;
}
.parallax-container-root {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
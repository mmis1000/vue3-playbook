<template>
  <div
    ref="parallaxChildArea"
    class="parallax-child-area"
    :style="{
      '--container-height': context.parentContainerHeight + 'px',
      '--height': context.height + 'px',
      '--width': context.width + 'px',
      '--left': context.left + 'px',
      '--top': context.top + 'px'
    }"
  />
</template>
<script lang="tsx">
import { defineComponent, inject, markRaw, ref, onMounted, onBeforeUnmount } from 'vue'
import { templateRegisterKey } from './Parallax.vue'
// eslint-disable-next-line no-unused-vars
import type { ChildContext } from "./Parallax.vue"
export default defineComponent({
  setup (props, { slots }) {
    const parallaxChildArea = ref(null! as HTMLDivElement)
    const register = inject(templateRegisterKey) || function () { return () => {} }
    const effects: (() => void)[] = markRaw([])

    const context: ChildContext = {
      element: null!,
      parentContainerHeight: 0,

      top: 0,
      left: 0,
      height: 0,
      width: 0,

      template: slots.default!
    }

    onMounted(() => {
      context.element = parallaxChildArea.value
      effects.push(register(context))
    })

    onBeforeUnmount(() => {
      effects.forEach(e => e())
      effects.length = 0
    })

    return {
      parallaxChildArea,
      register,
      effects,
      context
    }
  }
})
</script>
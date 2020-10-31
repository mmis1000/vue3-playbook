<script lang="tsx">
import { defineComponent } from "vue"
// eslint-disable-next-line no-unused-vars
import type { PropType, VNode } from "vue"
// eslint-disable-next-line no-unused-vars
import type { ChildContext, ParentContext } from "./Parallax.vue"

const PRELOAD_RANGE = 50

export default defineComponent({
  props: {
    childContexts: {
      type: Array as PropType<ChildContext[]>,
      required: true
    },
    parentContext: {
      type: Object as PropType<ParentContext>,
      required: true
    }
  },
  setup () {
    let currentId = 0;
    const getNewId = () => currentId++;
    const ids = new WeakMap<object, number>()
    const getId = (arg: object) => {
      if (ids.has(arg)) {
        return ids.get(arg)!
      } else {
        const id = getNewId()
        ids.set(arg, id)
        return id
      }
    }

    return {
      getId
    }
  },
  render () {
    const result: (VNode|JSX.Element)[] = []

    for (const ctx of this.childContexts) {
      const needShow =
        ctx.top + ctx.height + PRELOAD_RANGE > this.parentContext.scroll &&
        ctx.top < this.parentContext.scroll + ctx.parentContainerHeight + PRELOAD_RANGE

      if (needShow) {
        const id = this.getId(ctx)
        const res = ctx.template({ height: this.parentContext.height, scroll: this.parentContext.scroll })
        result.push(
          <div
            class="parallax-sticky-container"
            style={{
              transform: `translateY(${ctx.top - this.parentContext.scroll}px) translateX(${ctx.left}px)`,
              height: `${ctx.height}px`,
              width: `${ctx.width}px`
            }}
            key={ 'container-' + id }
          >
            <div
              class="parallax-sticky-cropper"
              style={{
                transform: `translateY(${this.parentContext.scroll - ctx.top}px) translateX(${-ctx.left}px)`,
                width: `${this.parentContext.width}px`
              }}
            >
              { res }
            </div>
          </div>
        )
      }
    }
    return (
      <div
        class="parallax-sticky-anchor"
        key="anchor"
      >
        { result }
      </div>
    )
  }
})

</script>
<style scoped>
::v-slotted(.parallax-sticky-anchor) {
  position: -webkit-sticky;
  position: sticky;
  height: 0;
  top: 0;
  z-index: 2;
  contain: size layout;
}
::v-slotted(.parallax-sticky-container) {
  position: absolute;
  top: 0;
  left: 0;

  overflow: hidden;
  will-change: transform;
  contain: strict;
}
::v-slotted(.parallax-sticky-cropper) {
  will-change: transform;
}
</style>
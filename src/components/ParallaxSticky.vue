<script lang="tsx">
import { defineComponent } from "vue"
// eslint-disable-next-line no-unused-vars
import type { PropType, VNode } from "vue"
// eslint-disable-next-line no-unused-vars
import type { ChildContext } from "./Parallax.vue"
export default defineComponent({
  props: {
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    scroll: {
      type: Number,
      required: true
    },
    childContexts: {
      type: Array as PropType<ChildContext[]>,
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
        ctx.top + ctx.height > this.scroll &&
        ctx.top < this.scroll + ctx.parentContainerHeight

      if (needShow) {
        const id = this.getId(ctx)
        const res = ctx.template({ height: this.height, scroll: this.scroll })
        result.push(
          <div
            class="parallax-sticky-anchor"
            key={ 'container-' + id }
          >
            <div
              class="parallax-sticky-container"
              style={{
                transform: `translateY(${ctx.top - this.scroll}px) translateX(${ctx.left}px)`,
                height: `${ctx.height}px`,
                width: `${ctx.width}px`
              }}
            >
              <div
                class="parallax-sticky-cropper"
                style={{
                  transform: `translateY(${this.scroll - ctx.top}px) translateX(${-ctx.left}px)`,
                  width: `${this.width}px`
                }}
              >
                { res }
              </div>
            </div>
          </div>
        )
      }
    }
    return result
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
}
::v-slotted(.parallax-sticky-container) {
  overflow: hidden;
  will-change: transform;
}
::v-slotted(.parallax-sticky-cropper) {
  will-change: transform;
}
</style>
<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { defineComponent, PropType, ref, toRaw, watch } from "vue"
import { useModifiableProps } from '../hooks/useModifiableProps'
const defaultForm = () => ({
  a: '1',
  b: '2',
  c: {
    d: '3',
    e: {
      f: '5'
    }
  }
})

type FormType = ReturnType<typeof defaultForm>

const log: <T>(message: string, arg: T) => T = (message, arg) => {
  console.log(message)
  return arg
}

const Nested = defineComponent({
  emits: ['update:data'],
  props: {
    data: {
      type: Object as PropType<FormType['c']>,
      required: true
    }
  },
  setup(props, { emit }) {
    const propsModel = useModifiableProps(props, emit)
    return () => log('Nested Rendered', <div>
      D: <input value={propsModel.data.d} onInput={ev => { propsModel.data.d = (ev.target as any).value }} />
      <hr />
      F: <input value={propsModel.data.e.f} onInput={ev => { propsModel.data.e.f = (ev.target as any).value }} />
    </div>)
  }
})

const Form = defineComponent({
  emits: ['update:data'],
  props: {
    data: {
      type: Object as PropType<FormType>,
      required: true
    }
  },
  setup(props, { emit }) {
    const propsModel = useModifiableProps(props, emit)

    return () => log('Form Rendered', <div>
      A: <input value={propsModel.data.a} onInput={ev => { propsModel.data.a = (ev.target as any).value }} />
      <hr />
      B: <input value={propsModel.data.b} onInput={ev => { propsModel.data.b = (ev.target as any).value }} />
      <hr />
      <Nested data={propsModel.data.c.$original} onUpdate:data={ev => { propsModel.data.c.$original = ev }} />
    </div>)
  }
})

export default defineComponent({
  setup() {
    const data = ref(defaultForm())
    watch(() => toRaw(data.value), (newV, oldV) => {
      console.log(
        'newV', newV, 'oldV', oldV,
        'newV === oldV', newV === oldV,
        'newV.c.e === oldV.c.e', newV.c.e === oldV.c.e
      )
    })
    return () => log('Page Rendered', <div>
      <pre>Data: {
      }{JSON.stringify(data.value, undefined, 4)}
      </pre>
      <Form data={data.value} onUpdate:data={ev => { data.value = ev }} />
    </div>)
  }
})
</script>

<style>
</style>
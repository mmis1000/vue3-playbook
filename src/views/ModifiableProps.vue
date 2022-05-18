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

const Nested = defineComponent({
  emits: ['update:data'],
  props: {
    data: {
      type: Object as PropType<FormType['c']>,
      required: true
    }
  },
  setup (props, { emit }) {
    const modifiableProps = useModifiableProps(props, emit)
    return () => <div>
      <input value={modifiableProps.data.d} onInput={ev => { modifiableProps.data.d = (ev.target as any).value } } />
    </div>
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
  setup (props, { emit }) {
    const modifiableProps = useModifiableProps(props, emit)

    return () => <div>
      <input value={modifiableProps.data.a} onInput={ev => { modifiableProps.data.a = (ev.target as any).value } } />
      <hr />
      <input value={modifiableProps.data.b} onInput={ev => { modifiableProps.data.b = (ev.target as any).value } } />
      <hr />
      <Nested data={modifiableProps.data.c.$original} onUpdate:data={ev => { modifiableProps.data.c.$original = ev }} />
    </div>
  }
})

export default defineComponent({
  setup () {
    const data = ref(defaultForm())
    watch(() => toRaw(data.value), (newV, oldV) => {
      console.log(
        newV, oldV, 
        newV === oldV,
        newV.c.e === oldV.c.e
      )
    })
    return () => <div>
      <pre>Data:
{JSON.stringify(data.value, undefined, 4)}
      </pre>
      <Form data={data.value} onUpdate:data={ev => { data.value = ev }} />
    </div>
  }
})
</script>

<style>

</style>
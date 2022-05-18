import { unref, toRaw, reactive, Ref } from 'vue';

type ObjectKeys<T extends object> =
  {
    [K in keyof T]: T[K] extends object ? K : never
  }[keyof T]

type NonObjectKeys<T extends object> =
  {
    [K in keyof T]: T[K] extends object ? never : K
  }[keyof T]

type DecorateProps<T> =
  T extends object 
  ? {
    readonly [key in ObjectKeys<T>]: DecorateProps<T[key]>
  } & {
    [key in NonObjectKeys<T>]: DecorateProps<T[key]>
  } & {
    $original: T
  } 
  : T

const updateWithPath: <T>(obj: T, path: string[], value: any) => T =
  (obj: any, path: string[], value: any) => {
    if (path.length > 0) {
      return reactive({
        ...toRaw(obj),
        [path[0]]: toRaw(
          updateWithPath(
            obj[path[0]],
            path.slice(1),
            value
          )
        ),
      });
    } else {
      return value;
    }
  };

export function useModifiableProps<T>(
  props: T,
  emits: (...args: any[]) => void,
): DecorateProps<T> {
  return _useModifiableProps(props, emits)
}

const mappedProp = new WeakMap<any, any>()

function _useModifiableProps<T>(
  props: T,
  emits: (...args: any[]) => void,
  current: any = props,
  pathRef: string[] | Ref<string[]> = []
): DecorateProps<T> {
  if (mappedProp.has(current)) {
    return mappedProp.get(current)
  }

  const proxy = new Proxy({}, {
    get(target: any, key: any) {
      if (key === '$original') {
        return current;
      }

      if (
        (typeof current[key] === 'object' ||
          typeof current[key] === 'function') &&
        current[key] != null
      ) {
        return _useModifiableProps(props, emits, current[key], [
          ...unref(pathRef),
          key,
        ]);
      } else {
        return current[key];
      }
    },
    set(target: any, key: any, value: any) {
      if (key === '$original') {
        const path = [...unref(pathRef)];
        const updatedProp = updateWithPath(
          (props as any)[path[0]],
          path.slice(1),
          value
        );
        emits('update:' + path[0], updatedProp);

        return true;
      }

      const originalValue = current[key]

      if (
        (typeof current[key] === 'object' ||
          typeof current[key] === 'function') &&
        current[key] != null
      ) {
        throw new Error('do not pass the proxy object to v-model, pass .$original instead')
      }

      const path = [...unref(pathRef), key];

      const updatedProp = updateWithPath((props as any)[path[0]], path.slice(1), value);

      emits('update:' + path[0], updatedProp);
      return true;
    },
  });

  mappedProp.set(current, proxy)

  return proxy
}

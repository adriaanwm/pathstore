import {equals} from 'ramda'

export const createUseRunOnceOnChange = useRef => (fn, dependencies) => {
  const lastRef = useRef({})
  if (equals(lastRef.current.dependencies, dependencies)) return
  if (lastRef.current.cleanup) lastRef.current.cleanup()
  lastRef.current = {
    dependencies,
    cleanup: fn()
  }
}

export const createUse = ({store, useState, useRef}) => {
  const useRunOnceOnChange = createUseRunOnceOnChange(useRef)
  return (path, defaultValue, options = {}) => {
    const [value, setValue] = useState(
      () => {
        const storeValue = store.get(path)
        return (options.override || (storeValue === undefined && defaultValue !== undefined))
          ? defaultValue
          : storeValue
      }
    )
    const valueRef = useRef(value)
    useRunOnceOnChange(() => {
      const storeValue = store.get(path)
      const initialValue = (options.override || (storeValue === undefined && defaultValue !== undefined))
        ? defaultValue
        : storeValue
      valueRef.current = initialValue
      setValue(initialValue)
      if (options.override || (storeValue === undefined && defaultValue !== undefined)) {
        store.set(path, defaultValue, {identifier: options.identifier})
      }
      const unsub = store.subscribe(path, () => {
        const newValue = store.get(path)
        if (!equals(newValue, valueRef.current)) {
          valueRef.current = newValue
          setValue(newValue)
        }
      })
      return () => {
        if (options.cleanup) {
          store.set(path, undefined, {identifier: options.identifier})
        }
        unsub()
      }
    }, path)
    return [
      value,
      (newValue, options2 = {}) =>
        store.set(path, newValue, {
          identifier: options2.identifier || options.identifier
        })
    ]
  }
}

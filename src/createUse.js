import {equals} from 'ramda'

export const createUse = ({store, useEffect, useState, useRef}) =>
  (path, defaultValue, options = {}) => {
    const storeValue = store.get(path)
    const [value, setValue] = useState(
      (options.override || (storeValue === undefined && defaultValue !== undefined))
        ? defaultValue
        : storeValue
    )
    const valueRef = useRef(value)
    useEffect(() => {
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
    }, [JSON.stringify(path)])
    return [
      value,
      (newValue, options2 = {}) =>
        store.set(path, newValue, {
          identifier: options2.identifier || options.identifier
        })
    ]
  }

export const createUse2 = ({store, useEffect, useState, useRef}) =>
  (path, defaultValue, options = {}) => {
    const [value, setValue] = useState(() => {
      const current = store.get(path)
      return options.override ? defaultValue : current !== undefined ? current : defaultValue
    })

    useRunOnChange(() => {
      const initial = options.override
        ? defaultValue : current !== undefined ? current : defaultValue
      const current = store.get(path)
      if (equals(initial, current)) {
        store.set(path, initial)
        setValue(initial)
      }
      const unsubscribe = store.subscribe(() => {
        const current = store.get(path)
        if (!equals(current, value)) {
          setValue(value)
        }
      })
      return () => unsubscribe()
    }, [path.join(',')])

    // useRunOnce(() => {
    //   const initial = options.override
    //     ? defaultValue : current !== undefined ? current : defaultValue
    //   const current = store.get(path)
    //   if (equals(initial, current)) {
    //     store.set(path, initial)
    //   }
    // })
    // useEffect(() => {

    // }, [path])
  }

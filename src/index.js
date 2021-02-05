import {createStore as cs} from './createStore'

/**
 * Creates a new store
 * @name createStore
 * @param {Object} init	 The initialization object.
 * @param {Function} init.useState  The useState function from react or preact.
 * @param {Function} init.useEffect  The useEffect function from react or preact.
 * @param {Boolean} init.reduxDevTools  Whether to turn on redux devtools.
 * @returns {store}
 * @example
 * import { useState, useEffect } from 'react'
 * let store = createStore({useState, useEffect, reduxDevTools: true})
 * store.subscribe([], state => console.log(state) );
 * store.set(['a'], 'b')   // logs { a: 'b' }
 * store.set(['c'], 'd')   // logs { a: 'b', c: 'd' }
 */
export const createStore = cs

/**
 * An observable state container, returned from {@link createStore}
 * @name store
 */

/**
 * A function for changing a value in the store's state.
 * Will call all subscribe function of changed path.
 * @memberof store
 * @method set
 * @param {Array} path  The path to set.
 * @param {Any} value  The new value.
 * @example
 * store.set(['a'], 1)  // state is {a: 1}
 * store.set(['b', 'c'], 'd')  // state is {a: 1, b: {c: 'd'}}
 */

/**
 * A function for retrieving values in the store's state.
 * @memberof store
 * @method get
 * @param {Array} path  The path to use.
 * @return {*} The data at `path`.
 * @example
 * store.set([], {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']})
 * store.get(['a'])  // => 1
 * store.get(['b', 'c'])  // => 'd'
 * store.get(['e', 1])  // => 'g'
 * store.get(['e', 4])  // => undefined
 * store.get(['z'])  // => undefined
 * store.get([])  // => {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']}
 */

/**
 * Hook that returns a stateful value, and a function to update it.
 * @memberof store
 * @method use
 * @param {Array} path  The path to use.
 * @param initialValue  The initial value.
 * @param options  Some additional options.
 * @param [boolean=false] options.cleanup  Set the value at path in state to undefined when the component unmounts
 * @param [boolean=false] options.override  Set the value at path to initialValue even if there is already a value there
 * @return {Array.<{value: *, setValue: Function}>}
 * @return value  The value at path in state
 * @return {Function} setValue  A function to update value in state
 * @example
 * onst ReactCounter = () => {
 *  const [count, setCount] = store.use(['path', 'to', 'counter'], 0)
 *  return <div>
 *    <button onClick={() => setCount(count + 1)} >Increment</button>
 *    <span>count: {count}</span>
 *  </div>
 * }
 */

# Pathstore

A simple, performant global store that works well with React.

✨ Also works with Redux Devtools ✨

## Why does this exist?

Wanted a global store that is:
- [performant / can scale](#performance)
- tiny
- succinct

## Table of Contents

-   [From React local state to Pathstore](#from-react-local-state-to-pathstore)
-   [Getting Started](#getting-started)
-   [Examples](#examples)
-   [Performance](#performance)
-   [API](#api)
-   [License](#license)

## From React local state to Pathstore

Suppose we have a simple counter component that uses local react state:

```js
const Counter = () => {
  const [count, setCount] = useState(0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

To use Pathstore instead of local state, replace `useState(0)` with `store.use(['counter'], 0)`. Your component should look like this.

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

Now the counter value is stored in the global state `{..., counter: <value>, ...}` and its value can easily be used in other components.

You might wonder, why did we pass in `['counter']` instead of just `'counter'`. This is because Pathstore lets you use nested values just as easily as any other values. For example, if instead of `['counter']` we pass in `['counter', 'nestedExample']`, then the value of the counter in the store would look something like this:

```js
{
  counter: {
    nestedExample: <value>,
    ...
  },
  ...
}
```

## Getting started

install

```bash
npm install --save @adriaanwm/pathstore
```

create a store

```js
import {createStore} from '@adriaanwm/pathstore'
import {useEffect, useState} from 'react'

export const store = createStore({ useEffect, useState, reduxDevtools: true })
```

use the store

## Examples

#### Table of Contents

-   [Form Input](#form-input)
-   [Initialization](#initialization)
-   [Many updates at once](#many-updates-at-once)

### Form Input

```js

// This will be a lot more satisfying if you have Redux Devtools running in your browser...

const TextInput = ({formName, name, defaultValue = '', ...props}) => {
  const [value, setValue] = store.use([formName, 'values', name], defaultValue)
  return <input
    onChange={ev => setValue(ev.target.value)}
    name={name}
    value={value}
    {...props}
  />
}

const FieldError = ({formName, name, ...props}) => {
  const [value] = store.use([formName, 'errors', name])
  return value ? <span {...props}>{value}</span> : null
}

const ExampleForm = () => {
  const name = 'ExampleForm'
  const onSubmit = ev => {
    ev.preventDefault()
    const values = store.get([name, 'values'])
    // from here you can run some validations, submit the values, etc.
    // ...
    // As an example, lets say there's an email field error:
    store.set([name, 'errors', 'email'], 'A fake email error')
    return
  }
  return <form onSubmit={onSubmit}>
    <TextInput formName={name} name='email' type='email' />
    <FieldError formName={name} name='email' />
    <TextInput formName={name} name='password' type='password' />
    <FieldError formName={name} name='password' />
    <button>Submit</button>
  </form>
}

```

### Initialization

Often you need to set some initial state before your app even starts, and maybe again when the user logs out.

```js
const initStore = (store) => {
  store.set([], {
    token: localStorage.getItem('token'),
    theme: localStorage.getItem('theme')
  })
}

const store = createStore(...)
initStore(store)
```

### Many updates at once

Sometimes you want to change state in more than once place but you only want your components to rerender after all the changes are made. There's a `noPublish` option for that.

```js
const onSubmit = (ev) => {
  // ...
  store.set(['modalState'], undefined, {noPublish: true})
  store.set(['modal'], undefined)
  // subscriptions will only be called after the second store.set is called
}
```

## Performance

Improving performance of global stores was one of the main reasons Pathstore was built. Global stores often call every subscriber for every state change. It's basically asking every stateful component "Do you care about this change?" for every single state change. This becomes a problem if you're storing things that can change many times in a short period of time (like mouse position). This doesn't seem optimal. With Pathstore, subscribers can subscribe to a specific location in the store, which could cut down significantly on the number of times it's called.

I haven't gotten the chance to benchmark Pathstore vs alternatives like Redux and Unistore. Not even sure the best way to do this. If anyone has ideas, please let me know by creating an issue.

Pathstore is also quite small, for those concerned with initial load times.

## API

#### Table of Contents

-   [createStore](#createstore)
-   [store](#store)
    -   [set](#storeset)
    -   [get](#storeget)
    -   [subscribe](#storesubscribe)
    -   [use](#storeuse)

### createStore

Creates a new store.

#### Parameters

-   `init` **Object** The initialization object.
    -   `useState` **Function** The useState function from react or preact.
    -   `useEffect` **Function** The useEffect function from react or preact.
    -   `reduxDevtools` **Boolean** Whether to turn on redux devtools.

#### Returns

-   `store` **Object** A [store](#store)

#### Examples

```javascript
import { useState, useEffect } from 'react'
let store = createStore({useState, useEffect, reduxDevtools: true})
store.subscribe([], state => console.log(state) );
store.set(['a'], 'b')   // logs { a: 'b' }
store.set(['c'], 'd')   // logs { a: 'b', c: 'd' }
```

### store

An observable state container, returned from [createStore](#createstore)

### store.set

A function for changing a value in the store's state.
Will call all subscribe functions of changed path.

#### Parameters

-   `path` **Array** The path to set.
-   `value` **Any** The new value. If you provide a function, it will be given the current value at path and should return a new value. (see examples).
-   `options` **Object** (optional) Some additional options.
    -   `noPublish` **Boolean** (optional) Do not trigger subscriber functions. The subscribe functions that would have been called will instead be called the next time `store.set` is called without the `noPublish` option
    -   `identifier` **String** (optional) A custom identifier that will be shown in Redux Devtools. Normally in Redux-land this would be the action. In Pathstore this is normally the path.

#### Examples

```js
store.set([], {}) // the store is {}
store.set(['a'], 1) // the store is {a: 1}
store.set(['a'], x => x + 1) // the store is {a: 2}
store.set(['b', 0, 'c'], 1) // the store is {a: 2, b: [{c: 1}]}
```

### store.get

A function for retrieving values in the store's state.

#### Parameters

-   `path` **Array** The path to use.

#### Returns

-   `value` **Any** The value at `path`.

#### Examples

```javascript
store.set([], {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']})
store.get(['a'])  // => 1
store.get(['b', 'c'])  // => 'd'
store.get(['e', 1])  // => 'g'
store.get(['e', 4])  // => undefined
store.get(['z'])  // => undefined
store.get([])  // => {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']}
```

### store.subscribe

Add a function to be called whenever state changes anywhere along the specified path.

#### Parameters

-   `path` **Array** The path to use.
-   `subscriber` **Function** The function to call when state changes along the path.

#### Returns

- `unsubscribe` **Function** Stop `subscriber` from being called anymore.

#### Examples

Subscribe to any state changes

```js
let unsub = store.subscribe([], () => console.log('state has changed') );
store.set(['a'], 'b')   // logs 'state has changed'
store.set(['c'], 'd')   // logs 'state has changed'
store.set([], {})   // logs 'state has changed'
unsub()   // stop our function from being called
store.set(['a'], 3)   // does not log anything
```

Subscribe to a specific path in state

```js
let unsub = store.subscribe(['a', 'b', 'c'], () => console.log('a.b.c state has changed') );
store.set([], {a: {b: {c: 4}}})   // logs 'a.b.c state has changed'
store.set(['a', 'b', 'c'], 5)   // logs 'a.b.c state has changed'
store.set(['b'], 5)   // does not log anything
store.set(['a', 'b', 'd'], 2)   // does not log anything
store.set(['a', 'b', 'c', 'd', 'e'], 2)   // logs 'a.b.c state has changed'
store.set([], {x: 123})   // logs 'a.b.c state has changed'
```

### store.use

Hook that returns a stateful value, and a function to update it.

#### Parameters

-   `path` **Array** The path to use.
-   `initialValue`  **Any** (optional) The initial value.
-   `options`  **Object** (optional) Some additional options.
    -   `cleanup`  **Boolean**  (optional, default `false`) Set the value at `path` in state to `undefined` when the component unmounts.
    -   `override`  **Boolean**  (optional, default `false`) Set the value at `path` to `initialValue` even if there is already a value there.
    -   `identifier`  **String**  (optional) An identifier to use in Redux Devtools.

#### Return

-   `[value, setValue]` **Array** 
    -   `value` **Any** The value at `path`
    -   `setValue` **Function** Set a new value at path

#### Examples

A counter component, the value of the counter will be stored in state
under `{counter: <here>}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

The same component, but storing the count under `{counter: {nested: <here>}}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter', 'nested'], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

This time storing the count under a dynamic id key `{counter: {<id>: <here>}}`

```js
const Counter = ({id}) => {
  const [count, setCount] = store.use(['counter', id], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

Using the cleanup option. When the component unmounts the value will be set to undefined, `{counter: undefined}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0, {cleanup: true})
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

Using the override option. When the component mounts the value will be set to initialValue, even if there is already a value in state. `count` will be `0` because the current value `4` is overriden with the initial value `0`

```js
store.set([], {counter: 4})
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0, {override: true})
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count} will always start at 0</span>
  </div>
}
```


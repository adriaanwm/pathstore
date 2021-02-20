import {append, path as rPath, assocPath, pathOr, range} from 'ramda'
import {createUse} from './createUse'
import {setupReduxDevtools} from './devtools'

const SUB_KEY = '_s'

const allSubscribers = obj =>
  Object.keys(obj).filter(k => k !== SUB_KEY).reduce(
    (acc, k) => acc.concat(
      [
        ...(pathOr([], [k, SUB_KEY], obj)),
        ...allSubscribers(pathOr({}, [k], obj))
      ]
    ),
    []
  )

const subscribersOfPath = (path, subscribers) => [
  ...range(0, path.length + 1).reduce(
    (acc, i) => acc.concat(
      pathOr([], [...path.slice(0, i), SUB_KEY], subscribers)
    ),
    []
  ),
  ...allSubscribers(pathOr({}, path, subscribers))
]

export const createStore = ({useEffect, useState, useRef, reduxDevtools}) => {
  let state = {}
  let subscribers = {}
  let changes = []
  const store = {
    subscribers: () => subscribers,
    get: path => rPath(path, state),
    set: (path, value, options = {}) => {
      value = typeof value === 'function' ? value(existing) : value
      let oldState = state
      state = assocPath(path, value, state)
      changes.push({state, oldState, path, value})
      if (!options.noPublish) {
        changes.forEach(({state, oldState, path, value}) => {
          const s = subscribersOfPath(path, subscribers)
          subscribersOfPath(path, subscribers).forEach(s => s({
            state,
            oldState,
            path,
            identifier: options.identifier
          }))
        })
        changes = []
      }
    },
    subscribe: (path, fn) => {
      const subscribersPath = [
        ...path,
        SUB_KEY
      ]
      subscribers = assocPath(
        subscribersPath,
        append(fn, rPath(subscribersPath, subscribers)),
        subscribers
      )
      return () => {
        subscribers = assocPath(
          subscribersPath,
          rPath(subscribersPath, subscribers).filter(s => s != fn),
          subscribers
        )
      }
    }
  }
  store.use = createUse({store, useEffect, useState, useRef})
  return reduxDevtools ? setupReduxDevtools(store) : store
}

// thanks to developit! (unistore)
export const setupReduxDevtools = (store) => {
  var extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__
  var ignoreState = false

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension')
    store.devtools = null

    return store
  }

  if (!store.devtools) {
    store.devtools = extension.connect()
    store.devtools.subscribe(function (message) {
      if (message.type === 'DISPATCH' && message.state) {
        ignoreState = (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')
        store.set([], JSON.parse(message.state))
      }
    })
    store.devtools.init(store.get([]))
    store.subscribe([], ({state, oldState, path, identifier}) => {
      if (!ignoreState) {
        store.devtools.send(
          identifier || path.join('.') || '__ROOT__',
          state
        )
      } else {
        ignoreState = false
      }
    })
  }

  return store
}



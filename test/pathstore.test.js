import { createStore } from '../src'

const useEffect = () => {}
const useState = () => {}
const createStoreArgs = {useEffect, useState}

describe('createStore()', () => {
  it('should be instantiable', () => {
    let store = createStore(createStoreArgs)
    expect(store).toMatchObject({
      set: expect.any(Function),
      get: expect.any(Function),
      subscribe: expect.any(Function),
      use: expect.any(Function)
    })
  })

  it('should update state in-place', () => {
		let store = createStore(createStoreArgs)
		expect(store.get([])).toMatchObject({})
		store.set(['a'], 'b')
		expect(store.get([])).toMatchObject({ a: 'b' })
		store.set(['c'], 'd')
		expect(store.get([])).toMatchObject({ a: 'b', c: 'd' })
		store.set(['a'],  'x')
		expect(store.get([])).toMatchObject({ a: 'x', c: 'd' })
		store.set(['c'], null)
		expect(store.get([])).toMatchObject({ a: 'x', c: null })
		store.set(['c'], undefined)
		expect(store.get([])).toMatchObject({ a: 'x', c: undefined })
		store.set(['c', 'c1', 'c2', 1, 'c3'], 'cv')
		expect(store.get([])).toMatchObject({ a: 'x', c: {c1: {c2: [, {c3: 'cv'}]}} })
	})

  it('should invoke subscriptions', () => {
		let store = createStore(createStoreArgs)

		let sub1 = jest.fn()
		let sub2 = jest.fn()
		let sub3 = jest.fn()

		let unsub = store.subscribe(['a'], sub1)
		let unsub2 = store.subscribe(['c'], sub2)
		let unsub3 = store.subscribe(['a', 'b'], sub3)
		expect(unsub).toBeInstanceOf(Function)

		store.set(['a'], 'b')
		store.set(['c'], 'cv')
		store.set(['a', 'b', 'c'], 'x')
		store.set(['a', 'd', 'c'], 'x')

		expect(sub1).toHaveBeenCalledTimes(3)
		expect(sub2).toHaveBeenCalledTimes(1)
		expect(sub3).toHaveBeenCalledTimes(2)
	})

  it('should invoke subscription at root always', () => {
		let store = createStore(createStoreArgs)
		let sub = jest.fn()
		let unsub = store.subscribe([], sub)
		expect(unsub).toBeInstanceOf(Function)
		store.set(['a'], 'b')
		store.set(['c'], 'cv')
		store.set(['a', 'b', 'c'], 'x')
		store.set(['a', 'd', 'c'], 'x')
		store.set([], {a: 'b'})
		expect(sub).toHaveBeenCalledTimes(5)
	})

  
	it('should unsubscribe', () => {
		let store = createStore(createStoreArgs)

		let sub1 = jest.fn()
		let sub2 = jest.fn()
		let sub3 = jest.fn()

		let unsub1 = store.subscribe([], sub1)
		let unsub2 = store.subscribe(['a'], sub2)
		let unsub3 = store.subscribe([], sub3)

		store.set(['a'], 'b')
		expect(sub1).toBeCalled()
		expect(sub2).toBeCalled()
		expect(sub3).toBeCalled()

		sub1.mockClear()
		sub2.mockClear()
		sub3.mockClear()

    unsub2()

		store.set(['a'], 'd')
		expect(sub1).toBeCalled()
		expect(sub2).not.toBeCalled()
		expect(sub3).toBeCalled()

		sub1.mockClear()
		sub2.mockClear()
		sub3.mockClear()

    unsub1()

		store.set(['e'], 'f')
		expect(sub1).not.toBeCalled()
		expect(sub2).not.toBeCalled()
		expect(sub3).toBeCalled()

		sub3.mockClear()

		unsub3()

		store.set(['g'], 'h')
		expect(sub1).not.toBeCalled()
		expect(sub2).not.toBeCalled()
		expect(sub3).not.toBeCalled()
	})

})

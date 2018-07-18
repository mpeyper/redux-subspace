/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createStore, combineReducers } from 'redux'
import subspace, { subspaceRoot } from '../../src/store/subspace'
import { ROOT, NAMESPACE_ROOT, CHILD } from '../../src/enhancers/subspaceTypesEnhancer'

describe('subspace Tests', () => {

    const child = (state = "expected") => state
    const parentReducer = combineReducers({ child })
    const store = createStore(parentReducer)
    const dispatch = sinon.spy()
    store.dispatch = dispatch

    it('should enhance store getState', () => {
        const subspacedStore = subspace((state) => state.child)(store)

        expect(subspacedStore.getState()).to.equal("expected")
    })

    it('should use namespace if mapState not provided', () => {
        const subspacedStore = subspace(undefined, "child")(store)

        expect(subspacedStore.getState()).to.equal("expected")
    })

    it('should not enhance store dispatch if no namespace provided', () => {
        const subspacedStore = subspace((state) => state.child)(store)

        subspacedStore.dispatch({ type: "TEST" })

        expect(dispatch).to.have.been.calledWithMatch({ type: "TEST" })
    })

    it('should enhance store dispatch with namespace', () => {
        const subspacedStore = subspace((state) => state.child, "test")(store)

        subspacedStore.dispatch({ type: "TEST" })

        expect(dispatch).to.have.been.calledWithMatch({ type: "test/TEST" })
    })

    it('should enhance subspace with enhancer', () => {
        const enhancer = (createSubspace) => (store) => {
            return {
                ...createSubspace(store),
                fromEnhancer: true
            }
        }
        
        const subspacedStore = subspaceRoot(store, enhancer)

        expect(subspacedStore.fromEnhancer).to.be.true
    })

    it('should enhance subspace from inherited enhancer', () => {
        const enhancer = (createSubspace) => (store) => {
            return {
                ...createSubspace(store),
                fromEnhancer: true
            }
        }

        const storeWithEnhancer = { ...store }
        storeWithEnhancer.dispatch = dispatch
        storeWithEnhancer.subspaceOptions = {
            enhancer
        }

        const subspacedStore = subspace((state) => state.child, "test")(storeWithEnhancer)

        expect(subspacedStore.fromEnhancer).to.be.true
    })
    
    it('should provide process action function on subspace', () => {
        const subspacedStore = subspace("child")(store)

        expect(subspacedStore.processAction).to.be.a('function')
    })

    it('should provide subspace type on subspace', () => {
        const subspacedStore1 = subspaceRoot(store)
        const subspacedStore2 = subspace("child")(subspacedStore1)
        const subspacedStore3 = subspace(() => {})(subspacedStore1)
        const subspacedStore4 = subspace(() => {})(subspacedStore2)
        const subspacedStore5 = subspace('child')(subspacedStore2)
        const subspacedStore6 = subspace('child')(subspacedStore3)
        const subspacedStore7 = subspace(() => {})(subspacedStore3)

        expect(subspacedStore1.subspaceTypes).to.deep.equal([ROOT, NAMESPACE_ROOT])
        expect(subspacedStore2.subspaceTypes).to.deep.equal([NAMESPACE_ROOT, CHILD])
        expect(subspacedStore3.subspaceTypes).to.deep.equal([CHILD])
        expect(subspacedStore4.subspaceTypes).to.deep.equal([CHILD])
        expect(subspacedStore5.subspaceTypes).to.deep.equal([NAMESPACE_ROOT, CHILD])
        expect(subspacedStore6.subspaceTypes).to.deep.equal([NAMESPACE_ROOT, CHILD])
        expect(subspacedStore7.subspaceTypes).to.deep.equal([CHILD])
    })

    it('should provide root store on subspace', () => {
        const subspacedStore1 = subspace("child1")(store)
        const subspacedStore2 = subspace("child2")(subspacedStore1)

        expect(subspacedStore1.rootStore).to.equal(store)
        expect(subspacedStore2.rootStore).to.equal(store)
    })

    it('should provide full namespace subspace', () => {
        const subspacedStore1 = subspace("child1")(store)
        const subspacedStore2 = subspace("child2")(subspacedStore1)

        expect(subspacedStore1.namespace).to.equal('child1')
        expect(subspacedStore2.namespace).to.equal('child1/child2')
    })

    it('should correctly apply namespace when not provided', () => {
        const subspacedStore1 = subspace(() => {})(store)
        const subspacedStore2 = subspace("child2")(subspacedStore1)
        const subspacedStore3 = subspace(() => {})(subspacedStore2)
        const subspacedStore4 = subspace("child4")(subspacedStore3)
        const subspacedStore5 = subspace(() => {})(subspacedStore4)

        expect(subspacedStore1.namespace).to.equal('')
        expect(subspacedStore2.namespace).to.equal('child2')
        expect(subspacedStore3.namespace).to.equal('child2')
        expect(subspacedStore4.namespace).to.equal('child2/child4')
        expect(subspacedStore5.namespace).to.equal('child2/child4')
    })
})

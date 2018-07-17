/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { subspace } from 'redux-subspace'
import { filter, ignoreElements, map } from 'rxjs/operators'
import { SUBSPACE_STORE_KEY } from './subspaceStoreKey'

const identity = (x) => x

const subspaced = (mapState, namespace, options) => {
    const subspaceDecorator = subspace(mapState, namespace, options)
    return epic => (action$, store, { [SUBSPACE_STORE_KEY]: parentStore, ...dependencies } = {}) => {
        if (parentStore === undefined) {
            throw new Error('Subspace epic couldn\'t find the store. Make sure you\'ve used createEpicMiddleware from redux-subspace-observable')
        }
        const subspacedStore = subspaceDecorator(parentStore)

        Object.defineProperty(dependencies, SUBSPACE_STORE_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: subspacedStore
        })

        const filteredAction$ = action$.pipe(
            map((action) => subspacedStore.processAction(action, identity)),
            filter(identity))

        return epic(filteredAction$, subspacedStore, dependencies).pipe(
            map(subspacedStore.dispatch),
            ignoreElements())
    }
}

export default subspaced

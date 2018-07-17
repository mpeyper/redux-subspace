/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 
import { compose } from 'redux'
import subspaceEnhancer from '../enhancers/subspaceEnhancer'
import namespaceEnhancer from '../enhancers/namespaceEnhancer'
import rootStoreEnhancer from '../enhancers/rootStoreEnhancer'
import parentStoreEnhancer from '../enhancers/parentStoreEnhancer'
import subspaceTypesEnhancer from '../enhancers/subspaceTypesEnhancer'
import processActionEnhancer from '../enhancers/processActionEnhancer'
 
const DEFAULT_OPTIONS = {
    enhancer: (subspace) => subspace,
    transparent: false
}
 
const resolveParameters = (mapState, namespace, options) => {
 
    if (options === undefined && typeof namespace === 'object') {
        return resolveParameters(mapState, undefined, options)
    }
 
    if (options === undefined) {
        return resolveParameters(mapState, namespace, DEFAULT_OPTIONS)
    }
 
    if (options && options.enhancer === undefined) {
        return resolveParameters(mapState, namespace, { ...options, enhancer: DEFAULT_OPTIONS.enhancer })
    }
 
    if (options && options.transparent === undefined) {
        return resolveParameters(mapState, namespace, { ...options, transparent: DEFAULT_OPTIONS.transparent })
    }

    if (namespace === undefined && typeof mapState === 'string') {
        return resolveParameters(mapState, mapState, options)
    }
 
    if (namespace === undefined && typeof mapState === 'function') {
        return resolveParameters(mapState, null, options)
    }
 
    if (namespace === null) {
        return resolveParameters(mapState, '', options)
    }
 
    if (typeof mapState === 'string') {
        return resolveParameters((state) => state[mapState], namespace, options)
    }
 
    if (!mapState && typeof namespace === 'string') {
        return resolveParameters((state) => state[namespace], namespace, options)
    }

    return [mapState, namespace, options]
}

const validateParameters = (mapState, namespace, options) => {
    if (!mapState && !namespace) {
        throw TypeError("mapState and/or namespace must be defined.")
    }

    if (typeof mapState !== 'function') {
        throw TypeError("mapState must be a function or a string.")
    }

    if (typeof namespace !== 'string') {
        throw TypeError("namespace must be a string or null.")
    }

    if (typeof options !== 'object') {
        throw TypeError("options must be an object.")
    } else {
        if (typeof options.enhancer !== 'function') {
            throw TypeError("options.enhancer must be a function.")
        }
        if (typeof options.transparent !== 'boolean') {
            throw TypeError("options.transparent must be a boolean.")
        }
    }
}
 
const mergeOptions = (options, parentOptions) => {
    if (!parentOptions) {
        return options
    }
 
    return {
        ...parentOptions,
        ...options,
        enhancer: compose(options.enhancer, parentOptions.enhancer)
    }
}
 
const createSubspace = (store, enhancer) => {
    if (typeof enhancer !== 'undefined') {
        return enhancer(createSubspace)(store)
    }
    return store
}
 
const subspaceEnhanced = (mapState, namespace, options, isRoot) => {
    if (process.env.NODE_ENV !== 'production') {
        validateParameters(mapState, namespace, options)
    }

    const subspaceEnhancers = compose(
        subspaceEnhancer(mapState, namespace, !!options.transparent),
        namespaceEnhancer(namespace),
        subspaceTypesEnhancer(isRoot, namespace),
        processActionEnhancer(namespace),
        rootStoreEnhancer,
        parentStoreEnhancer
    )
 
    return (store) => {
        const parentOptions = store.subspaceOptions || {}
        const parentStore = parentOptions.transparent ? store.parentStore : store
        options = mergeOptions(options, parentStore.subspaceOptions)
        const subspace = createSubspace(parentStore, compose(options.enhancer, subspaceEnhancers))
        return { ...subspace, subspaceOptions: options }
    }
}
 
export const subspaceRoot = (store, enhancer = DEFAULT_OPTIONS.enhancer) =>
    subspaceEnhanced(...resolveParameters(state => state, null, { enhancer }), true)(store)
 
const subspace = (mapState, namespace, options) => subspaceEnhanced(...resolveParameters(mapState, namespace, options))
 
export default subspace
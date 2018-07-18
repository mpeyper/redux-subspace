/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 
import { compose } from 'redux'
import resolveParameters from './resolveParameters'
import subspaceEnhancer from '../enhancers/subspaceEnhancer'
import namespaceEnhancer from '../enhancers/namespaceEnhancer'
import rootStoreEnhancer from '../enhancers/rootStoreEnhancer'
import subspaceTypesEnhancer from '../enhancers/subspaceTypesEnhancer'
import processActionEnhancer from '../enhancers/processActionEnhancer'
 
const createSubspace = (store, enhancer) => {
  if (typeof enhancer !== 'undefined') {
    return enhancer(createSubspace)(store)
  }
  return store
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
 
const subspaceEnhanced = (inputMapState, inputNamespace, inputOptions, isRoot) => {
  const { mapState, namespace, options } = resolveParameters(inputMapState, inputNamespace, inputOptions)

  const subspaceEnhancers = compose(
    subspaceEnhancer(mapState, namespace),
    namespaceEnhancer(namespace),
    subspaceTypesEnhancer(isRoot, namespace),
    processActionEnhancer(namespace),
    rootStoreEnhancer
  )
 
  return (store) => {
    const subspaceOptions = mergeOptions(options, store.subspaceOptions)
    const subspace = createSubspace(store, compose(subspaceOptions.enhancer, subspaceEnhancers))
    return { ...subspace, subspaceOptions }
  }
}
 
export const subspaceRoot = (store, enhancer) => {
  return subspaceEnhanced(null, null, { enhancer }, true)(store)
}
 
const subspace = (mapState, namespace) => subspaceEnhanced(mapState, namespace)
 
export default subspace

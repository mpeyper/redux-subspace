 /**
 * Copyright 2018, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DEFAULT_OPTIONS = {
  enhancer: (subspace) => subspace
}

const isObject = (value) => {
  const type = typeof value
  return type == 'object' && value != null && !Array.isArray(value)
}

const notProvided = (value) => value === undefined || value === null

const defaultInProduction = (defaultValue, error) => {
  if (process.env.NODE_ENV !== 'production') {
    throw TypeError(error)
  }
  return defaultValue
}

const validateParameters = ({ mapState, namespace, options }) => {
  if (!mapState && !namespace) {
    return validateParameters(
      defaultInProduction({ mapState: (state) => state, namespace: '', options }, 'mapState and/or namespace must be defined.')
    )
  }

  if (typeof mapState !== 'function') {
    return validateParameters({
      mapState: defaultInProduction((state) => state, 'mapState must be a function or a string.'),
      namespace,
      options
    })
  }

  if (typeof namespace !== 'string') {
    return validateParameters({
      mapState,
      namespace: defaultInProduction('', 'namespace must be a string or null.'),
      options
    })
  }

  if (!isObject(options)) {
    return validateParameters({
      mapState,
      namespace,
      options: defaultInProduction(DEFAULT_OPTIONS, 'options must be an object.')
    })
  } else {
    if (typeof options.enhancer !== 'function') {
      return validateParameters({
        mapState,
        namespace,
        options: { ...options, enhancer:  defaultInProduction(DEFAULT_OPTIONS.enhancer, 'options.enhancer must be a function.') }
      })
    }
  }

  return { mapState, namespace, options }
}

const resolveParameters = (mapState, namespace, options) => {
  if (notProvided(options) && isObject(namespace)) {
    return resolveParameters(mapState, undefined, namespace)
  }
  if (notProvided(options)) {
    return resolveParameters(mapState, namespace, DEFAULT_OPTIONS)
  }
  if (isObject(options) && notProvided(options.enhancer)) {
    return resolveParameters(mapState, namespace, { ...options, enhancer: DEFAULT_OPTIONS.enhancer })
  }
  if (namespace === undefined && typeof mapState === 'string') {
    return resolveParameters(mapState, mapState, options)
  }
  if (namespace === undefined && typeof mapState === 'function') {
    return resolveParameters(mapState, null, options)
  }
  if (notProvided(namespace)) {
    return resolveParameters(mapState, '', options)
  }
  if (typeof mapState === 'string') {
    return resolveParameters((state) => state[mapState], namespace, options)
  }
  if (notProvided(mapState) && typeof namespace === 'string') {
    if (namespace === '') {
      return resolveParameters((state) => state, namespace, options)
    }
    return resolveParameters((state) => state[namespace], namespace, options)
  }

  return validateParameters({ mapState, namespace, options })
}

export default resolveParameters
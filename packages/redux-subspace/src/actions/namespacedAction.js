/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isGlobal from './isGlobal'
import isNamespaced from './isNamespaced'

const namespacedAction = (namespace, transparent = false) => action => {
  if (!namespace || isGlobal(action, namespace) || (transparent && isNamespaced(action))) {
    return action
  }

  return { ...action, type: `${namespace}/${action.type}`, meta: { ...action.meta, namespaced: true } }
}

export default namespacedAction

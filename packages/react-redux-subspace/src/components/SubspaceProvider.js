/**
 * Copyright 2017, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Children } from 'react'
import PropTypes from 'prop-types'
import { subspace } from 'redux-subspace'

class SubspaceProvider extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
        childStore: this.getSubspaceDecorator(props)(context.store)
    }
  }

  getParentStore(store) {
    const options = store.subspaceOptions || {}
    return options.transparent ? store.parentStore : store
  }

  makeSubspaceDecorator(props) {
    return subspace(props.mapState, props.namespace, {
      enhancer: props.enhancer,
      transparent: props.transparent
    })
  }

  getSubspaceDecorator(props) {
    return props.subspaceDecorator || this.makeSubspaceDecorator(props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.mapState !== nextProps.mapState ||
      this.props.namespace !== nextProps.namespace ||
      this.props.enhancer !== nextProps.enhancer ||
      this.props.transparent !== nextProps.transparent ||
      this.props.subspaceDecorator !== nextProps.subspaceDecorator
    ) {
       this.setState({ childStore: this.getSubspaceDecorator(nextProps)(context.store) })
    }
  }

  getChildContext() {
    return { store: this.state.childStore }
  }

  render() {
    return Children.only(this.props.children)
  }
}

SubspaceProvider.propTypes = {
  children: PropTypes.element.isRequired,
  mapState: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  namespace: PropTypes.string,
  enhancer: PropTypes.func,
  transparent: PropTypes.bool,
  subspaceDecorator: PropTypes.func
}

SubspaceProvider.contextTypes = {
  store: PropTypes.object.isRequired
}

SubspaceProvider.childContextTypes = {
  store: PropTypes.object
}

export default SubspaceProvider

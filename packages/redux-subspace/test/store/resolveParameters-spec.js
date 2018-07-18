/**
 * Copyright 2018, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import resolveParameters, { DEFAULT_OPTIONS } from '../../src/store/resolveParameters'

describe('resolveParameters Tests', () => {
  const mapState = state => state
  const testEnhancer = () => {}

  it('should resolve valid parameters', () => {
    const parameters = resolveParameters(mapState, 'namespace', { enhancer: testEnhancer })
    expect(parameters.mapState).to.equal(mapState)
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options.enhancer).to.equal(testEnhancer)
  })

  it('should default namespace', () => {
    const parameters = resolveParameters(mapState, DEFAULT_OPTIONS)
    expect(parameters.mapState).to.equal(mapState)
    expect(parameters.namespace).to.equal('')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should allow null namespace', () => {
    const parameters = resolveParameters(mapState, null, DEFAULT_OPTIONS)
    expect(parameters.mapState).to.equal(mapState)
    expect(parameters.namespace).to.equal('')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should default options', () => {
    const parameters = resolveParameters(mapState, 'namespace')
    expect(parameters.mapState).to.equal(mapState)
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should default options enhancer', () => {
    const parameters = resolveParameters(mapState, 'namespace', {})
    expect(parameters.mapState).to.equal(mapState)
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options.enhancer).to.equal(DEFAULT_OPTIONS.enhancer)
  })

  it('should create mapstate from string', () => {
    const parameters = resolveParameters('stateKey', 'namespace')
    expect(parameters.mapState({ stateKey: 'expected' })).to.equal('expected')
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should create namespace from mapState string', () => {
    const parameters = resolveParameters('namespace')
    expect(parameters.mapState({ namespace: 'expected' })).to.equal('expected')
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should create mapstate from namespace string', () => {
    const parameters = resolveParameters(undefined, 'namespace')
    expect(parameters.mapState({ namespace: 'expected' })).to.equal('expected')
    expect(parameters.namespace).to.equal('namespace')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should create mapstate from null namespace string', () => {
    const parameters = resolveParameters(undefined, null)
    expect(parameters.mapState('expected')).to.equal('expected')
    expect(parameters.namespace).to.equal('')
    expect(parameters.options).to.equal(DEFAULT_OPTIONS)
  })

  it('should validate valid parameters', () => {
    expect(() => resolveParameters(mapState, 'namespace', DEFAULT_OPTIONS)).to.not.throw()
  })

  it('should validate either mapState or namespace parameters ar provided', () => {
    expect(() => resolveParameters(0, 0, DEFAULT_OPTIONS)).to.throw(TypeError, 'mapState and/or namespace must be defined.')
  })

  it('should validate invalid mapstate parameter', () => {
    expect(() => resolveParameters(false, 'namespace', DEFAULT_OPTIONS)).to.throw(TypeError, 'mapState must be a function or a string.')
    expect(() => resolveParameters(0, 'namespace', DEFAULT_OPTIONS)).to.throw(TypeError, 'mapState must be a function or a string.')
    expect(() => resolveParameters({}, 'namespace', DEFAULT_OPTIONS)).to.throw(TypeError, 'mapState must be a function or a string.')
    expect(() => resolveParameters([], 'namespace', DEFAULT_OPTIONS)).to.throw(TypeError, 'mapState must be a function or a string.')
  })

  it('should validate invalid namespace parameter', () => {
    expect(() => resolveParameters(mapState, false, DEFAULT_OPTIONS)).to.throw(TypeError, 'namespace must be a string or null.')
    expect(() => resolveParameters(mapState, 0, DEFAULT_OPTIONS)).to.throw(TypeError, 'namespace must be a string or null.')
    expect(() => resolveParameters(mapState, {}, DEFAULT_OPTIONS)).to.throw(TypeError, 'namespace must be a string or null.')
    expect(() => resolveParameters(mapState, [], DEFAULT_OPTIONS)).to.throw(TypeError, 'namespace must be a string or null.')
    expect(() => resolveParameters(mapState, () => {}, DEFAULT_OPTIONS)).to.throw(TypeError, 'namespace must be a string or null.')
  })

  it('should validate invalid options parameter', () => {
    expect(() => resolveParameters(mapState, 'namespace', false)).to.throw(TypeError, 'options must be an object.')
    expect(() => resolveParameters(mapState, 'namespace', 0)).to.throw(TypeError, 'options must be an object.')
    expect(() => resolveParameters(mapState, 'namespace', '')).to.throw(TypeError, 'options must be an object.')
    expect(() => resolveParameters(mapState, 'namespace', [])).to.throw(TypeError, 'options must be an object.')
    expect(() => resolveParameters(mapState, 'namespace', () => {})).to.throw(TypeError, 'options must be an object.')
  })

  it('should validate invalid options enhancer parameter', () => {
    expect(() => resolveParameters(mapState, 'namespace', { enhancer: false })).to.throw(TypeError, 'options.enhancer must be a function.')
    expect(() => resolveParameters(mapState, 'namespace', { enhancer: 0 })).to.throw(TypeError, 'options.enhancer must be a function.')
    expect(() => resolveParameters(mapState, 'namespace', { enhancer: '' })).to.throw(TypeError, 'options.enhancer must be a function.')
    expect(() => resolveParameters(mapState, 'namespace', { enhancer: {} })).to.throw(TypeError, 'options.enhancer must be a function.')
    expect(() => resolveParameters(mapState, 'namespace', { enhancer: [] })).to.throw(TypeError, 'options.enhancer must be a function.')
  })

  it('should should sanitize options if invalid in production', () => {
    const nodeEnv = process.env.NODE_ENV

    try {
      process.env.NODE_ENV = 'production'

      let parameters = resolveParameters(false, false, false)

      expect(parameters.mapState('expected')).to.equal('expected')
      expect(parameters.namespace).to.equal('')
      expect(parameters.options).to.equal(DEFAULT_OPTIONS)

      parameters = resolveParameters(false, 'namespace', DEFAULT_OPTIONS)

      expect(parameters.mapState('expected')).to.equal('expected')
      expect(parameters.namespace).to.equal('namespace')
      expect(parameters.options).to.equal(DEFAULT_OPTIONS)

      parameters = resolveParameters(mapState, false, DEFAULT_OPTIONS)

      expect(parameters.mapState).to.equal(mapState)
      expect(parameters.namespace).to.equal('')
      expect(parameters.options).to.equal(DEFAULT_OPTIONS)

      parameters = resolveParameters(mapState, 'namespace', { enhancer: false })

      expect(parameters.mapState).to.equal(mapState)
      expect(parameters.namespace).to.equal('namespace')
      expect(parameters.options.enhancer).to.equal(DEFAULT_OPTIONS.enhancer)
    } finally {
      process.env.NODE_ENV = nodeEnv
    }
  })
})

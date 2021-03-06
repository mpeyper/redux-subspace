import { createStore } from 'redux'
import { applyMiddleware } from 'redux-subspace'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'connected-react-router'
import wormhole from 'redux-subspace-wormhole'
import api from '../../common/middleware/api'
import createReducer from '../reducers'

const configureStore = history => createStore(
  createReducer(history),
  applyMiddleware(
    thunk,
    api,
    routerMiddleware(history),
    wormhole((state) => state.configuration, 'configuration')
  )
)

export default configureStore

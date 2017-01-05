import {combineReducers} from 'redux'
import root from './root'
import Logs from './logs'

import {routerReducer} from 'react-router-redux'

const reducer = combineReducers({
  root,
  routing: routerReducer,
  logs:    Logs
})

export default reducer
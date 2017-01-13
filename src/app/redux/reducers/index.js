import {combineReducers} from 'redux'
import root from './root'
import logs from './logs'
import notifications from './notifications'
import system from './system'
import {routerReducer as routing} from 'react-router-redux'

const reducer = combineReducers({
  root,
  routing,
  notifications,
  system,
  logs
})

export default reducer
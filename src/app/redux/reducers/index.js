import {combineReducers} from 'redux'
import root from './root'
import logs from './logs'
import notifications from './notifications'
import {routerReducer as routing} from 'react-router-redux'

const reducer = combineReducers({
  root,
  routing,
  notifications,
  logs
})

export default reducer
import {combineReducers} from 'redux'
import root from './root'
import Logs from '../../containers/Logs/redux'

import {routerReducer} from 'react-router-redux'

const reducer = combineReducers({
  root,
  routing:           routerReducer,
  'containers.Logs': Logs
})

export default reducer
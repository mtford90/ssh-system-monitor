import {combineReducers} from 'redux'
import root from './root'
import config from '../../containers/config/redux'
import {routerReducer} from 'react-router-redux'

const reducer = combineReducers({
  root,
  config,
  routing: routerReducer
})

export default reducer
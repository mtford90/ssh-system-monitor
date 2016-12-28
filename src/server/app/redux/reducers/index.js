import {combineReducers} from 'redux'
import root from './root'
import {routerReducer} from 'react-router-redux'

const reducer = combineReducers({
  root,
  routing: routerReducer
})

export default reducer
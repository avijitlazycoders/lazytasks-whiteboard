import whiteboardSlice from './whiteboardSlice'
import { combineReducers } from 'redux'
const reducer = combineReducers({
    whiteboard: whiteboardSlice,
})
export default reducer
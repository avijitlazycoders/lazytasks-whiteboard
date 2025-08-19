import { combineReducers } from '@reduxjs/toolkit'
import premiumCommonReducer from './commonSlice'

const reducer = combineReducers({
    premiumCommon: premiumCommonReducer
})

export default reducer

import qrCodeSlice from './qrCodeSlice'
import { combineReducers } from 'redux'
const reducer = combineReducers({
    qrcode: qrCodeSlice,
})
export default reducer
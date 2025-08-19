import { combineReducers } from 'redux'

// import PremiumBaseReducer from './base';
import qrCodeReducer from '../components/qrCode/store';
import whiteboardReducer from '../components/whiteboard/store';

const whiteboardRootReducer = combineReducers({
    qrcode: qrCodeReducer,
    whiteboard: whiteboardReducer,
});

export default whiteboardRootReducer

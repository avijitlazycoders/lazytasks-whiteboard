import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {getQRCode} from "../../../services/QRCodeService";

// Fetch Single User
export const fetchQRCode = createAsyncThunk('qrCode/fetchQRCode', async () => {
    return getQRCode()
})


const initialState = {
    qrCode:{},
    isLoading: false,
    isError: false,
    error: '',
    success: null,
}

const qrCodeSlice = createSlice({
    name: 'qrCode',
    initialState,
    reducers: {
        removeSuccessMessage: (state) => {
            state.success = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQRCode.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchQRCode.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.qrCode = action.payload.data
            })
            .addCase(fetchQRCode.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    removeSuccessMessage,
} = qrCodeSlice.actions
export default qrCodeSlice.reducer

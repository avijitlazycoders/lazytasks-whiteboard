import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getProjectWhiteboard,
    addProjectWhiteboard,
    addWhiteboardComment,
    getWhiteboardComments,
    removeWhiteboardComments,
    editWhiteboardComment,
    removeWhiteboardAllComments
} from "../../../services/WhiteboardService";

export const fetchProjectWhiteboard = createAsyncThunk(
    'projects/fetchProjectWhiteboard',
    async (id) => {
        return getProjectWhiteboard(id);
    }
)

export const saveProjectWhiteboard = createAsyncThunk(
    'projects/saveProjectWhiteboard', 
    async ({id, data}) => {
        return addProjectWhiteboard(id, data);
    }
)

export const saveWhiteboardComment = createAsyncThunk(
    'projects/saveWhiteboardComment', 
    async ({id, data}) => {
        return addWhiteboardComment(id, data);
    }
)

export const fetchWhiteboardComments = createAsyncThunk(
    'projects/fetchWhiteboardComments',
    async (id) => {
        return getWhiteboardComments(id);
    }
)

export const deleteWhiteboardComments = createAsyncThunk(
    'projects/deleteWhiteboardComments',
    async ({ id, data }) => {
        return removeWhiteboardComments(id, data);
    }
)

export const deleteWhiteboardAllComments = createAsyncThunk(
    'projects/deleteWhiteboardAllComments',
    async ({ id, data }) => {
        return removeWhiteboardAllComments(id, data);
    }
)

export const updateWhiteboardComment = createAsyncThunk(
    'projects/updateWhiteboardComment', 
    async ({id, data}) => {
        return editWhiteboardComment(id, data);
    }
)


const initialState = {
    licenseKey:'',
    isLoading: false,
    isError: false,
    isLicenseError: false,
    error: null,
    licenseSuccessMessage: null,
    projectWhiteboard:{},
    projectWhiteboardCopy:{},
    projectWhiteboardComments:[],
    loggedInUser: {},
}

const whiteboardSlice = createSlice({
    name: 'whiteboard',
    initialState,
    reducers: {
        removeSuccessMessage: (state) => {
            state.licenseSuccessMessage = null
        },
        removeErrorMessage: (state) => {
            state.error = ''
            state.isLicenseError = false
        },
        setLoggedInUser: (state, action) => {
            state.loggedInUser = action.payload
        },
        updateWhiteboardCopy: (state, action) => {
            state.projectWhiteboardCopy = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectWhiteboard.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchProjectWhiteboard.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboard = action.payload && action.payload.data 
            })
            .addCase(fetchProjectWhiteboard.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(saveProjectWhiteboard.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(saveProjectWhiteboard.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboard = action.payload.data
                state.projectWhiteboardCopy = action.payload.data
            })
            .addCase(saveProjectWhiteboard.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(saveWhiteboardComment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(saveWhiteboardComment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboardComments = action.payload.data
            })
            .addCase(saveWhiteboardComment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(fetchWhiteboardComments.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(fetchWhiteboardComments.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboardComments = action.payload && action.payload.data 
            })
            .addCase(fetchWhiteboardComments.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteWhiteboardComments.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteWhiteboardComments.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboardComments = action.payload && action.payload.data 
            })
            .addCase(deleteWhiteboardComments.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(deleteWhiteboardAllComments.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(deleteWhiteboardAllComments.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboardComments = action.payload && action.payload.data 
            })
            .addCase(deleteWhiteboardAllComments.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })
            .addCase(updateWhiteboardComment.pending, (state) => {
                state.isLoading = true
                state.isError = false
            })
            .addCase(updateWhiteboardComment.fulfilled, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.projectWhiteboardComments = action.payload && action.payload.data 
            })
            .addCase(updateWhiteboardComment.rejected, (state, action) => {
                state.isLoading = false
                state.isError = false
                state.error = action.error?.message
            })

    },
})
export const {
    removeSuccessMessage,
    removeErrorMessage,
    setLoggedInUser,
    updateWhiteboardCopy
} = whiteboardSlice.actions
export default whiteboardSlice.reducer

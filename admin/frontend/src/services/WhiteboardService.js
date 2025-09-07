import ApiService from './ApiService'

export const getProjectWhiteboard = async (id) => {
    try {
        const response = await ApiService.fetchData({
            url: `/whiteboard/projects/whiteboard/${id}`,
            method: 'get',
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export const addProjectWhiteboard = async (id, data) => {

    const response = await ApiService.fetchData({
        url: `/whiteboard/projects/whiteboard/edit/${id}`,
        method: 'put',
        data: data,
    })

    return response.data;
}

export const addWhiteboardComment = async (id, data) => {

    const response = await ApiService.fetchData({
        url: `/whiteboard/projects/whiteboard/comment/${id}`,
        method: 'post',
        data: data,
    })

    return response.data;
}

export const getWhiteboardComments = async (id) => {
    try {
        const response = await ApiService.fetchData({
            url: `/whiteboard/projects/whiteboard/comments/${id}`,
            method: 'get',
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export const removeWhiteboardComments = async (id, data) => {
    try {
        const response = await ApiService.fetchData({
            url: `/whiteboard/projects/whiteboard/delete/comments/${id}`,
            method: 'put',
            data: data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export const removeWhiteboardAllComments = async (id, data) => {
    try {
        const response = await ApiService.fetchData({
            url: `/whiteboard/projects/whiteboard/delete/all/comments/${id}`,
            method: 'put',
            data: data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export const editWhiteboardComment = async (id, data) => {
    try {
        const response = await ApiService.fetchData({
            url: `/whiteboard/projects/whiteboard/edit/comments/${id}`,
            method: 'put',
            data: data,
        })
        return response.data;
    } catch (error) {
        return error.message;
    }
}




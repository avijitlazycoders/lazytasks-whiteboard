import ApiService from './ApiService'
export const getQRCode = async () => {
    try {
        const response = await ApiService.fetchData({
            url: `/premium/qr-code`,
            method: 'get',
        })
        return response.data;

    } catch (error) {
        return error.message;
    }
}




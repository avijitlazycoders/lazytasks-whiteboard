import axios from 'axios'
import appConfig from '../configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '../constants/api.constant'
import deepParseJson from '../utils/deepParseJson'
// import store from '../store'
// import { onSignOutSuccess } from '../store/auth/sessionSlice'

const unauthorizedCode = [401]

const BaseService = axios.create({
    timeout: 60000,
    baseURL: appConfig.liveApiUrl,
})

BaseService.interceptors.request.use(
    (config) => {
        const rawPersistData = localStorage.getItem("admin")
        const persistData = deepParseJson(rawPersistData)
        const accessToken = persistData && persistData.auth?.session.token
        if (accessToken) {
            config.headers[
                REQUEST_HEADER_AUTH_KEY
            ] = `${TOKEN_TYPE}${accessToken}`
        }

        return config
    },
    (error) => {
        // store.dispatch(onSignOutSuccess())
        return Promise.reject(error)
    }
)

BaseService.interceptors.response.use(
    (response) =>{
       return  response
    },
    (error) => {
        const { response } = error
        switch (response.status) {

            case 401: {
                return Promise.reject(error)
            }

            // forbidden (permission related issues)
            case 403: {
                /*if(response.data.message ==='Expired token' || response.data.message === 'Token has expired'){
                    store.dispatch(onSignOutSuccess())
                    window.location = `${appLocalizer?.homeUrl}/lazytasks/#/lazy-login`;
                    return Promise.reject(error)
                    }*/
                console.log(error)
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error.response.data)
            }
            // expired token
            case 408: {
                // store.dispatch(onSignOutSuccess())
                // window.location = `${appLocalizer?.homeUrl}/lazytasks/#/lazy-login`;
                return Promise.reject(error.response.data)
            }

            // bad request
            case 400: {
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error)
            }

            // not found
            case 404: {
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error)
            }

            // conflict
            case 498: {
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error)
            }

            // unprocessable
            case 422: {
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error)
            }
            default: {
                // store.dispatch(onSignOutSuccess())
                return Promise.reject(error)
                // return Promise.reject(new APIError(err.message, 500));
            }
        }

    }
)

export default BaseService

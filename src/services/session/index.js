import * as api from './api';
import { AsyncStorage } from 'react-native'

// TODO: store the tokens response and start a setTimeOut with the expire time of the token to refresh it
const onRequestSuccess = (response) => {
    return api.storeJwt(response)
}

export const authenticate = (token) => api.authenticate(token)
    .then(onRequestSuccess)

export const refreshToken = () => {
    console.log("refreshing token ...")
    return AsyncStorage.getItem('refresh_token').then((value)=>{
        if(!value){
            return Promise.reject();
        }
        console.log("I got a value ...")
        return api.refresh(value)
        .then(onRequestSuccess)
    })
    
} 

export const clearSession = async () => {
    await AsyncStorage.clear()
    // TODO: delete all the information about the user and already stored data
}

export const revoke = () => {
    return api.revoke().then(clearSession)
}
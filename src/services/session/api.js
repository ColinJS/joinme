import { fetchApi } from "../api";
import config from "../api/config";
import { AsyncStorage } from 'react-native';

const endPoint = {
    authenticate: '/auth/convert-token',
    revoke: '/auth/invalidate-sessions',
    refresh: '/auth/token'
}

export const authenticate = (token) =>{
    return fetchApi(endPoint.authenticate, {
        "grant_type": "convert_token",
        "client_id": config.clientId,
        "token": token.toString(),
        "backend": "facebook",
    }, 'post', {}, true)
} 

export const refresh = (token) =>{
    return fetchApi(endPoint.refresh, {
        "grant_type": "refresh_token",
        "client_id": config.clientId,
        "refresh_token": token.toString(),
    }, 'post', {}, true)
} 

export const revoke = () => fetchApi(endPoint.revoke,{
    "client_id": config.clientId,
}, 'post', {})

export const storeJwt = async (jwt) => {
    let time = Math.round(new Date().getTime() / 1000)
    console.log("time: "+time)
    let jwtSerializer = [
        ['access_token', jwt.access_token],
        ['refresh_token', jwt.refresh_token],
        ['expires_in', jwt.expires_in.toString()],
        ['created', time.toString()]
    ]
    console.log(jwtSerializer)
    try{
        await AsyncStorage.multiSet(jwtSerializer,(error)=> {console.log(error)});
    }catch(error){
        console.log(error)
    }
}

export const getJwt = async () => {
    try{
        return AsyncStorage.multiGet(['access_token', 'refresh_token', 'expires_in'],(values) =>{
            console.log("getJwt values: "+values)
            if(values !== null){
                return {
                    'access_token': values[0][1],
                    'refresh_token': values[1][1],
                    'expires_in': values[2][1],
                }
            }else{
                return {}
            }
        }).catch()
    }catch(error){
        console.log("error: "+error)
    }
    return {}
}
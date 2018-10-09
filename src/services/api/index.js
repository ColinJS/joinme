import fetchival from 'fetchival';
import _ from 'lodash';
import apiConfig from './config';
import { AsyncStorage } from 'react-native'
import * as session from '../session'

const autoRefreshTest = async (noTimeRemainingCheck= false) => {
    const tokenTimeInfos = await AsyncStorage.multiGet(['expires_in','created'],)
    const tokenEndingTime = parseInt(tokenTimeInfos[1][1]) + parseInt(tokenTimeInfos[0][1])
    const now = new Date().getTime()
    const timeRemaining = now - tokenEndingTime

    if(!(isNaN(timeRemaining) || timeRemaining >= 300 || noTimeRemainingCheck)){
        return session.refreshToken().then(()=> true).catch(()=> false)
    }
    return true
}

const request = async (endPoint, payload, method, headers, refresh) => {
    console.log("request ...")

    const accessTokenFromStorage = await AsyncStorage.getItem('access_token')
    const accessToken = accessTokenFromStorage !== null && !refresh ? accessTokenFromStorage : false;
    console.log("get value: "+accessToken)

    let url = `${apiConfig.url}${endPoint}`
    console.log('url: '+url)

    return fetchival(url,{
        headers: _.pickBy({
            ...(accessToken ? {
                Authorization: `Bearer ${accessToken}`,
            } : {}),
            ...headers,
        }, item => !_.isEmpty(item)),
    })[method.toLowerCase()](payload);
}

export const fetchApi = async (endPoint, payload = {}, method = 'get', headers = {}, refresh= false) => {

    const autoRefresh = await autoRefreshTest(refresh)

    if(autoRefresh){
        return request(endPoint, payload, method, headers, refresh)
    }
    
}

export const sendFile = async (endPoint,payload) =>{
    
    const autoRefresh = await autoRefreshTest()
    if(!autoRefresh){return false}

    const accessToken = await AsyncStorage.getItem('access_token')
    
    const fileFormat = payload.uri.split('.')

    const data = new FormData()
    data.append('place_fn',payload.place.formatted_address.toString())
    data.append('place_id',payload.place.place_id.toString())
    data.append('duration_h',payload.duration.hours.toString())
    data.append('duration_m',payload.duration.minutes.toString())
    data.append('video',{
        uri: payload.uri,
        name: 'video_.'+fileFormat[fileFormat.length-1],
        type: 'multipart/form-data'
    })    

    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
        },
        body: data
    };

    url = `${apiConfig.url}${endPoint}`

    return fetch(`${apiConfig.url}${endPoint}`, config).then((res)=>res.json()).catch(e => console.warn(e))
}
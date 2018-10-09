import * as api from './api'
import { AsyncStorage } from 'react-native'
import { Permissions, Notifications } from 'expo'

export const create = async () => {
    console.log("create user ...")
    let userInfo = []
    let req = await api.create().then((json)=>{
        userInfo = [
            ['id',json.id.toString()],
            ['first_name',json.first_name.toString()],
            ['last_name',json.last_name.toString()],
            ['avatar',json.avatar.toString()],
        ]
        console.log(userInfo)
        
    })
    return await AsyncStorage.multiSet(userInfo)
}

export const getUserInfo = async () => {
    const userInfo = await AsyncStorage.multiGet(['id','first_name','last_name','avatar']).then((response)=>{
        return {
            'id': response[response.findIndex((i)=> i[0] == 'id')][1],
            'first_name': response[response.findIndex((i)=> i[0] == 'first_name')][1],
            'last_name': response[response.findIndex((i)=> i[0] == 'last_name')][1],
            'avatar': response[response.findIndex((i)=> i[0] == 'avatar')][1],
        }
    })
    return userInfo
}

export const getFriends = async (eventId) => {
    const friendsInfo = await api.getFriends(eventId).then((json)=>{
        console.log(json)
        return json
    })
    return friendsInfo
}

export const addFriend = async (friendId) => {
    return await api.addFriend(friendId)
}


export const getMyInfos = async () => {
    return api.getMyInfos()
}

export const getUsers = async (noFriends=false, searchedText="") => {
    queryParams = searchedText !== "" ? "?search="+searchedText.toString() : ""
    queryParams += noFriends && queryParams !== "" ? "&filter=no-friends" : "?filter=no-friends"
    console.log(queryParams)
    return await api.getUsers(queryParams)
}

// TODO: Split the event part to another module event
export const sharingEvent = async (id, friends) => {
    return await api.sharingEvent(id, friends)
}

export const getEvents = async () => {
    return await api.getEvents()
}

export const getEventDetails = async (event_id) => {
    return await api.getEventDetails(event_id)
}

export const deleteEvent = async (event_id) => {
    return await api.deleteEvent(event_id)
}

export const changeStateEvent = async (event_id, state) => {
    return await api.changeStateEvent(event_id, state)
}

export const askPresignedUrl = async (filename) => {
    console.log(`- askPreSignedUrl filename: ${filename}`)
    let filenameSplitted = filename.split('.')
    let fileExtension = filenameSplitted[filenameSplitted.length - 1]
    console.log(`- askPreSignedUrl filename extension: ${fileExtension}`)

    if(fileExtension !== "mp4" && fileExtension !== "mov"){
        console.log("error: wrong extension")
        return false
    }

    return await api.askPresignedUrl(filename)
}

export const createEvent = async (videoUrl, friendsList, place, duration, isPublic) => {
    let payload = {
        "video": videoUrl,
        "friends": friendsList,
        "place": place,
        "duration": duration,
        "public": isPublic,
    }
    return await api.createEvent(payload)
}

export const registerPushNotification = async ()=>{
    const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
    
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
    
      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return;
      }
    
      // Get the token that uniquely identifies this device
      let token = await Notifications.getExpoPushTokenAsync();
      console.log(`Notification token: ${token}`)
    
      // POST the token to your backend server from where you can retrieve it to send push notifications.
      return await api.registerPushNotification(token);
}
import { fetchApi } from "../../services/api";

const endPoint = {
    create: '/api/init',
    user: '/api/users',
    friends: '/api/friends',
    share: '/share',
    events: '/api/events',
    signs3: '/api/sign_s3',
    me: '/api/me',
}

export const create = () => fetchApi(endPoint.create)

export const getFriends = (eventId) => fetchApi(`${endPoint.friends}?event_id=${eventId}`)

export const addFriend = (friendId) => fetchApi(endPoint.friends,{'friend_id': friendId},'post')

export const getUsers = (parameters) => fetchApi(`${endPoint.user}${parameters}`)

export const sharingEvent = (id, friends) => fetchApi(`/api/${id}${endPoint.share}`,friends,'put')

export const getEvents = () => fetchApi(endPoint.events)

export const getEventDetails = (event_id) => fetchApi(`${endPoint.events}/${event_id}`)

export const deleteEvent = (event_id) => fetchApi(`${endPoint.events}/${event_id}`,{},'delete')

export const changeStateEvent = (event_id, state) => fetchApi(`${endPoint.events}/${event_id}`,{"coming": state},'put')

export const askPresignedUrl = (filename) => fetchApi(`${endPoint.signs3}?filename=input/${filename}&filetype=video/*`)

export const createEvent = (payload) => fetchApi(`${endPoint.events}`,payload,'post')

export const registerPushNotification = (token) => fetchApi(endPoint.create,{"notification_key": token},'post')

export const getMyInfos = () => fetchApi(endPoint.me)
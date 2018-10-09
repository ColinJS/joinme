import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { Platform } from 'react-native'

import HomeScreen from './src/screens/Home'
import FriendsScreen from './src/screens/Friends'
import LoginScreen from './src/screens/Login'
import CreateEventScreen from './src/screens/EventCreate'
import EventDetailsScreen from './src/screens/EventDetails'
import MySplashScreen from './src/screens/Splash'
import PlaceScreen from './src/screens/Place'
import UserDetailsScreen from './src/screens/UserDetails'
import AddFriendsScreen from './src/screens/AddFriends'


const AppStack = createStackNavigator(
  {
    HomePage:{
      screen: HomeScreen,
      path: 'joinme/home',
      navigationOptions:{
        header: null
      }
    },
    FriendsPage: {
      screen: FriendsScreen,
      path: 'joinme/friends'
    },
    AddFriendsPage: {
      screen: AddFriendsScreen,
      path: 'joinme/add-friends'
    },
    UserDetailsPage: {
      screen: UserDetailsScreen,
      path: 'joinme/user-details'
    },
    CreateEventPage: {
      screen: CreateEventScreen,
      path: 'joinme/create-event',
      navigationOptions:{
        header: null
      }
    },
    EventDetailsPage: {
      screen: EventDetailsScreen,
      path: 'joinme/event-details/:event_id',
      navigationOptions:{
        header: null
      }
    },
    SplashPage: {
      screen: MySplashScreen,
      path: 'joinme/splash',
      navigationOptions:{
        header: null
      }
    },
    PlacePage: {
      screen: PlaceScreen,
      path: 'joinme/place',
    },
  }
)


const LoginStack = createStackNavigator(
  {
    LoginPage: {
      screen: LoginScreen,
      path: 'joinme/login',
      navigationOptions:{
        header: null
      }
    }
  }
)

export default  createSwitchNavigator(
  {
    SplashPage: MySplashScreen,
    App: AppStack,
    Login: LoginStack,
  },
  {
    initialRoute: 'SplashPage',
  }
)

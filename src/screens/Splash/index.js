import React from 'react';
import { StyleSheet, Image, View, AsyncStorage } from 'react-native';
import { ScreenOrientation} from 'expo'
import { refreshToken } from '../../services/session';

export default class MySplashScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      initialRoute: null,
    };
  }
  componentDidMount(){
    this.autoLogin();
    ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT)
  }

  autoLogin(){
    AsyncStorage.getItem('access_token').then((value)=>{
      if(value){
        console.log("access token: "+value)
        refreshToken().then(()=>{
          console.log("HomePage")
          this.props.navigation.navigate('App')
        }).catch(()=>{
          console.log("LoginPage")
          this.props.navigation.navigate('Login')
        })
      }else{
        this.props.navigation.navigate('Login')
      }
      
    }).catch()
  }

  loggedIn = () =>{
    console.log("init success ...")
    this.props.navigation.navigate('App')
  }

  render() {
    return (
        <View style={styles.container}>
            <Image 
              source={require("./assets/splash.png")}
              style={{height: '100%', width: '100%'}}
              resizeMode= "cover"
            />
        </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
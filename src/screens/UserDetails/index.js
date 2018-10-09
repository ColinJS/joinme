import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import * as user from '../../data/users'
import * as session from '../../services/session'

const that = 'Header function helper';

export default class UserDetailsScreen extends React.Component {

  static navigationOptions = (()=>({
      title: 'My informations',
    })
  )

  constructor(props){
    super(props)
    this.state = {
        'first_name':'',
        'last_name':'',
        'email':'',
        'avatar':'http://joinme.com/nothing',
    }
    user.getMyInfos().then((data)=>{
        if(data){
            console.log(data)
            this.setState(data)
        }
    })
  }

  logOut = () => {
    session.clearSession()
    this.props.navigation.navigate('LoginPage')
  }

  render() {
    const {first_name, last_name, email, avatar} = this.state
    return (
      <View style={styles.container}>
        <View style={styles.imageInfos}>
            <View style={styles.avatarImageContainer}>
                <Image
                    source={{uri: avatar}}
                    style={styles.avatarImage}
                />
            </View>
        </View>
        <View style={styles.contentInfos}>

            <View style={styles.infosCategory}>
                <TouchableOpacity style={styles.textContainer} onPress={()=>{this.props.navigation.navigate('AddFriendsPage')}}>
                    <Text style={styles.textInfos}>Add Friends</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infosCategory}>
                <View style={styles.textContainer}>
                    <Text style={styles.textInfos}>{first_name} {last_name}</Text>
                </View>
            </View>
            <View style={styles.infosCategory}>
                <View style={styles.textContainer}>
                    <Text style={styles.textInfos}>{email}</Text>
                </View>
            </View>
            <View style={styles.infosCategory}>
                <TouchableOpacity style={styles.buttonLogout} onPress={()=>{this.logOut()}}>
                    <Text>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
        
        

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  avatarImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: 120,
    borderRadius: 100,
    overflow: 'hidden',
  },
  avatarImage: {
    height: 120,
    width: 120,
  },
  infosCategory: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
  },
  textContainer: {
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {width: 0, height:0},
    shadowRadius: 1,
    shadowColor: '#D3D3D3',
    shadowOpacity: 0.5,
  },
  textInfos: {
      fontSize: 18,
  },
  imageInfos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfos: {
    flex: 2,
    paddingVertical: 10,
    width: '100%',
  },
  buttonLogout:{
      width: '100%',
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      shadowOffset: {width: 0, height:0},
      shadowRadius: 1,
      shadowColor: '#D3D3D3',
      shadowOpacity: 0.5,
  },
});
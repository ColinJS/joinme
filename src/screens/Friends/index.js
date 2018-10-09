import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import * as user from '../../data/users'
import { MaterialIcons } from '@expo/vector-icons'
import SearchBar from '../../components/SearchBar'
import * as api from '../../services/api';

String.prototype.removeAccent = function() {
  return this.replace(/[ùûü]/g,"u").replace(/[îï]/g,"i").replace(/[àâä]/g,"a").replace(/[ôö]/g,"o").replace(/[éèêë]/g,"e").replace(/ç/g,"c");
}

const that = 'Header function helper';
const TIME_DEBOUNCE = 150

class FriendItem extends React.PureComponent {

  constructor(props){
    super(props)
    this.state={
      state: this.props.state,
    }
  }

  _onPress = () => {
    this.props.onPressItem(this.props.id)
    this.setState({state: (this.state.state === 'unchecked' ? 'checked' : 'unchecked')})
  }

  render(){
    const { first_name, last_name, source } = this.props
    return (
    <TouchableOpacity onPress={this._onPress}>
      <View style={styles.listItem}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.listItemAvatar}
          source={source}
        />
      </View>
          <Text style={styles.listItemTitle}>{first_name} {last_name}</Text>
        <MaterialIcons name={`radio-button-${this.state.state}`} size={30} color="grey"/>
      </View>
    </TouchableOpacity>
    )

  }
}

export default class FriendsScreen extends React.Component {

  static navigationOptions = (({navigation, actionButtonTitle})=>({
      title: 'Invite Guests',
      headerRight:(
        <TouchableOpacity style={{marginRight: 20}} onPress={()=>{that.sendEvent()}}>
          <Text>{navigation.getParam('actionTitle', 'Send')}</Text>
        </TouchableOpacity>
      )
    })
  )

  constructor(props){
    super(props)
    let durationDate = this.props.navigation.getParam('duration',new Date(0,0,0,3,0,0,0))
    this.state = {
      publicState: 'unchecked',
      sharedState: 'unchecked',
      friends: [],
      event: {
        uri: this.props.navigation.getParam('video','').uri,
        duration: {hours: durationDate.getHours(), minutes: durationDate.getMinutes()},
        place: this.props.navigation.getParam('place',{'formatted_address': '', 'place_id': ''})
      }
    }
    console.log(this.state.event)
  }

  componentDidMount(){

    let eventFilter = this.props.navigation.getParam('filter', -1)
    user.getFriends(eventFilter).then((res)=>{
      res.friends.forEach((element) => {
        element.state='unchecked'
      });
      this.friends = res.friends
      this.setState({
        friends: res.friends
      })
    })

  }

  sendEvent = () => {
    
    let friends = this.friends
    let guests = []
    for(i=0; i<friends.length; i++){
      friends[i].state === 'checked' && guests.push({'id':friends[i].id})
    }
    let isShared = this.state.sharedState === 'checked'
    let isPublic = false
    console.log('First Share: '+ isShared)
    this.props.navigation.state.params.onNavigationBack(guests, isPublic, isShared)
    this.props.navigation.goBack()
    
  }

  toggleFriendState = (id) =>{

    console.log('friend list')
    console.log(this.friends)
    this.friends.forEach(element => {
      if(element.id === id){
        console.log("Now check it !")
        element.state = element.state === 'unchecked' ? 'checked' : 'unchecked'
      }
    });
    console.log(this.friends)
  }

  toggleShareState = () => {
    this.setState({
      sharedState: this.state.sharedState === 'checked' ? 'unchecked' : 'checked'
    })
  }

  formatedString(text){
    return text.toString().toLowerCase().removeAccent()
  }

  _handleTextChange = (text) => {
    let now = Date.now()
      if(this.oldTimeStamp && now - this.oldTimeStamp <= TIME_DEBOUNCE){
        this.oldTimeStamp = now
        clearTimeout(this.debounceFunc)
        this.debounceFunc = setTimeout(() => {
          let friends = this.friends.filter((value, index)=>{
            return (this.formatedString(value.first_name).includes(this.formatedString(text)) || this.formatedString(value.last_name).includes(this.formatedString(text)))
          })
          this.setState({friends: friends})
        },TIME_DEBOUNCE)
      }else{
        this.oldTimeStamp = now
        this.debounceFunc = setTimeout(() => {
          let friends = this.friends.filter((value, index)=>{
            return (this.formatedString(value.first_name).includes(this.formatedString(text)) || this.formatedString(value.last_name).includes(this.formatedString(text)))
          })
          this.setState({friends: friends})
        },TIME_DEBOUNCE)
      }
    
  }

  _keyExtractor = (item, index) => item.id.toString()

  _renderItem = ({item}) => {
    return  <FriendItem
              id={item.id}
              first_name={item.first_name}
              last_name={item.last_name}
              source={{uri: item.avatar}}
              onPressItem={this.toggleFriendState}
              state={item.state}
            />
  }

  render() {
    that = this
    return (
      <View style={styles.container}>
          <TouchableOpacity  style={styles.sharedContainer} onPress={this.toggleShareState}>
            <View style={styles.sharedBanner}>
              <Text style={styles.sharedText}>Share on other apps.</Text>
              <MaterialIcons name={`radio-button-${this.state.sharedState}`} size={30} color="white"/>
            </View>
          </TouchableOpacity>
          <SearchBar 
            onChangeText={(text)=>{this._handleTextChange(text)}}
          />
          { this.state.friends.length > 0 ?
            <FlatList
              data={this.state.friends}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            /> :
            <View style={{flex: 6, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20}}>
              <Text>Your facebook friends who have JoinMe will appear here.</Text>
            </View>
          }
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sharedContainer: {
    height: 50
  },
  sharedBanner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#7B4FEC'
  },
  sharedText: {
    color: 'white'
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 5,
    paddingTop: 5
  },
  listItemAvatar: {
    width:60,
    height:60,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width:60,
    height:60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginRight: 20,
    overflow: 'hidden',
  }
});
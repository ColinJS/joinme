import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import * as user from '../../data/users'
import SearchBar from '../../components/SearchBar'

const that = 'Header function helper';
const TIME_DEBOUNCE = 300

class UserItem extends React.PureComponent {

  constructor(props){
    super(props)
  }

  _onPress = () => {
    this.props.onPressItem(this.props.id)
  }

  render(){
    const { first_name, last_name, source } = this.props
    return (
    <View>
      <View style={styles.listItem}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.listItemAvatar}
            source={source}
          />
        </View>
        <Text style={styles.listItemTitle}>{first_name} {last_name}</Text>
        <TouchableOpacity style={styles.addFriendButton} onPress={this._onPress}>
          <Text style={styles.addFriendButtonText}>Add friend</Text>
        </TouchableOpacity>
      </View>
    </View>
    )

  }
}

export default class AddFriendsScreen extends React.Component {

  static navigationOptions = (({navigation, actionButtonTitle})=>({
      title: 'Add Friends',
      headerRight:(
        <TouchableOpacity style={{marginRight: 20}} onPress={()=>{that.props.navigation.goBack()}}>
          <Text>Done</Text>
        </TouchableOpacity>
      ),
    })
  )

  constructor(props){
    super(props)
    this.state = {
      users: [],
    }
  }

  componentDidMount(){

    let friendsFilter = this.props.navigation.getParam('filter', []).map(item=>item.id)
    this.getUsers("")
  }

  getUsers = (searchText)=>{
    user.getUsers(true,searchText).then((res)=>{
      this.setState({
        users: res.users
      })
    })
  }

  addFriend = (id) =>{
    user.addFriend(id).then(()=>{
      users = this.state.users.filter((val,ind)=>{
        return val.id != id
      })
      this.setState({users: users})
    })
  }

  _handleTextChange = (text) => {
      let now = Date.now()
      if(this.oldTimeStamp && now - this.oldTimeStamp <= TIME_DEBOUNCE){
        this.oldTimeStamp = now
        clearTimeout(this.debounceFunc)
        this.debounceFunc = setTimeout(() => {
          this.getUsers(text)
          console.log('text: '+text)
        },TIME_DEBOUNCE)
      }else{
        this.oldTimeStamp = now
        this.debounceFunc = setTimeout(() => {
          this.getUsers(text)
          console.log('text: '+text)
        },TIME_DEBOUNCE)
      }
  }

  _keyExtractor = (item, index) => item.id.toString()

  _renderItem = ({item}) => {
    return  <UserItem
              id={item.id}
              first_name={item.first_name}
              last_name={item.last_name}
              source={{uri: item.avatar}}
              onPressItem={this.addFriend}
            />
  }

  render() {
    that = this
    return (
      <View style={{flex: 1}}>
        <SearchBar
          onChangeText={text=>{this._handleTextChange(text)}}
        />
        { this.state.users.length > 0 &&
          <FlatList
            data={this.state.users}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          /> 
        }
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  isPublicEvent: {
    flex: 1,
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#7B4FEC'
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
    width:40,
    height:40,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width:40,
    height:40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginRight: 20,
    overflow: 'hidden',
  },
  addFriendButton: {
    backgroundColor: '#7a50ec',
    borderRadius: 2,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  addFriendButtonText: {
    color: "white",
  }
});
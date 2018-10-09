import React from 'react';
import { Linking, StyleSheet, View, Text, TouchableOpacity, FlatList, Clipboard, Alert, Share } from 'react-native';
import { Amplitude, Constants, BlurView } from 'expo';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as user from '../../data/users';
import _ from 'lodash'
import Avatar from '../../components/Avatar';
import VideoComponent from '../../components/VideoComponent';
import JoinMe from '../../components/JoinMe'

const HOURS_DEFAULT_DURATION = 3;
const MIN_DEFAULT_DURATION = 0;

export default class EventDetailsScreen extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      showDetails: false,
      eventDuration: new Date(0,0,0,HOURS_DEFAULT_DURATION, MIN_DEFAULT_DURATION,0,0),//date de 3h
      place: {'formatted_address': 'Address not found', 'place_id': ''},
      guests: [],
      creator: {is_me:false}, 
      showOptions: false,
    }
    
  } 

  pad(number){
    return ("0" + number.toString()).slice(-2)
  }
  
  componentDidMount(){
    user.getEventDetails(this.props.navigation.getParam('event_id')).then((res)=>{
      Amplitude.logEvent("User watches an event")
      let date = new Date()
      let ending_date = new Date(res.ending_date)
      let remaining_time = new Date(ending_date - date)
      let remaining_time_UTC = new Date(remaining_time.getUTCFullYear(), remaining_time.getUTCMonth(), remaining_time.getUTCDate(), remaining_time.getUTCHours(), remaining_time.getUTCMinutes(), remaining_time.getUTCSeconds())
      this.setState({
        eventDuration: remaining_time_UTC,
        place: res.place,
        guests: res.guests,
        creator: res.creator
      })
    })
  }

  _mountVideo = component => {
    this._video = component;
  }

  changeMyDisplayedState = (newState) => {
    Amplitude.logEvent("User changes status")
    let my_infos = this.props.navigation.getParam('my_infos',{})
    let tmpGuests = this.state.guests.map((value, index) => {
      if(value.id == my_infos.id){
        value.state = newState
      }
      return value
    })
    this.setState({guests: tmpGuests})
  }

  notComingTo = () => {
    this.changeMyDisplayedState(2)
    Alert.alert(
      "You're not joining.",
      '',
      [
        {text: 'Ok', onPress: () => console.log("Haven't joined !")},
      ],
      { cancelable: true }
    )
    user.changeStateEvent(this.props.navigation.getParam('event_id'), 2).then((res)=>console.log(res))
  }


  comingTo = () => {
    this.changeMyDisplayedState(1)
    Alert.alert(
      "You've joined!",
      '',
      [
        {text: 'Ok', onPress: () => console.log("joined !")},
      ],
      { cancelable: true }
    )
    user.changeStateEvent(this.props.navigation.getParam('event_id'), 1).then((res)=>console.log(res))
  }

  _keyExtractor = (item, index) => item.id.toString()

  _renderItem = ({item}) =>
    <View style={styles.guests}>
      <Avatar
        style={styles.guestAvatar}
        source={item.avatar}
        displayDot={(item.state === 1 || item.state === 2)}
        dotColor={item.state === 1 ? 'green' : 'red'}
      />
      <View style={styles.inboxInfos}>
        <Text style={[styles.inboxName, styles.shadowedIcons]}>{item.first_name}</Text>
      </View>
    </View>
  

  renderViewModeDetailsPopUp = () => {
    const { eventDuration, place } = this.state

    return (
    <View style={styles.detailsPopUp}>
      {this.state.guests.length > 0 && 
      <FlatList style={{flex: 3, width: '80%'}}
        data={this.state.guests}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        horizontal={true}
      />}
      
      <Text style={[{flex:1, fontSize: 35,color: 'white'}, styles.shadowedIcons]}>For another <Text style={{color: 'red', fontStyle: 'italic'}}>{`${eventDuration.getHours()}h${this.pad(eventDuration.getMinutes())}`}</Text></Text>
      <TouchableOpacity onPress={()=>this.openMaps(place)} style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <Text adjustsFontSizeToFit allowFontScaling style={[{flex:1 ,textAlign: 'center', color: 'white', textDecorationLine: 'underline', width: '90%'}, styles.shadowedIcons]}>{place.formatted_address}</Text>
      </TouchableOpacity>
      <View style={styles.viewModeButtonStyle}>
        {!this.state.creator.is_me && <TouchableOpacity style={styles.joinButton}>
          <View style={styles.buttonStyleView}>
            <Ionicons name="ios-close" size={40} color="red" onPress={this.notComingTo} />
          </View>
          <Text style={{color: 'white'}}>Can't join</Text>
        </TouchableOpacity>}
        <TouchableOpacity style={styles.joinButton}>
          <View style={[styles.buttonStyleView, {height: 60, width: 60}]}>
            <Ionicons style={{marginBottom: 3}} name="ios-share-alt" size={50} color="#7B4FEC" onPress={this.shareEvent} />
          </View>
          <Text style={{color: 'white'}}>Share</Text>
        </TouchableOpacity>
        {!this.state.creator.is_me && <TouchableOpacity style={styles.joinButton}>
          <View style={styles.buttonStyleView}>
            <Ionicons name="ios-heart" size={35} color="#72ca97" onPress={this.comingTo} />
          </View>
          <Text style={{color: 'white'}}>Join !</Text>
        </TouchableOpacity>}
      </View>
    </View>    
    )
  }

  shareEvent = () => {
    this.props.navigation.navigate('FriendsPage',{
      filter: this.props.navigation.getParam('event_id'),
      actionTitle: 'Share',
      onNavigationBack: this.sharingEvent,
    })
  }
  
  sharingEvent = (friendsList, isPublic, isShared) => {
    let event_id = this.props.navigation.getParam('event_id')
    Amplitude.logEvent("User shares the event")
    if(friendsList && friendsList.length > 0){
      user.sharingEvent(event_id,{friends : friendsList})
    }
    console.log("Share :"+isShared)
    if(isShared){
      let place = this.state.place.formatted_address !== "Address not found" ? `at ${this.state.place.formatted_address}` : ""

      Share.share({
        title: 'JoinMe',
        message: `JoinMe ${place} for another ${this.state.eventDuration.getHours()} hours\rhttps://joinmeapi-dev.herokuapp.com/api/events/${event_id}/web`,
        url: `https://joinmeapi-dev.herokuapp.com/api/events/${event_id}/web`
      },{
        dialogTitle: 'Share your event',
      })
    }

  }

  openMaps(place){
    Clipboard.setString(place.formatted_address)
    gm_Url = `https://www.google.com/maps/dir/?api=1&destination=${place.formatted_address}&destination_place_id=${place.place_id}&travelmode=walking`
    console.log(gm_Url)
    Linking.openURL(gm_Url)
  }

  replayVideo = () => {
    this.setState({
      showDetails: false,
    })
    this._video.replayAsync()
  }

  showPopUp = ()=>{
    this.setState({showOptions: !this.state.showOptions})
  }

  _NavigateBack = ()=>{
    Amplitude.logEvent("User navigates back")
    this._video.pauseAsync()
    this.props.navigation.goBack()
  }

  renderTopBar = () => (
    <View style={styles.topBar} pointerEvents='box-none'>
      <TouchableOpacity onPress={this._NavigateBack}>
        <Ionicons style={styles.shadowedIcons} name="ios-close" size={50} color="white" />
      </TouchableOpacity>
      {this.state.creator.is_me && 
      <TouchableOpacity onPress={() => {this.showPopUp()}}>
        <Entypo style={styles.shadowedIcons} name="dots-three-horizontal" size={40} color="white" />
      </TouchableOpacity>
      }
      {!(this.state.creatorMode && this.state.showDetails) && false &&
      <TouchableOpacity style={styles.topBarRightButton} onPress={()=>{this.replayVideo()}}>
        <Ionicons style={[{marginLeft: 2},styles.shadowedIcons]} name="ios-play" size={25} color="white" />
      </TouchableOpacity>}
    </View>
  )

  _onVideoFinish = (playbackStatus) =>{
    if(playbackStatus.didJustFinish){
      Amplitude.logEvent("User watches the video until the end")
      this.setState({
        showDetails: true
      })
    }
  }

  _handleVideoTouch = () => {
    Amplitude.logEvent("User skip the video")
    this._video.pauseAsync()
    this.setState({
      showDetails: true
    })
  }

  deleteEvent = ()=>{
    this.setState({uploading: true})
    user.deleteEvent(this.props.navigation.getParam('event_id')).then(res => {
      this.props.navigation.goBack()
    })
  }

  render() {
    const { showDetails, showOptions } = this.state
    return (
        <View style={styles.container}>
            <VideoComponent 
              style={styles.video}
              source={this.props.navigation.getParam('uri','').uri ? this.props.navigation.getParam('uri','').uri : this.props.navigation.getParam('uri','')}
              onPlaybackStatusUpdate={this._onVideoFinish}
              ref={ref => {this._mountVideo(ref)}}
              shouldPlay
              onPress={this._handleVideoTouch}
            />
            <View style={styles.popUpContainer} pointerEvents='box-none'>
              {showDetails &&
              <BlurView style={[StyleSheet.absoluteFill, {flex:1, justifyContent: 'flex-end'}]} tint="dark" intensity={80} pointerEvents='box-none'>
                {this.renderViewModeDetailsPopUp()}
              </BlurView>
              }
              {this.renderTopBar()}
              <JoinMe width='70%' />
            </View>
            {showOptions &&
            <View style={styles.optionsPopUp}>
              <TouchableOpacity onPress={()=>{this.deleteEvent()}}>
                <Text>Delete</Text>
              </TouchableOpacity>
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
  optionsPopUp: {
    position: 'absolute',
    backgroundColor: 'white',
    overflow: 'hidden',
    borderRadius: 5,
    top: 70,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 20
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  topBarRightButton: {
    height: 30,
    width: 30,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatar: {
    height: 50,
    width: 50,
  },
  inboxInfos:{
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  inboxName: {
    color: 'white',
  },
  topBar: {
    flex: 0.15,
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight / 2,
    paddingLeft: Constants.statusBarHeight / 2,
    paddingRight: Constants.statusBarHeight / 2,
  },
  popUpContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'flex-start',
  },
  guests:{
    marginHorizontal: 5,
  },
  buttonStyleView: {
    height: 45,
    width: 45,
    paddingTop: 3,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    overflow: "visible",
  },
  detailsPopUp: {
    position: 'absolute',
    width: '100%',
    height: '65%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  viewModeButtonStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: "visible",
    marginBottom: 20,
  },
  joinButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "visible",
  },
  shadowedIcons:{
    textShadowOffset:{width:0, height:2},
    elevation: 2,
    shadowColor:'#000000',
    shadowOpacity:0.6,
    shadowRadius: 1,
    backgroundColor: '#0000',
  }
});
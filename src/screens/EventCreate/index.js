import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator, Share } from 'react-native';
import { Amplitude, Location, Permissions, Constants, BlurView } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import * as user from '../../data/users';
import Geocoder from 'react-native-geocoding';
import _ from 'lodash'
import VideoComponent from '../../components/VideoComponent';
import DatePicker from '../../components/DatePicker'
import JoinMe from '../../components/JoinMe'

const HOURS_DEFAULT_DURATION = 3;
const MIN_DEFAULT_DURATION = 0;

Geocoder.init('AIzaSyD19HDnpXHxK1xBQbPpkXqrfKyDPDlst6A');

export default class CreateEventScreen extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      showValidate: false,
      showDetails: false,
      eventDuration: new Date(0,0,0,HOURS_DEFAULT_DURATION, MIN_DEFAULT_DURATION,0,0),//date de 3h
      place: {'formatted_address': 'Address not found', 'place_id': ''},
      chosenDate: new Date(Date.UTC(0,0,0,HOURS_DEFAULT_DURATION, MIN_DEFAULT_DURATION,0,0)),
      uploadedVideoUrl: "",
      friendsList: [],
      friendsSelected: false,
      isPublic: false,
      isShared: false,
      uploading: false,
      showOptions: false,
    }
    
  }

  pad(number){
    return ("0" + number.toString()).slice(-2)
  }

  askForPreSignedUrl(filename){
    return user.askPresignedUrl(filename)
  }

  sendVideo = async (filepath) => {
    console.log("- sending a video to aws s3")
    console.log(`filepath: ${filepath}`)
    let filepathForExt = filepath.split('.')
    let fileExtension = filepathForExt[filepathForExt.length - 1]
    console.log(`file extension: ${fileExtension}`)

    if(fileExtension !== 'mp4' && fileExtension !== 'mov'){
      console.log('wrong extension')
      return false
    }

    let codeLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let twoLettersCode = codeLetters.charAt(_.random(codeLetters.length))+codeLetters.charAt(_.random(codeLetters.length))
    let filename = `video_${Date.now().toString()}${twoLettersCode}.${fileExtension}`
    console.log(`- filename : ${filename}`)
    let preSignedData = await this.askForPreSignedUrl(filename).then(res=>res)
    console.log("- get pre-signed data:")
    console.log(preSignedData)
    if(preSignedData === false){
      console.log('no data for presigned request')
      return false
    }
    console.log(preSignedData)
    const data = new FormData()
    for(key in preSignedData.data.fields){
      data.append(key, preSignedData.data.fields[key])
    }
    data.append('file',{
        uri: filepath,
        name: filename,
        type: 'video/*'
    })

    const config = {
        method: 'POST',
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: data
    };

    return fetch(preSignedData.data.url,config).then((res)=>{
      console.log("- sending the video")
      this.setState({
        uploadedVideoUrl: preSignedData.url
      })
      if(this.state.friendsSelected){
        console.log("- create the event")
        this.createEvent(preSignedData.url, this.state.friendsList, this.state.isPublic, this.state.isShared)
      }
    }).catch((err)=>{
      console.log('something went wrongs with the video request')
      console.log(err)
      return false
    })
  }

  createEvent = (videoUrl, friendsList, isPublic, isShared) => {

    let duration = {
      "hours": this.state.eventDuration.getHours(),
      "minutes": this.state.eventDuration.getMinutes()
    }

    user.createEvent(videoUrl,friendsList,this.state.place,duration, isPublic).then((res)=>{
      Amplitude.logEventWithProperties("User creates an event", {
        "video_url": videoUrl,
      })
      this.setState({uploading: false})
      if(isShared){
        let place = this.state.place.formatted_address !== "Address not found" ? `at ${this.state.place.formatted_address}` : ""
        Share.share({
          title: 'JoinMe',
          message: `JoinMe ${place} for another ${duration.hours} hours!\rhttps://joinmeapi-dev.herokuapp.com/api/events/${res.id}/web`,
          url: `https://joinmeapi-dev.herokuapp.com/api/events/${res.id}/web`
        },{
          dialogTitle: 'Share your event',
        })
      }
      this.props.navigation.navigate('HomePage');
    })

  }

  _handleNavigateBack = (friendsList, isPublic, isShared) => {
    console.log("navigation back: ")
    console.log("- setting new state")
    
    this.setState({
      uploading: true,
      isPublic: isPublic,
      isShared: isShared,
      friendsList: friendsList,
      friendsSelected: true,
    })
    console.log(`- video url: ${this.state.uploadedVideoUrl}`)
    if(this.state.uploadedVideoUrl !== ""){
      this.createEvent(this.state.uploadedVideoUrl, friendsList, isPublic, isShared)
    }
  }

  _handleNavigateBackFromAddress = (address) => {
    this.setState({
      place: address
    })
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, Location will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted'){
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
      return
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    this.setState({ location });

    Geocoder.from({lat: location.coords.latitude, lng: location.coords.longitude})
		.then(json => {
      let place = {
        'formatted_address': json.results[0].formatted_address,
        'place_id': json.results[0].place_id
      }
      this.setState({place: place})
		})
    .catch(error => console.warn(error));
    
  };

  _mountVideo = component => {
    this._video = component;
  }

  validateVideo = async () => {
    this.setState({showDetails: true},()=>{
      this._video.pauseAsync()
    })
    this.sendVideo(this.props.navigation.getParam('uri','').uri)
    this._datepicker.showDatePicker()
  }

  validateDuration = (date) => {
    this.setState({eventDuration: date, showDetails: true})
  }

  validateDetails = async () => {
    this.props.navigation.navigate('FriendsPage',{
      onNavigationBack: this._handleNavigateBack
    })
  }

  renderBottomBar = () => 
  <View style={styles.bottomBar}>
    <TouchableOpacity onPress={this.validateVideo} >
      <View style={styles.buttonStyle}>
        <Ionicons name="ios-arrow-forward" size={35} color="white"/>
      </View>
    </TouchableOpacity>
  </View>

  renderDetailsPopUp = () => {
    const { eventDuration, place } = this.state

    return (
      <View style={styles.detailsPopUp}>
        <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={()=>{this._datepicker.showDatePicker()}}>
          <Text style={[{fontSize: 35,color: 'white'}, styles.shadowedIcons]}>For another <Text style={{color: 'red', fontStyle: 'italic'}}>{`${eventDuration.getHours()}h ${this.pad(eventDuration.getMinutes())}`}</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={()=>{this.props.navigation.navigate('PlacePage',{onNavigationBack: this._handleNavigateBackFromAddress})}}>
          <Text adjustsFontSizeToFit allowFontScaling style={[{textAlign: 'center', color: 'white', textDecorationLine: 'underline', width: '90%'}, styles.shadowedIcons]}>{place.formatted_address}</Text>
        </TouchableOpacity>
        <View style={{width: '100%', flex:1, flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'flex-end', paddingBottom: 60, paddingRight: 40}}>
          <TouchableOpacity style={styles.createModeButton} onPress={this.validateDetails} >
            <View style={styles.buttonStyle}>
              <Ionicons style={{marginBottom: 1}} name="ios-arrow-forward" size={35} color="white"/>
            </View>
          </TouchableOpacity>
        </View>
      </View>    
    )
  }

  replayVideo = () => {
    this.setState({
      showDetails: false,
    })
    if(this.state.createMode){
      this.setState({
        showValidate: false
      })
    }
    this._video.replayAsync()
  }

  showToolsPopUp = ()=>{
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

      {!(this.state.creatorMode && this.state.showDetails) && false &&
      <TouchableOpacity style={styles.topBarRightButton} onPress={()=>{this.replayVideo()}}>
        <Ionicons style={[{marginLeft: 2},styles.shadowedIcons]} name="ios-play" size={25} color="white" />
      </TouchableOpacity>}
    </View>
  )


  render() {
    const { createMode, showValidate, showDetails, uploading } = this.state
    return (
        <View style={styles.container}>
            <VideoComponent 
              style={styles.video}
              source={this.props.navigation.getParam('uri','').uri ? this.props.navigation.getParam('uri','').uri : this.props.navigation.getParam('uri','')}
              ref={ref => {this._mountVideo(ref)}}
              shouldPlay
              isLooping
            />
            <View style={styles.popUpContainer} pointerEvents='box-none'>
              {
              (showDetails || showValidate) &&
              <BlurView style={[StyleSheet.absoluteFill, {flex:1, justifyContent: 'flex-end'}]} tint="dark" intensity={80} pointerEvents='box-none'>
                {showDetails && this.renderDetailsPopUp()}
              </BlurView>
              }
              <DatePicker 
                  chosenDate={this.state.chosenDate}
                  onValidate={(date) => {
                    this.validateDuration(date)
                  }}
                  ref={ref => this._datepicker = ref}
              />
              {!showDetails && this.renderBottomBar()}
              {this.renderTopBar()}
              <JoinMe width='70%' />
            </View>
            {
            uploading &&
            <BlurView style={[StyleSheet.absoluteFill,{flex:1, justifyContent: 'center', alignItems: 'center'}]} tint="dark" intensity={80} >
              <ActivityIndicator size="large" color="white" />
            </BlurView>
            }
        </View>

    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
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
  bottomBar: {
    position: 'absolute',
    width: '100%',
    height: 70,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingRight: 40,
    marginBottom: 40,
  },
  buttonStyle:{
    width: 40,
    height: 40,
    backgroundColor: '#72ca97',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingLeft: 3,
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
  createModeButton:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
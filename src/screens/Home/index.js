import React from 'react';
import { StyleSheet, View, TouchableOpacity, AppState, Alert } from 'react-native';
import * as user from '../../data/users'
import { Amplitude, Constants, Camera, Permissions, Linking } from 'expo'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Toast from '../../components/Toast'
import JoinMe from '../../components/JoinMe'
import BottomBar from './components/BottomBar'
import Inbox from './components/Inbox'

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
};

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const PRESS_RECORD_TRESHOLD = 550

export default class HomeScreen extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      hasVideoPermission: false,
      hasAudioPermission: false,
      flash: 'auto',
      type: 'back',
      recording: 'false',
      ratio: '16:9',
      ratios: [],
      cameraDisplay: true
    }
    this.appState = AppState.currentState
    this.pressTimeStamp = 0
    this.justPress = false
  }

  async componentWillMount() {
    const { status: status_video } = await Permissions.askAsync(Permissions.CAMERA);
    const { status: status_audio } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const { status: status_notification } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    this.setState({ hasVideoPermission: status_video === 'granted', hasAudioPermission: status_audio === 'granted' });
    this.props.navigation.addListener("didBlur",payload=>{
      this.state.inbox && this.toggleInbox()
    })
    AppState.addEventListener('change', this._handleStateChange);
    Linking.addEventListener('url', (res)=>{this._handleDeepLinking(res.url)})
    Linking.getInitialURL().then(res=>{this._handleDeepLinking(res)})
  }
  
  componentDidMount(){
    user.registerPushNotification()
    Amplitude.initialize("45eb72f2bca51d02ce3f97cf82127857")
    user.getMyInfos().then(res =>{
      this.my_infos = res
      Amplitude.setUserId(res.id.toString())
      Amplitude.setUserProperties({
        "first_name": res.first_name,
        "last_name": res.last_name
      })
    })
  }

  componentWillUnmount(){
    Linking.removeEventListener('url');
  }

  _handleDeepLinking(url){
    if(url && url !== ''){
      console.log('Deep Link: ')
      Alert.alert(url)
      const { path, queryParams } = Linking.parse(url)
      Alert.alert(path)
      const { navigate } = this.props.navigation;
      const route = path.replace(/.*?:\/\//g, '');
      const id = route.match(/\/([^\/]+)\/?$/)[1];
      const routeName = route.split('/')[1];
    
      if (routeName === 'event') {
        user.getEventDetails(id).then(res=>{
          navigate('People', 'EventDetailsPage',{
            event_id: id, 
            uri: res.video_url, 
            my_infos: this.my_infos
          })
        })
        
      };
    }
    
  }

  _handleStateChange = (nextAppState)=>{
    if (this.appState.match(/active/) && (nextAppState === 'background' || nextAppState === 'inactive')) {
      this.setState({cameraDisplay: false})
    }
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({cameraDisplay: true})
    }
    this.appState = nextAppState;
  }

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleInbox = () => {
    this.setState({ inbox: !this.state.inbox })
    this._inbox.toggleInbox()
    this._title.toggleTitle()
    this._bottomBar.toggleBottomBar()
  }

  startRecording = async () => {
    if (this.camera) {
      this.pressTimeStamp = Date.now()
      this.justPress = true
      this.camera.recordAsync().then(res => this.onVideoSaved(res).catch())
      return true
    }
  }

  stopRecording = async () => {
    if (this.camera) {
      let timeStamp = Date.now()
      console.log(`${timeStamp} - ${this.pressTimeStamp} TimeStamp diff: ${timeStamp - this.pressTimeStamp}`)
      if(timeStamp - this.pressTimeStamp >= PRESS_RECORD_TRESHOLD){
        this.justPress = false
      }
      this.camera.stopRecording()
    }
  }

  onVideoSaved = async video =>{
    if(this.justPress){
      this.justPress= false
      console.log('Not long enough')
      Amplitude.logEvent("User records a video without success: press not long enough")
    }else{
      Amplitude.logEvent("User records a video with success")
      this.props.navigation.navigate('CreateEventPage',{uri: video, createMode: true, my_infos: this.my_infos})
    }
  }

  renderTopBar = () => 
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons style={styles.shadowedIcons} name={flashIcons[this.state.flash]} size={25} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons style={styles.shadowedIcons} name="ios-reverse-camera" size={30} color="white" />
      </TouchableOpacity>
    </View>

  // TODO: split the camera to a component
  renderCamera = ()=>{
    if(this.state.hasVideoPermission){
      return (
      <View style={{flex:1}}>
        <Camera
          ref={ref=>{
            this.camera = ref
          }}
          style={styles.camera}
          autoFocus={true}
          flashMode={this.state.flash}
          type={this.state.type}
          ratio={this.state.ratio}
        >
        </Camera>
      </View>
      )
    }else{
      return <View/>
    }
  }

  _handleItemPress = (item) => {
    this.props.navigation.navigate('EventDetailsPage',{
      event_id: item.id, 
      uri: item.video_url, 
      my_infos: this.my_infos
    })
  }

  render() {
    return (
        <View style={styles.container}>
          {this.state.cameraDisplay && this.renderCamera()}
          <View style={[StyleSheet.absoluteFill, styles.camera]}>
            {!this.state.inbox && this.renderTopBar()}
            <JoinMe width='70%' ref={ref=>this._title = ref} />
            <Inbox 
              ref={ref=>{this._inbox = ref}}
              onPressItem={(item)=>{this._handleItemPress(item)}}
              onBackgroundPress={this.toggleInbox}
            />
            <BottomBar
              onPressRecord={this.startRecording}
              onFinishRecording={this.stopRecording}
              onPressInboxIcon={this.toggleInbox}
              onJustPressRecord={()=>{this._toast.showToast(1000)}}
              onPressProfile={() => this.props.navigation.navigate('UserDetailsPage')}
              ref={ref=>{this._bottomBar = ref}}
            />
            <Toast 
              style={styles.toastPosition}
              text='Hold to record' 
              ref={(ref)=>{this._toast = ref}} 
            />
          </View>
        </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  toastPosition: {
    bottom: '20%',
    alignSelf: 'center'
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.15,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Constants.statusBarHeight / 2 + 10,
    paddingRight: Constants.statusBarHeight / 2,
  },
  toggleButton: {
    flex: 0.10,
    height: 40,
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: 10,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
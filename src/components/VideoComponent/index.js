import React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Video } from 'expo';

export default class VideoComponent extends React.Component {

  constructor(props){
    super(props)
  }

  componentDidMount(){
    const initialVideoOptions = {
      'shouldPlay': this.props.shouldPlay,
      'isLooping': this.props.isLooping,
    }
    this._video.loadAsync({'uri': this.props.source},initialVideoOptions, false)
  }

  _mountVideo = component => {
    this._video = component;
  }

  _onVideoStatusChange = (playbackStatus) => {
    this.props.onPlaybackStatusUpdate && this.props.onPlaybackStatusUpdate(playbackStatus)
  }

  pauseAsync = () => {
    this._video.pauseAsync()
  }

  _handleTouch = () => {
    this.props.onPress && this.props.onPress()
  }
  
  render() {
    return (
        <View style={[styles.container, this.props.style]}>
          <TouchableWithoutFeedback onPress={this._handleTouch} style={styles.touchable}>
            <Video 
              style={styles.video}
              ref={this._mountVideo}
              resizeMode= "cover"
              onPlaybackStatusUpdate={this._onVideoStatusChange}
            />
          </TouchableWithoutFeedback>
        </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    flex: 1,
  },
  activityIndicator: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black'
  },
});
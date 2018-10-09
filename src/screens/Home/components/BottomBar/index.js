import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons'
import RecordButton from './components/RecordButton'
import { ifIphoneX } from 'react-native-iphone-x-helper';
import * as user from '../../../../data/users';

export default class BottomBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: true,
            notifs: 0,
        }
    }

    componentWillMount(){
        this.getEventsList()
    }

    getEventsList = async ()=>{
        return user.getEvents().then((res)=>{
            this.setState({ notifs: res.notifications })
        })
    }

    toggleBottomBar = () => {
        this.getEventsList()
        this.setState({
            display: !this.state.display
        })
        this._recordButton.toggleButton()
    }

    render() {
        return <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents='box-none'>
            <View style={styles.bottomBar}>
                <View  style={styles.utilsButton}>
                    {this.state.display && <TouchableOpacity onPress={this.props.onPressProfile}>
                        <Ionicons style={styles.shadowedIcons} name="ios-contact" size={40} color="white" />
                    </TouchableOpacity>}
                </View>
                
                <View style={styles.utilsButton}>
                    <RecordButton
                        onPressIn={this.props.onPressRecord}
                        onPressOut={this.props.onFinishRecording}
                        onJustPress={this.props.onJustPressRecord}
                        style={{flex:1, justifyContent: 'center', alignItems: 'center'}}
                        radius={40}
                        duration={5000}
                        ref={ref=>this._recordButton = ref}
                    />
                </View>
        
                <View style={styles.utilsButton}>
                    <TouchableOpacity style={styles.inboxIcon} onPress={this.props.onPressInboxIcon}>
                        <Entypo style={styles.shadowedIcons} name="documents" size={40} color="white" />
                        {this.state.notifs > 0 && <View style={styles.notificationDotRed}></View>}
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
                ;
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end'
    },
    bottomBar: {
        paddingBottom: ifIphoneX(80,20),
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: '20%',
        width: '100%',
        paddingHorizontal: '5%'
    },
    utilsButton: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    notificationDotRed: {
      backgroundColor: 'red',
      width: 10,
      height: 10,
      borderRadius: 100,
      marginTop: 10,
    },
    shadowedIcons:{
        textShadowOffset:{width:0, height:2},
        elevation: 2,
        shadowColor:'#000000',
        shadowOpacity:0.6,
        shadowRadius: 1,
        backgroundColor: '#0000',
    },
    inboxIcon: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
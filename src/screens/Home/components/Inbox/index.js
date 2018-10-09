import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, FlatList } from 'react-native';
import { BlurView } from 'expo'
import Avatar from '../../../../components/Avatar';
import * as user from '../../../../data/users';
import isIPhoneX from 'react-native-iphone-x-helper';

export default class Inbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false,
            events: []
        }    
    }

    componentWillMount(){
        this.getEventsList()
    }

    pad(number){
        return ("0" + number.toString()).slice(-2)
    }
    
    getEventsList = async ()=>{
        return user.getEvents().then((res)=>{
        let events = res.my_events.concat(res.events)
        events.map((item)=>{
            let date = new Date()
            let ending_date = new Date(item.ending_time)
            let remaining_time = new Date(ending_date - date)
            let remaining_time_UTC = new Date(remaining_time.getUTCFullYear(), remaining_time.getUTCMonth(), remaining_time.getUTCDate(), remaining_time.getUTCHours(), remaining_time.getUTCMinutes(), remaining_time.getUTCSeconds())
            item.remainingTime = remaining_time_UTC
        })
        events.sort((a,b)=>{
            if(Number(a.remainingTime) > Number(b.remainingTime)){
            return 1
            }else{
            return -1
            }
        })
        console.log(res)
        this.setState({events: events, notifs: res.notifications})
        })
    }

    toggleInbox = () => {
        this.getEventsList()
        this.setState({
            display: !this.state.display
        })
    }

    _handleBackgroundTouch = () => {
        this.props.onBackgroundPress && this.props.onBackgroundPress()
    }

    _keyExtractor = (item, index) => item.id.toString()

    _renderItem = ({item}) =>{
  
      let color = item.coming === 1 ? 'green' : 'red'
      let remainingTime = {hours: item.remainingTime.getHours(), minutes: item.remainingTime.getMinutes()}
  
      return(
        <TouchableOpacity style={styles.inboxItem} onPress={()=>{this.props.onPressItem(item)}}>
          <View style={styles.inboxInfos}>
            <Text style={styles.inboxName}>{item.creator.first_name} {item.creator.last_name}</Text>
            <Text style={styles.inboxTime}>{this.pad(remainingTime.hours)}h{this.pad(remainingTime.minutes)}</Text>
          </View>
          <Avatar
            style={styles.inboxAvatar}
            source= {item.creator.url}
            displayDot= {(item.coming == 1 || item.coming == 2)}
            dotColor= {color}
          />
          { item.notifications.length > 0 && <View style={styles.notificationDot}></View> }
        </TouchableOpacity>
      )
    }

    render() {
        let renderValue = this.state.display && (
                <TouchableWithoutFeedback style={StyleSheet.absoluteFill} onPress={()=>{this._handleBackgroundTouch()}}>
                    <BlurView style={styles.touchable} tint="dark" intensity={80}>
                        <View style={styles.inbox} pointerEvents='box-none'>
                            <FlatList
                                style={styles.flatlist}
                                data={this.state.events}
                                keyExtractor={this._keyExtractor}
                                renderItem={this._renderItem}
                                inverted
                                pointerEvents='box-none'
                            />
                        </View>
                    </BlurView> 
                </TouchableWithoutFeedback>
        )

        return renderValue;
    }
}

const styles = StyleSheet.create({
    notificationDot: {
        backgroundColor: 'white',
        width: 7,
        height: 7,
        borderRadius: 100,
        marginLeft: 20,
        marginRight: 30,
      },
      touchable: {
        flex: 1,
        height: '100%',
        width: '100%',
      },
      inbox: {
        position: 'absolute',
        bottom: '20%',
        right: 20,
        height: '50%',
        overflow: 'visible',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
      },
      inboxItem: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
      },
      inboxInfos: {
        alignItems: 'flex-end',
        marginRight: 5,
      },
      inboxName: {
        color: 'white'
      },
      inboxTime: {
        color: '#CBB5FF',
      },
      inboxAvatar:{
        width: 50,
        height: 50,
      }
})
import React from 'react';
import { StyleSheet, View, Text, Platform, TimePickerAndroid, DatePickerIOS, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo'

export default class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false,
        }    
        this.chosenDate = this.props.chosenDate
    }

    showDatePicker = async () => {
        if(Platform.OS === 'ios'){
            this.setState({
                display: true
            })
        }else{
            try {
                const {action, hour, minute} = await TimePickerAndroid.open({
                  hour: this.chosenDate.getUTCHours(),
                  minute: this.chosenDate.getUTCMinutes(),
                  is24Hour: true, 
                });
                if (action !== TimePickerAndroid.dismissedAction) {
                    let date = 
                    this.chosenDate = new Date(Date.UTC(0,0,0,hour,minute,0,0))
                    this._dateSelected(new Date(0,0,0,hour,minute,0,0))
                }else{
                    this._handleCancel()
                }
            } catch ({code, message}) {
                console.warn('Cannot open time picker', message);
            }
        }
    }

    _handleCancel = () => {
        this.setState({ chosenDate: this.props.chosenDate})
        if(Platform.OS === 'ios'){
            this.setState({ display: false })
        } 
        this.props.onCancel && this.props.onCancel()
    }

    _handleIOSDone = () => {
        this.setState({ display: false })
        let newDate = new Date(0,0,0,this.chosenDate.getUTCHours(),this.chosenDate.getUTCMinutes(),0,0)
        this._dateSelected(newDate)
    }

    _dateSelected = (selectedDate) => {
        this.props.onValidate(selectedDate)
    }

    _handleDateChange = (newDate) => {
        this.chosenDate = newDate
    }

    render() {
        let renderValue = this.state.display && (
            <View style={StyleSheet.absoluteFill}>
                <BlurView style={styles.bluredBackground} tint='dark' intensity={80}>
                    <View style={styles.background}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={this._handleCancel}>
                                <Text style={styles.headerButtonText}>Cancel</Text>
                            </TouchableOpacity>
                                <Text style={styles.headerTitle}>Event duration</Text>
                            <TouchableOpacity onPress={()=>{this._handleIOSDone()}}>
                                <Text style={styles.headerButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <DatePickerIOS
                        date={this.chosenDate}
                        onDateChange={this._handleDateChange}
                        mode= 'time'
                        timeZoneOffsetInMinutes = {0}
                        />
                    </View>
                </BlurView>
            </View>
        )
        return renderValue;
    }
}

const styles = StyleSheet.create({
    bluredBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end'
    },
    background: {
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row', 
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 5, 
        backgroundColor: '#f9f9f9'
    },
    headerButtonText: {
        color: '#357AF6',
        fontSize: 18,
    },
    headerTitle: {
        fontWeight: '500',
        fontSize: 20,
    },
})
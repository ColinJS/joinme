import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false
        }    
    }

    showToast = (displayTime) => {
        this.setState({
            display: true
        },()=>{
            setTimeout(()=>{
                this.setState({
                    display: false
                })
            }, displayTime) 
        })
    }

    render() {
        let renderValue = this.state.display && (
            <View style={[this.props.style, styles.container]}>
                <Text style={styles.toastText}>{this.props.text}</Text>
            </View>
        )
        return renderValue;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: 10,
    },
    toastText: {
        color: 'white'
    }
})
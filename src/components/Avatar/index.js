import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

const COLORS = {
    'red': '#FF5656',
    'green': '#7DFF55'
}

export default class Avatar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={this.props.style}>
                <View style={styles.imageContainer}>
                    <Image
                    style={styles.imageStyle}
                    source={this.props.source != '' ? {uri: this.props.source} : require('../../images/default-avatar.png')}
                    />
                </View>
                {this.props.displayDot && <View style={[styles.dotStyle, {backgroundColor: COLORS[this.props.dotColor]}]}></View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    imageContainer: {
        height: '100%',
        width: '100%',
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'white', 
    },
    imageStyle: {
        height: '100%',
        width: '100%',
    },
    dotStyle: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        height: '25%',
        width: '25%',
        borderRadius: 100,
    }
})
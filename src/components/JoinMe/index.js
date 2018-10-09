import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';

export default class JoinMe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: true
        }
    }

    toggleTitle = () => {
        this.setState({
            display: !this.state.display
        })
    }

    render() {
        let renderValue = this.state.display && <View style={StyleSheet.absoluteFill} pointerEvents='box-none'> 
                    <Image
                            source={require('../../images/joinme.png')}
                            style={[styles.image, {width: this.props.width}]}
                            resizeMode="contain"
                        />
                </View>
        return  renderValue;
    }
}

const styles = StyleSheet.create({
    image: {
        marginTop: ifIphoneX('35%','25%'),
        alignSelf: 'center',
    }
})
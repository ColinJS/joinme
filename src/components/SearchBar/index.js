import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state=({
            value : ''
        })    
    }

    _handleTextChange = (text) => {
        this.props.onChangeText && this.props.onChangeText(text)
    }

    render() {
        return (
            <View style={[this.props.style, styles.container]}>
                <View style={styles.logoContainer}>
                    <Ionicons style={styles.logoStyle} name="ios-search" size={30}/>
                </View>
                <TextInput
                    style={styles.inputStyle}
                    placeholder="Search"
                    onChangeText={text => {this._handleTextChange(text)}}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: "white",
        borderRadius: 5,
        height: 50,
        
    },
    logoContainer: {
        width: 30,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    logoStyle: {
        marginRight: 5,
    },
    inputStyle :{
        flex: 1,
        marginLeft: 5,
        height: 40
    }
})
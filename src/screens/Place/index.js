import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Facebook } from 'expo'
import * as user from '../../data/users'
import * as session from '../../services/session'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const that = ""

export default class PlaceScreen extends React.Component {

    static navigationOptions = (({navigation, actionButtonTitle})=>({
        title: 'Set Location',
        headerRight:(
          <TouchableOpacity style={{marginRight: 20}} onPress={()=>{that.sendNewAddress()}}>
            <Text> Done </Text>
          </TouchableOpacity>
        )
      })
    )

    constructor(props){
        super(props)
        this.state = {
            address: {}
        }
    }

    _handleAddressChange = (address) => {
        this.setState({
            address: address
        })
    }

    sendNewAddress = () => {
        this.props.navigation.state.params.onNavigationBack({"formatted_address": this.state.address.description, "place_id": this.state.address.place_id})
        this.props.navigation.goBack()
    }

    render() {
        that = this
        return <GooglePlacesAutocomplete
        placeholder='Enter Location'
        minLength={2}
        autoFocus={false}
        returnKeyType={'default'}
        fetchDetails={true}
        renderDescription={row => row.description}
        onPress={(data, details = null)=>{
            this._handleAddressChange(data)
        }}
        getDefaultValue={() => ''}
        query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: 'AIzaSyA8QQ8ADBfhHcnRn-UZFF_8lC7yGm1JLD0',
        language: 'en', // language of the results
        types: 'address' // default: 'geocode'
        }}
        styles={{
            textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth:0,
            width: '100%'
            },
            textInput: {
            marginLeft: 0,
            marginRight: 0,
            height: 38,
            color: '#5d5d5d',
            fontSize: 16
            },
            predefinedPlacesDescription: {
            color: '#1faadb'
            },
            description: {
              fontWeight: 'bold'
            },
        }}
        currentLocation={true}
        currentLocationLabel="Current location"
        debounce={200}
        GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance'
          }}
        />
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
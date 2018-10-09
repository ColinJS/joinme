import React from 'react';
import { StyleSheet, ActivityIndicator, Text, View, Button } from 'react-native';
import { Facebook } from 'expo'
import * as user from '../../data/users'
import * as session from '../../services/session'

export default class LoginScreen extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            waiting: false,
        }
    }

    logIn = async () => {
        console.log("login process ...")
        this.setState({waiting: true})
        const { type, token } = await Facebook.logInWithReadPermissionsAsync('216524539214115',{
            permissions: ['public_profile','email'],
            behavior: 'native' //,'user_friends'
        });
        if(type === 'success'){
            console.log("init user ...")
            session.authenticate(token).then(()=>{
                console.log("session authenticate ...")
                user.create().then(()=>{
                    this.props.navigation.navigate('App')
                }
                ).catch(error=>console.log(error))
                
            })
        }
        this.setState({waiting: false})
    }

    render() {
        const { waiting } = this.state
        return (
            <View style={styles.container}>
                <Button
                    onPress={this.logIn}
                    title="Continue with Facebook"
                    color="#3b5998"
                    AccessibilityLabel="Continue with Facebook"
                />
                {waiting && <ActivityIndicator />}
            </View>
        );
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
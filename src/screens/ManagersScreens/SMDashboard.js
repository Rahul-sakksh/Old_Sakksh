import React from 'react'
import {View,Text, StyleSheet} from 'react-native'

function SMDashboard () {

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
        },
    });

  return (
    <View style = {styles.container}>
        <Text>SMDashboard</Text>
    </View>
  )
}

export default SMDashboard
import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

const SMReport = () => {

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
        <Text>SMReport</Text>
    </View>
  )
}

export default SMReport
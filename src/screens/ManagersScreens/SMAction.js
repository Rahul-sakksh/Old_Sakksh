import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

const SMAction = () => {

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
        <Text>SMAction</Text>
    </View>
  )
}

export default SMAction
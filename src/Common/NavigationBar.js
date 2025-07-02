import React, {memo} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Alert} from 'react-native';
import * as constant from '../Utils/Constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {replace, navigate} from '../Utils/RootNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {clearStorage} from '../Helpers/StorageHelper';

function NavigationBar({title, onPressBack, showBackButton, hideRightButtons}) {
  const styles = StyleSheet.create({
    container: {
      height: 50,
      overflow: 'hidden',
      backgroundColor: constant.primaryColor,
      width: '100%',
      justifyContent: 'center'
    },
    holderView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 20,
      color: '#fff',
    },
  });

  const onPressLogout = () => {
    clearStorage();
    replace('login');
  }

  const logout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () =>  onPressLogout()},
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.holderView}>
        <View style={{flexDirection: 'row'}}>
          {showBackButton && (
            <TouchableOpacity onPress={onPressBack}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{paddingRight: 20}}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {!hideRightButtons && (
        <View style={{flexDirection: 'row'}}>
          <AntDesign
            name="bells"
            size={24}
            color="white"
            style={{paddingLeft: 20}}
          />
          <TouchableOpacity onPress={logout}>
            <AntDesign
              name="logout"
              size={24}
              color="white"
              style={{paddingLeft: 20}}
            />
          </TouchableOpacity>
        </View>
        )}
      </View>
    </View>
  );
}

export default memo(NavigationBar);

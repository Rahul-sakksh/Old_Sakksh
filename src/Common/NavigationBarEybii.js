import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {replace, navigate} from '../Utils/RootNavigation';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {clearStorage} from '../Helpers/StorageHelper';
import * as constant from '../Utils/Constants';

export const NavigationBarE = ({dateSelected, hideCalender = false, title}) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 50,
      overflow: 'hidden',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: constant.primaryColor,
      width: '100%',
    },
    rightContainer: {
      width: '20%',
      flexDirection: 'row',
      justifyContent: hideCalender ? 'flex-end' : 'space-between',
      alignItems:'flex-end'
    },
    title: {
        fontSize: 20,
        color: '#fff',
      },
  });
  const onPressLogout = () => {
    clearStorage()
    replace('login');
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    dateSelected(date)
    hideDatePicker();
  };

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
        {text: 'OK', onPress: () => onPressLogout()},
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <View>
      <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {!hideCalender && (
          <TouchableOpacity onPress={showDatePicker}>
          <AntDesign name="calendar" size={25} color="#fff" />
        </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => logout()}>
          <AntDesign name="logout" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
      {isDatePickerVisible && (
        <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display= {Platform.OS === 'ios' ? 'inline' : ''}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      )}
    </View>
  );
};

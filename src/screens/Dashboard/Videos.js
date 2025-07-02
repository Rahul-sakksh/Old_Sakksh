import React, {memo, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as constant from '../../Utils/Constants';
import ActionList from './ActionList';
import {View, StyleSheet, Text, TouchableOpacity, FlatList} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { navigate } from '../../Utils/RootNavigation';
import ModalFilterPicker from 'react-native-modal-filter-picker'
import { getData } from '../../Helpers/StorageHelper';
import Snackbar from 'react-native-snackbar';
import { clearStorage } from '../../Helpers/StorageHelper';
import { replace } from '../../Utils/RootNavigation';
import { Alert } from 'react-native';
// Initialized all Navigator
const TopTab = createMaterialTopTabNavigator();

export function AppTopTabsNavigation(){
    return (
        <TopTab.Navigator initialRouteName="Incomplete">
            <TopTab.Screen name="Incomplete" component={AppTopTabsNestedNavigation} options={{ tabBarLabel: 'Incomplete' }} />
            <TopTab.Screen name="CompeletedActions" component={ActionList} options={{ tabBarLabel: 'Complete' }} />
        </TopTab.Navigator>
    );
}

export function AppTopTabsNestedNavigation(){
  return (
      <TopTab.Navigator initialRouteName="High">
          <TopTab.Screen name="High" component={ActionList} options={{ tabBarLabel: 'High' }} />
          <TopTab.Screen name="Medium" component={ActionList} options={{ tabBarLabel: 'Medium' }} />
          <TopTab.Screen name="Low" component={ActionList} options={{ tabBarLabel: 'Low' }} />
      </TopTab.Navigator>
  );
}


function Videos({navigation, route}) {

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fafafa',
      height: '100%',
    },
    containerNav: {
      overflow: 'hidden',
      backgroundColor: constant.primaryColor,
      width: '100%',
      justifyContent: 'center',
    },
    holderView: {
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 20,
      color: '#fff',
    },
    item: {
      borderColor: 'lightgray',
      borderWidth: 0.5,
      borderRadius: 15,
     // padding: 5,
      marginVertical: 8,
      marginHorizontal: 6,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    touchableOpacityStyle: {
      position: 'absolute',
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      right: 30,
      bottom: 30,
      backgroundColor: constant.primaryColor,
      borderRadius: 30,
    },
  });

  useEffect(() => {
    if (route.params) {
      console.log("route.params", route.params)
    }
  }, [route.params]);

  const options = [
    // {
    //   id: '1',
    //   label: 'Issues',
    //   key: 'Issues'
    // },
    // {
    //   id: '2',
    //   label: 'Best Practices',
    //   key: 'Best Practices'
    // },
    // {
    //   id: '3',
    //   label: 'Learning’s',
    //   key: 'Learning’s'
    // },
    // {
    //   id: '4',
    //   label: 'Overdue',
    //   key: 'Overdue'
    // },
    {
      id: '5',
      label: 'Due Date',
      key: 'Due Date'
    },
    // {
    //   id: '6',
    //   label: 'Pending',
    //   key: 'Pending'
    // },
    {
      id: '7',
      label: 'Site',
      key: 'Site'
    },
    {
      id: '8',
      label: 'Status',
      key: 'Status'
    },
    {
      id: '9',
      label: 'Assigned To',
      key: 'Assigned To'
    },
    {
      id: '10',
      label: 'Assignee',
      key: 'Assignee'
    },
  ];

  var data = [
    {
      id: '0',
      title: 'All',
      selected: false
    },
    {
      id: '3',
      title: 'Pending',
      selected: false
    },
    {
      id: '2',
      title: 'Overdue',
      selected: false
    },
    {
      id: '6',
      title: 'Completed',
      selected: false
    },
    {
      id: '1',
      title: 'Issues',
      selected: false
    },
    {
      id: '4',
      title: 'Best Practice',
      selected: false
    },
    {
      id: '5',
      title: 'Learning',
      selected: false
    },
  ]
  
  const renderHorizontalData = ({item, index}) => {
    return (
      <View style={[styles.item, {backgroundColor: index == selectedIndex ? constant.primaryColor : null}]}>
        <TouchableOpacity onPress={() => {
          setFilter(item.title)
          setSelectedIndex(index)}}>
        <Text style = {{color: index == selectedIndex ? "#fff" : "#000"}}> {item.title} </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const [filter , setFilter] = useState(null)

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [visible, setVisible] = useState(false)

  const onSelect = (picked) => {
     setSelectedIndex(null)
     setFilter(picked.key)
     setVisible(false)
  }

  const onCancel = () =>{
    setVisible(false)
  }

  const onNavigateToCreateAction = async () => {
      navigate('createAction');
  }

  const [showHideSortBy, setShowHideSortBy] = useState(false)

  const sortBy = () => {
    setShowHideSortBy(!showHideSortBy)
  }

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

  const clickHandler = () => {
    //function to handle click on floating Action Button
    alert('Floating Button Clicked');
  };

  return (
    <SafeAreaView
      style={{backgroundColor: constant.primaryColor}}
      edges={['top']}>
      <View style={styles.container}>
        <View style={styles.containerNav}>
          <View style={styles.holderView}>
            <Text style={styles.title}>Actions</Text>
            <View
              style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <TouchableOpacity onPress={() => sortBy()}>
                <AntDesign
                  name="filter"
                  size={24}
                  color="white"
                  style={{paddingLeft: 20}}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <AntDesign name="logout" size={24} color="white" style={{paddingLeft: 10}} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{backgroundColor: '#fff', flexDirection: 'row'}}>
            <FlatList
              data={data}
              renderItem={renderHorizontalData}
              keyExtractor={(item, index) => 'key' + index}
              horizontal
            />
          </View>
        </View>
        <ActionList filter={filter} showHideSortBy={showHideSortBy} />
      </View>
      <ModalFilterPicker
        visible={visible}
        onSelect={onSelect}
        onCancel={onCancel}
        options={options}
      />
      <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigateToCreateAction()}
          style={styles.touchableOpacityStyle}>
          <AntDesign name="plus" size={34} color="white" />
        </TouchableOpacity>
    </SafeAreaView>
  );
}

export default memo(Videos);

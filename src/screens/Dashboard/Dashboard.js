import React, { memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Audit from './Audit';
import Videos from './Videos';
import TrackScreen from './TrackScreen';
import {View, Text, StyleSheet, Image, TouchableOpacity, Vibration} from 'react-native';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import {
    responsiveFontSize as rf,
  } from 'react-native-responsive-dimensions';

function MyTabs() {

    const styles = StyleSheet.create({
        activeDot: {
          width: '100%',
          height: 1,
          backgroundColor: '#cc618f',
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'absolute',
          bottom: 35,
        },
        tabColor: {
          color: 'red',
        },
    
        // bottom
        btnStyle: {
          backgroundColor: '#cc618f',
          height: 72,
        },
        btnText: {
          fontFamily: 'Gilroy',
          fontStyle: 'normal',
          fontWeight: 'bold',
          fontSize: 20,
          lineHeight: 30,
        },
        tabContainerStyle: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabName: {
          fontFamily: 'Gilroy',
          backgroundColor: null,
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontSize: 12,
          lineHeight: 30,
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          textTransform: 'capitalize',
        },
      });

 const Tab = createBottomTabNavigator();

  return (
      <>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: Platform.OS === 'android' ? false : true,
        gestureEnabled: false,
        detachInactiveScreens: true,
        activeTintColor: 'blue',
        inactiveTintColor: 'gray',
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        showLabel: false,
        labelStyle: {
          fontSize: rf(1.5),
        },
        tabBarShowLabel: true
       }}>
        <Tab.Screen name="Audit" component={Audit} options={{
            tabBarLabel: 'Audit',
            tabBarIcon: ({ focused }) => (
                <Image
                source={focused ? require('../../assets/tab_audit.png') : require('../../assets/tab_audit.png')}
                style={{width: 24, height: 24}}
                />
            ),
            }} />
            <Tab.Screen name="Action" component={Videos} options={{
            tabBarLabel: 'Action',
            //unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
                <Image
                source={focused ? require('../../assets/tab_action.png') : require('../../assets/tab_action.png')}
                style={{width: 24, height: 24}}
                />
            ),
            }} />
            <Tab.Screen name="Tracking" component={TrackScreen} options={{
            tabBarLabel: 'Tracking',
            //unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
                <Image
                source={focused ? require('../../assets/tab_action.png') : require('../../assets/tab_action.png')}
                style={{width: 24, height: 24}}
                />
            ),
            }} />
        </Tab.Navigator>
        </>
    );
    }

export default MyTabs;
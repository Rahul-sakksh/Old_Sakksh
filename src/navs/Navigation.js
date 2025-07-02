import React, {memo, useEffect} from 'react';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {navigationRef} from '../Utils/RootNavigation'
import Login from '../screens/Login';
import {storeData} from '../Helpers/StorageHelper';
import Dashboard from '../screens/Dashboard/Dashboard';
import Questionaire from '../screens/Questionaire';
import PdfViewer from '../Common/PdfViewer';
import SManagerDashboard from '../screens/Dashboard/SManagerDashboard';
import CreateAction from '../screens/Dashboard/CreateAction';
import * as constant from '../Utils/Constants';
import ActionList from '../screens/Dashboard/ActionList';
import ActionDetail from '../screens/Dashboard/ActionDetail';
import DayStartScreen from '../screens/TrackScreens/DayStartScreen';
import CheckIn from '../screens/CheckInScreen/CheckInScreen';
import ActionFilters from '../screens/Dashboard/ActionFilters';
import Videos from '../screens/Dashboard/Videos';
import { BackHandler, Alert } from 'react-native';
import CameraScreen from '../screens/CameraScreen';
function Navigation({initialRouteName}) {

  React.useEffect(() => {
    const onBackPress = () => {
        if(!navigationRef.current.getState() || navigationRef.current.getState().index == 0){
          Alert.alert( 'Exit App', 'Do you want to exit?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  
                },
                style: 'cancel',
              },
              { text: 'YES', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false }
          );
    
          return true;
        }
    };
  
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
  
    return () => backHandler.remove();
  }, []);


  const Stack = createStackNavigator();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: true,
          detachInactiveScreens: true,
        }}>
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="questionaire" component={Questionaire} />
        <Stack.Screen name="pdfViewer" component={PdfViewer} />
        <Stack.Screen name = "createAction" component= {CreateAction}/> 
        <Stack.Screen name="sManagerDashboard" component={SManagerDashboard} />
        <Stack.Screen name = "actionList" component={ActionList}/>
        <Stack.Screen name = "actionDetail" component={ActionDetail}/>
        <Stack.Screen name = "dayStartScreen" component={DayStartScreen}/>
        <Stack.Screen name="checkInScreen" component={CheckIn} />
        <Stack.Screen name="actionFilters" component={ActionFilters} />
        <Stack.Screen name="videos" component={Videos} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default memo(Navigation);
import React, {memo, useEffect, useState} from 'react';
import Navigation from './Navigation';
import {getData} from '../Helpers/StorageHelper';
import * as constant from '../Utils/Constants';
import {View, ActivityIndicator} from 'react-native';
import Loader from '../Common/Loader';

function Authentication() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    async function getloggedState() {
      setIsLoading(true);
      return [await getData(constant.loggedIn), await getData(constant.userRole)];
    }
    // getloggedState().then(([loggedIn, userRole]) => {
    //   setIsLoggedIn(loggedIn);
    //   setUserRole(userRole);
    //   setIsLoading(false);
    // }
    getloggedState().then(res => {
      console.log('res', res);
      if (res) {
        setIsLoggedIn(res[0]);
        setUserRole(res[1]);
      } 
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <Loader/>
    );
  } else {
    return (
        <Navigation 
        initialRouteName={isLoggedIn ? userRole === '5' ? 'sManagerDashboard' : 'dashboard' : 'login'}/>
    );
  }
}

export default memo(Authentication);
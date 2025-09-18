import React, {memo, useEffect, useState,useRef, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,PermissionsAndroid,Platform, Modal,Alert,ToastAndroid,Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavigationBar from '../../Common/NavigationBar';
import {Dropdown} from 'react-native-element-dropdown';
import API from '../../Utils/Api';
import * as constant from '../../Utils/Constants';
import {getData} from '../../Helpers/StorageHelper';
import Snackbar from 'react-native-snackbar';  
import { navigate } from '../../Utils/RootNavigation';
import moment from 'moment';
import crashlytics from '@react-native-firebase/crashlytics';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

async function onSignIn(user) {
  crashlytics().log('User signed in.');
  await Promise.all([
    crashlytics().setUserId(await getData(constant.userID)),
    crashlytics().setAttributes({
      email: await getData(constant.userID),
      username: await getData(constant.userID),
    }),
  ]);
}

function Audit() {
  const [storeList, setStoreList] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [surveyList, setSurveyList] = useState([]);
  const [surveryId, setSurveyId] = useState(null);
  const [dateList, setDateList] = useState([]);
  const [dateValue, setDateValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [surveyValue, setSurveyValue] = useState(null);
  const [isImageRequired, setIsImageRequired] = useState(null)
  const [site, setSite] = useState(null);
  const [isConnected, setIsConnected] = useState(true); 
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState({site:false,survey:false,date:false});

   
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdownContainer: {
      flex: 1,
      padding: 20,
    },
    dropdown: {
      margin: 16,
      height: 50,
      borderBottomColor: '#487abc',
      borderBottomWidth: 0.5,
    },
    textItem: {
      flex: 1,
      fontSize: 16,
      color: 'gray'
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    placeholderStyle: {
      fontSize: 16,
      color: 'gray'
    },
    selectedTextStyle: {
      fontSize: 16,
      color: 'gray'
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    btnStyle: {
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    btnText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    buttonEnable: {
      backgroundColor: constant.darkBlue,
    },
    buttonDisable: {
      backgroundColor: '#ccc',
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loaderContainer: {
      backgroundColor: '#fff',
      marginHorizontal: 70,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
  });

  const hasHandledInitialNetwork = useRef(false);

  const siteDropdownRef = useRef(null);
  const surveyDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);
 
useFocusEffect(
  useCallback(() => {
    console.log('Screen A focused');
    
    onSignIn();
    crashlytics().log('App mounted.');

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (!hasHandledInitialNetwork.current) {
        hasHandledInitialNetwork.current = true;
        if (state.isConnected) {
          getStores();
        } else {
          loadStoresFromStorage();
        }
      }
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(prev => {
        if (prev !== state.isConnected) {
          if (state.isConnected) {
            getStores();
          } else {
            loadStoresFromStorage();
            siteDropdownRef?.current?.close();
            dateDropdownRef?.current?.close();
            surveyDropdownRef?.current?.close();
          }
        }
        return state.isConnected;
      });
    });

    return () => {
      console.log('Screen A unfocused, removing NetInfo listener');
      unsubscribe();
    };
  }, [])
);


useEffect(() => {
  if (isConnected && storeId !== null) {
    console.log(' getSurveyList()');
    getSurveyList();
  }
}, [isConnected]);

useEffect(() => {
    if (isConnected && surveryId !== null) {
      console.log(' getDateList();');
    getDateList();
  }
}, [isConnected]);
  


  const loadStoresFromStorage = async () => {
    try {
      const store_list = await AsyncStorage.getItem('@store_list');

      const survey_audit_list =  await AsyncStorage.getItem('@survey_audit_list');

      const survey_reporting_date =  await AsyncStorage.getItem('@survey_reporting_date');

      const survey_reporting_selected_date =  await AsyncStorage.getItem('@survey_reporting_selected_date');
     
      if (store_list !== null && survey_audit_list !== null) {

        const store_list_data = JSON.parse(store_list);
        const survey_audit_list_data = JSON.parse(survey_audit_list);
        const data = store_list_data.filter((item)=> item.id == survey_audit_list_data.storeId )
        setStoreList(data);
        setSite(data[0])
        setStoreId(data[0].id)
      } else {
        Snackbar.show({
          text: 'No saved store list available',
          duration: Snackbar.LENGTH_SHORT,
        });
      }

      if (survey_reporting_date !== null && survey_audit_list !== null) {

        const survey_audit_list_data = JSON.parse(survey_audit_list);

        const survey_reporting_date_data = JSON.parse(survey_reporting_date);
           
        const data = survey_audit_list_data?.audits?.filter((item)=> item.id == survey_reporting_date_data.survey_id )

         setSurveyList(data);
         setSurveyValue(data[0].survey_name);
         setSurveyId(data[0].id)
      } else {
        Snackbar.show({
          text: 'No saved Survey list available',
          duration: Snackbar.LENGTH_SHORT,
        });
      }

      
      if (survey_reporting_date !== null && survey_reporting_selected_date !== null) {

        const survey_reporting_date_data = JSON.parse(survey_reporting_date);

        const data = survey_reporting_date_data?.audits?.filter((item)=> item.reporting_date == survey_reporting_selected_date )
        
        
        if(data.length != 0){
          setDateList(data);
          setDateValue(data[0].reporting_date);
        }else{
          setDateList([]);
          setDateValue(null);
        }
         

      } else {
        setDateList([]);
        setDateValue(null);
        Snackbar.show({
          text: 'No saved Date list available',
          duration: Snackbar.LENGTH_SHORT,
        });
      }


     
    } catch (error) {
      console.log('Error loading store list from storage:', error);
    }
  };

  const getStores = async () => {
    
    setLoading(prev => ({ ...prev, site: true }));
  
    try {
      const res = await API.get('/store_list.php', {
        params: {
          user_id: await getData(constant.userID),
          device_id: await getData(constant.deviceID),
          token: await getData(constant.token),
        },
      });
  
      if (res.data.status === 'success') {
        if (res.data.data.length > 0) {
         console.log("res.data.data ======>>>> ", res.data.data);
          setStoreList(res.data.data);
        } else {
          Snackbar.show({
            text: 'Store List Empty',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      } else {
        Snackbar.show({
          text: 'Something went wrong',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (error) {
      console.log("Failed to fetch store list", error);
      Snackbar.show({
        text: 'Failed to fetch store list',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setLoading(prev => ({ ...prev, site: false })); 
    }
  };
  

  //Render Store List
  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.area}</Text>
      </View>
    );
  };

  //Get Survey List
  const getSurveyList = async () => {
    setLoading(prev => ({ ...prev, survey: true }));
                try { 
                  const res = await API.get('/survey_audit_list.php', {
                    params: {
                      user_id: await getData(constant.userID),
                      device_id: await getData(constant.deviceID),
                      token: await getData(constant.token),
                      store_id: storeId,
                    },
                  });
              
                  if (res.data.status === 'success') {
                    if (res.data.data.length > 0) {
                       console.log("res.data.data ======>>>> survey", res.data.data);
                      setSurveyList(res.data.data);
                    } else {
                      Snackbar.show({
                        text: 'Survey List Empty',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                    }
                  } else {
                    Snackbar.show({
                      text: 'Something went wrong',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                } catch (error) {
                  console.log('Error fetching survey list:', error);
                  Snackbar.show({
                    text: 'Failed to fetch survey list',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                } finally {
                  setLoading(prev => ({ ...prev, survey: false }));
                }
        };
  
    useEffect(() => {
      if (storeId) {
        //reset survey list and value
        if(isConnected){
        setSurveyList([]);
        setSurveyId(null);
        setDateList([]);
        setDateValue(null);
         getSurveyList();}
      }
    }, [storeId]);

    //Render Survey List
  const renderSurveyItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.survey_name}</Text>
      </View>
    );
  };

  //Get Date List
  const getDateList = async () => {
                setLoading(prev => ({ ...prev, date: true }));
              
                try {
                  const res = await API.get('/survey_reporting_date.php', {
                    params: {
                      user_id: await getData(constant.userID),
                      device_id: await getData(constant.deviceID),
                      token: await getData(constant.token),
                      store_id: storeId,
                      survey_id: surveryId,
                    },
                  });
              
                  if (res.data.status === 'success') {
                    if (res.data.data.length > 0) {
                      // console.log(res.data.data);
                      setDateList(res.data.data);
                    } else {
                      Snackbar.show({
                        text: 'Date List Empty',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                    }
                  } else {
                    Snackbar.show({
                      text: 'Something went wrong',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                } catch (error) {
                  console.log('Error fetching date list:', error);
                  Snackbar.show({
                    text: 'Failed to fetch date list',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                } finally {
                  setLoading(prev => ({ ...prev, date: false }));
                }
     };
  

    useEffect(() => {
      if (surveryId && isConnected) {
        //reset date list and value
        setDateList([]);
        setDateValue(null);
        getDateList();
      }
    }, [surveryId]);

    const renderDateItem = item => {
      return (
        <View style={styles.item}>
          <Text style={styles.textItem}>{item.reporting_date}</Text>
        </View>
      );
    };

    var todaydate = moment(new Date()).format('YYYY-MM-DD');



    const hasLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        return true; 
      }
  
      if (Platform.Version < 23) return true;
  
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  
      if (hasPermission) return true;
  
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
  
      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
  
      if (status === PermissionsAndroid.RESULTS.DENIED) {
        setTimeout(() => {
          ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
        }, 100);
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        ToastAndroid.show('Location permission revoked by user.', ToastAndroid.LONG);
      }
  
      return false;
    };


    const onSubmit = async () => {
        
      const hasPermission = await hasLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission in settings to proceed.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        getCurrentLocation();
      }
    };

    const MAX_RETRIES = 3;

    const getCurrentLocation = () => {
      const startTime = Date.now();
      setLoadingLocation(true);
    
      Geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
    
          const elapsedTime = Date.now() - startTime;
          const remainingTime = 1000 - elapsedTime;
    
          setTimeout(async () => {
            setUserLocation(coords);
            setLoadingLocation(false);
    
            setIsLoading(true);
    
            if (storeId && surveryId) {
              const params = {
                user_id: await getData(constant.userID),
                device_id: await getData(constant.deviceID),
                token: await getData(constant.token),
                store_id: storeId,
                survey_id: surveryId,
                reporting_date: dateValue ? dateValue : todaydate,
                site: site,
              };
    
              setIsLoading(false);
              // console.log('params', params);
              console.log('coords', coords);
              navigate('questionaire', {
                params,
                site,
                survey_name: surveyValue,
                isImageRequired,
                storeList,
                surveyList,
                dateList,
                userLocation: coords,
              });
            }
          }, remainingTime > 0 ? remainingTime : 0);
        },
        (error) => {
          console.log('Location error:', error);
          setLoadingLocation(false);
          Alert.alert('Error getting location', `${error.message}Please try again`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    };

    const getPdf = async values => {
      let urlParams = `${constant.baseApi}/cpanel/surevyReport.php?store=${storeId}&survey_id=${surveryId}&reportDt=${dateValue ? dateValue : todaydate}`;
      navigate('pdfViewer', {base64: urlParams});
    };


  return (

      (
    <SafeAreaView style={{backgroundColor: constant.primaryColor}}>
      <View style={styles.container}>
        <NavigationBar title="Audit" />
        <View style={styles.dropdownContainer}>
       
        
          <Dropdown
            ref={siteDropdownRef}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={storeList}
            search={!loading.site}
            maxHeight={300}
            labelField="area"
            valueField="id"
            placeholder="Select Site"
            searchPlaceholder="Search..."
            disable = { !isConnected || loading.site  }
            value={storeId}
            onFocus={() =>  storeList.length == 0 && getStores()}
            onChange={item => {
              setStoreId(item.id);
              setSite(item)
              setIsImageRequired(item);
            }}
            renderItem={renderItem}
            renderRightIcon={() =>
              loading.site ? (
                <ActivityIndicator size="small" color="#487abc"  />
              ) :  <Ionicons name="chevron-down" size={16} color="gray" />
            }
            
          />
          
          
          <Dropdown
            ref={surveyDropdownRef}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={surveyList}
            search={!loading.survey}
            maxHeight={300}
            labelField="survey_name"
            valueField="id"
            placeholder="Select Survey"
            searchPlaceholder="Search..."
            value={surveryId}
            disable = { storeId == null || !isConnected || loading.survey } 
            onChange={item => {
              setSurveyId(item.id);
              setSurveyValue(item.survey_name);
            }}
            renderItem={renderSurveyItem}
            renderRightIcon={() =>
              loading.survey ? (
                <ActivityIndicator size="small" color="#487abc"  />
              ) :  <Ionicons name="chevron-down" size={16} color="gray" />
            }
          />
          <Dropdown
            ref={dateDropdownRef}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={dateList}
            disable = { surveryId == null || !isConnected || loading.date } 
            search={!loading.date}
            maxHeight={300}
            labelField="reporting_date"
            valueField="reporting_date"
            placeholder="Select Date(For Previous Reports)"
            searchPlaceholder="Search..."
            value={dateValue}
            onChange={item => {
              setDateValue(item.reporting_date);
            }}
            renderItem={renderDateItem}
            renderRightIcon={() =>
              loading.date ? (
                <ActivityIndicator size="small" color="#487abc"  />
              ) :  <Ionicons name="chevron-down" size={16} color="gray" />
            }
          />

          
          {storeId && surveryId && dateValue && isConnected  &&(
          <View
            style={{
              minHeight: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity style = {[styles.btnStyle, {width: "100%", borderColor: "lightGray", borderWidth: 1}]} onPress={() => getPdf()}>
              <Text style={[styles.btnText, {color: "#000"}]}>View Report</Text>
            </TouchableOpacity>
          </View>
         )}
          <TouchableOpacity
            style={[
              styles.btnStyle,
              surveryId !== null ? styles.buttonEnable : styles.buttonDisable,
            ]}
            disabled={surveryId === null}
            onPress={onSubmit}
            underlayColor="#fff">
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Conduct / View Audit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loadingLocation && (
          <Modal
              visible={loadingLocation}
              transparent={true}
              animationType="fade"
            >
              <View style={styles.modalBackground}>
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={{ marginTop: 10,fontSize:16,fontWeight:600 }}>Fetching Location...</Text>
                </View>
              </View>
            </Modal>
        ) }

    </SafeAreaView>)
  );
}

export default memo(Audit);

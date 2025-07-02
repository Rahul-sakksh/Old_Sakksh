/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationBarE} from '../..//Common/NavigationBarEybii';
import Icon from 'react-native-vector-icons/Feather';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GetLocation from 'react-native-get-location';
import moment from 'moment';
import API from '../../Utils/Api';
import {getData} from '../../Helpers/StorageHelper';
import * as constant from '../../Utils/Constants';
import ImagePicker from 'react-native-image-crop-picker';
import ImgToBase64 from 'react-native-image-base64';
import Snackbar from 'react-native-snackbar';
import ImageRender from '../../Common/ImageRender'
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

function DayStartScreen({navigation, route}) {
  const colorScheme = useColorScheme();
  const [locationText, setLocationText] = useState(null);
  const [state, setStates] = useState([]);
  const [selectedAddress, setselectedAddress] = useState('');
  const [selectedCity, setselectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [pincode, setpincode] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Get Location
  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert('Location permission denied');
    }

    if (status === 'disabled') {
      Alert.alert(
        `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
        '',
        [
          { text: 'Go to Settings', onPress: openSetting },
          { text: "Don't Use Location", onPress: () => {} },
        ],
      );
    }

    return false;
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  };

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        getAddress(position.coords);
      },
      (error) => {
        Alert.alert(`Code ${error.code}`, error.message);
        setLocation(null);
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        // forceRequestLocation: forceLocation,
        // forceLocationManager: useLocationManager,
        // showLocationDialog: locationDialog,
      },
    );
  };

  useEffect(() => {
    getLocation()
  },[])
  // useEffect(() => {
  //   GetLocation.getCurrentPosition({
  //     enableHighAccuracy: true,
  //     timeout: 150000,
  //   })
  //     .then(location => {
  //       setLocation(location);
  //       getAddress(location);
  //     })
  //     .catch(ex => {
  //       const {code, message} = ex;
  //       if (code === 'CANCELLED') {
  //         showAlert()
  //       }
  //       if (code === 'UNAVAILABLE') {
  //         Alert.alert('Location service is disabled or unavailable');
  //       }
  //       if (code === 'TIMEOUT') {
  //         Alert.alert('Location request timed out');
  //       }
  //       if (code === 'UNAUTHORIZED') {
  //         showAlert()
  //       }
  //     });
  // }, []);

  const showAlert = () => {
    Alert.alert(
      'Authorization Needed',
      'Seems like your location is off. Please enable location from the settings',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Go to settings', onPress: () =>  GetLocation.openGpsSettings()},
      ],
      {cancelable: false},
    );
  };

  const getAddress = async location => {
    let params = {
      company_id: 1,
      api_key: '24916435facdadd10ec8bc2080cebf52',
      lat: location.latitude,
      long: location.longitude,
    };
    const res = await API.get('/geocode-reverse.php', {params});
    if (res.data && res.data.results.length > 0 && res.data.results[0]) {
      setLocationText(res.data.results[0].formatted_address);
      setAddress(res.data.results[0].formatted_address)
    }
  };

  //-------Image Upload--------//

  const [uploadImage, setUploadImage] = useState([]);
  const [imageBase64Datas, setImageBase64Datas] = useState([]);

  const onChooseGallery = async () => {
    setUploadImage([]);
    setImageBase64Datas([]);
    if (imageBase64Datas.length == 1) {
      Alert.alert('', 'You can only upload 1 images');
      return;
    }

    await ImagePicker.openCamera({
      compressImageQuality: 0.7,
      mediaType: 'photo',
      multiple: true,
      maxFiles: 4,
      useFrontCamera: true,
      compressImageMaxWidth: 800
    })
      .then(image => {
        try {
          setUploadImage([...uploadImage, image]);
        } catch(e){
          console.log(e)
        }
      })
      .catch(error => {
        // console.error(error);
        // Snackbar.show({
        //   text: 'Error: ' + error.message,
        //   duration: Snackbar.LENGTH_LONG,
        //   backgroundColor: 'red',
        // });
      });
  };

  const convertToBase64 = async () => {
    try {
      if (uploadImage.length > 0) {
        await ImgToBase64.getBase64String(
          uploadImage[uploadImage.length - 1].path,
        )
          .then(base64String => {
            setImageBase64Datas([...imageBase64Datas, base64String]);
          })
          .catch(err => console.log('err', err));
      }
    } catch(e){
      console.log(e)
    }
  };

  useEffect(() => {
    convertToBase64();
  }, [uploadImage]);

  //-------Image upload ends --------//

  useEffect(() => {
    stateList();
  }, []);

  const stateList = async () => {
    const stateList = await API.get('/state_master.php');

    if (
      stateList.data &&
      stateList.data.data &&
      stateList.data.data.length > 0
    ) {
      console.log('StateList asas', stateList.data.data);
      setStates(stateList.data.data);
    }
  };

  useEffect(() => {
    if (selectedAddress) {
      getCity(selectedAddress);
    }
  }, [selectedAddress]);

  const getCity = async code => {
    let params = {
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
      state_code: code,
    };

    const cityList = await API.get('/state_city_list.php', {
      params,
    });

    if (cityList.data && cityList.data.data && cityList.data.data.length > 0) {
      console.log('cityList asas', cityList.data.data);
      setCities(cityList.data.data);
    }
  };

  const sendSalesManTracking = async () => {

    if (imageBase64Datas.length == 0) {
      Alert.alert('Please upload a selfie');
      return;
    }

    if (!setLocationText && !selectedAddress) {
      Alert.alert('Please enter address!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', await getData(constant.userID));
      formData.append('device_id', await getData(constant.deviceID));
      formData.append('token', await getData(constant.token));
      formData.append('map_address', locationText);
      formData.append('user_modified_address', address);
      formData.append('outlet_type', route.params.outletType);
      formData.append('city', selectedCity);
      formData.append('state', selectedAddress);
      formData.append('pincode', pincode);
      formData.append('lat', String(location.latitude));
      formData.append('longi', String(location.longitude));
      formData.append('location_image', imageBase64Datas.toString());
      setIsLoading(true);

      console.log(  `${constant.baseUri}sales_man_tracking.php`,
        formData)
      axios({
        url: `${constant.baseUri}sales_man_tracking.php`,
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(function (response) {
          let data = response;
          navigation.goBack()
          setIsLoading(false);
        })
        .catch(function (error) {
            console.log('error :', error);
        });
    } catch (error) {
      console.log('error', error);
    }

  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: constant.primaryColor
    },
    contentContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      shadowColor: '#fff',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
    },
    topbarContainer: {
      height: '10%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      top: 0,
    },
    greetingText: {
      //fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 20,
      lineHeight: 23,
      color: '#2C3039',
    },
    greetingText2: {
     // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '300',
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'right',
      color: '#2C3039',
      width: 110,
    },
    locationView: {
      //height: 36,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#E6E6E6',
      paddingHorizontal: 10,
      marginHorizontal: 20,
      alignItems: 'center',
    },
    locationInput: {
      flex: 1,
      //fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 14,
      color: '#2C3039',
    },
    editView: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginHorizontal: 20,
      marginTop: 20,
    },
    editText: {
     // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 14,
      color: '#0877DD',
      textAlign: 'center',
      marginLeft: 5,
    },
    textItem: {
      flex: 1,
     // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
      color: '#000',
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    streetAdressContainer: {
      marginHorizontal: 20,
      marginTop: 20,
      paddingLeft: 8,
      height: 36,
      borderColor: '#E6E6E6',
      borderRadius: 5,
      borderWidth: 1,
    },
    placeholderStyle: {
     // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
      color: '#77838F',
    },
    selectedTextStyle: {
     // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
      color: '#000',
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    streetDropdown: {},
    cityPinContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 20,
      padding: 8,
    },
    cityPinDropDownContainer: {
      width: '45%',
      borderColor: '#E6E6E6',
      borderRadius: 5,
      borderWidth: 1,
      paddingLeft: 8,
      height: 36,
    },
    pincodeInputView: {
      height: 36,
      width: '45%',
      borderColor: '#E6E6E6',
      borderRadius: 5,
      borderWidth: 1,
      justifyContent: 'center',
      paddingLeft: 8,
      height: 36,
    },
    pincodeText: {
     //fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
      color: '#77838F',
      padding: 5
    },
    selectStateContainer: {
      marginHorizontal: 20,
      //height: 36,
      marginTop: 20,
      borderColor: '#E6E6E6',
      borderRadius: 5,
      borderWidth: 1,
      justifyContent: 'center',
      paddingLeft: 8,
    },
    bottomContainer: {
      height: 67,
      marginTop: 20,
      marginHorizontal: 20,
      borderColor: '#E6E6E6',
      borderRadius: 5,
      borderWidth: 1,
      //elevation: 2,
    },
    submitContainerView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButton: {
      flex: 1,
      height: 45,
      marginTop: 20,
      marginHorizontal: 20,
      borderRadius: 5,
      width: '40%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0877DD',
    },
    submitText: {
      //fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 20,
      color: '#fff',
    },
  });

  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.state_name}</Text>
      </View>
    );
  };

  const renderCityItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.city}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <NavigationBarE
        title={route.params.outletType == 'day_start' ? 'Day Start' : 'Day End'}
        hideCalender = {true}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topbarContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color="#757677" />
          </TouchableOpacity>
          <Text style={styles.greetingText2}>
            {route.params.date}
          </Text>
        </View>
        <KeyboardAwareScrollView>
          <View>
            <View style={styles.locationView}>
              <TextInput
                editable={false}
                multiline={true}
                style={styles.locationInput}
                onChangeText={setLocationText}
                value={locationText}
              />
              <IonIcon name="location-outline" size={25} color="#0877DD" />
            </View>
            <View style={styles.editView}>
              <TouchableOpacity
                onPress={() => setIsEdit(!isEdit)}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="edit" size={15} color="#757677" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {isEdit && (
              <View style={styles.selectStateContainer}>
              <TextInput
                style={styles.pincodeText}
                multiline={true}
                onChangeText={setAddress}
                placeholder="Address"
                value={address}
              />
            </View>
            )}
            <View style={styles.streetAdressContainer}>
              <Dropdown
                style={styles.streetDropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={state}
                search
                maxHeight={300}
                labelField="state_name"
                valueField="state_code"
                placeholder="State"
                searchPlaceholder="Search..."
                value={selectedAddress}
                onChange={item => {
                  setselectedAddress(item.state_code);
                }}
                renderItem={renderItem}
              />
            </View>
            <View style={styles.cityPinContainer}>
              <View style={styles.cityPinDropDownContainer}>
                <Dropdown
                  style={styles.streetDropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={cities}
                  maxHeight={300}
                  labelField="city"
                  valueField="city"
                  placeholder="Select City"
                  searchPlaceholder="Search..."
                  value={selectedCity}
                  onChange={item => {
                    setselectedCity(item.city);
                  }}
                  renderItem={renderCityItem}
                />
              </View>
              <View style={styles.pincodeInputView}>
                <TextInput
                  style={styles.pincodeText}
                  onChangeText={setpincode}
                  placeholder="Pincode"
                  placeholderTextColor={colorScheme === "dark" ? "#77838F" : ""}
                  value={pincode}
                />
              </View>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={() => onChooseGallery()}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                flexDirection: 'row',
              }}>
              <Icon name="camera" size={30} color="#0877DD" />
              <Text style={{color: '#77838F', marginLeft: 10}}>
                Take Picture
              </Text>
            </TouchableOpacity>
          </View>
          {uploadImage.length > 0 && (
              <View style = {{alignItems:'flex-start',marginHorizontal: 20, marginTop: 15}}>
                {uploadImage.map((item, index) => (
                  <TouchableOpacity onPress={() => setUploadImage([])}>
                  <ImageRender key={index} image={item.path} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          <View style={styles.submitContainerView}>
            <TouchableOpacity
              disabled={isLoading}
              style={styles.submitButton}
              onPress={() => sendSalesManTracking()}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
      {isLoading &&
      <View style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backgroundColor: "#21212194"}}>
        <ActivityIndicator size={"large"} style={{justifyContent: "center", flex: 1, alignContent: "center"}} color={"#95c6ff"} />
      </View>}
    </SafeAreaView>
  );
}

export default DayStartScreen;

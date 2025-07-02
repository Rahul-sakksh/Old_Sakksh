import React, {memo ,useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {navigate} from '../../Utils/RootNavigation';
import moment from 'moment';
import API from '../../Utils/Api';
import {getData} from '../../Helpers/StorageHelper';
import * as constant from '../../Utils/Constants';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import Loader from '../../Common/Loader';
import ImageView from 'react-native-image-viewing';
import ImageRender from '../../Common/ImageRender';
import {NavigationBarE} from '../../Common/NavigationBarEybii';
import { color } from 'react-native-elements/dist/helpers';

const TrackScreen = () => {
  const isFocused = useIsFocused();
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor:'#fff'
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
      maxWidth: 120,
    },
    checkInContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    checkInButton: {
      flex: 1,
      height: 40,
      backgroundColor: '#08A9DD',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.25)',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      paddingLeft: 10,
      marginRight: 10,
    },
    checkInButtonText: {
      // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 20,
      color: '#FFFFFF',
    },
    followUpButton: {
      flex: 1,
      height: 40,
      backgroundColor: '#fff',
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    dayStartConatiner: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#2DA345',
      alignItems: 'center',
      height: 50,
      borderRadius: 5,
      marginRight: 10,
      paddingLeft: 10,
    },
    dayEndConatiner: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#DE1F22',
      alignItems: 'center',
      height: 50,
      borderRadius: 5,
      marginLeft: 10,
    },
    locationContainer: {
      backgroundColor: '#2EBD4B',
      height: '100%',
      borderRadius: 5,
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      width: '30%',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 5,
    },
    dayEndExitContainer: {
      backgroundColor: '#F82326',
      height: '100%',
      borderRadius: 5,
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      width: '30%',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 5,
    },
    imageStyles: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    dayStartText: {
      width: '100%',
      textAlign: 'center',
      //fontFamily: 'Roboto',
      fontStyle: 'normal',
      color: '#fff',
      fontWeight: '400',
      fontSize: 16,
    },
    timerText: {
      // fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 20,
      color: '#fff',
      textAlign: 'center',
    },
    viewText: {
      //fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 8,
      lineHeight: 20,
      color: '#fff',
      textAlign: 'center',
    },
    bottomContainer: {
      height: 67,
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 10,
      bottom: 100,
      position: 'relative',
    },
    contactContainer: {
      borderRadius: 10,
      borderWidth: 1,
      marginHorizontal: 20,
      marginVertical: 10,
      paddingBottom: 10,
      borderColor: '#E6E6E6',
      display:'flex',
      flexDirection:'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 8,
      gap:10
    },
    itemText: {
      fontWeight: '600',
      color:'#000'
    },
    distanceView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#08A9DD',
      width: '60%',
      alignItems: 'center',
      padding: 8,
      height: 35,
      borderRadius: 8,
    },
    locationView: {
      justifyContent: 'center',
      backgroundColor: '#08A9DD',
      alignItems: 'center',
      padding: 7,
      height: 35,
      borderRadius: 8,
      marginLeft: 8,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
    button: {
      padding: 10,
      elevation: 2,
      borderRadius: 8,
      width: 50,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  const [userName, setuserName] = useState(null);
  const [dayStartEnable, setDayStartEnable] = useState(false);
  const [dayEndEnable, setDayEndEnable] = useState(false);
  const [daystartTime, setDayStartTime] = useState(null);
  const [dayendTime, setDayEndTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemLocation, setSystemLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [outletImages, setOutletImages] = useState(null);
  const [isDayModal, setIsDayModal] = useState(false);
  const [daysImage, setDaysImage] = useState(null);
  const [disableActions, setDisableActions] = useState(false);
  const [hasImages, setHasImages] = useState(false);

  //start and end data
  const [daystartData, setDayStartData] = useState(null);
  const [dayendData, setDayEndData] = useState(null);

  //Followup Visit Screen
  const [isCheckIn, setIsCheckIn] = useState(true);

  const navigateToDayStart = () => {
    navigate('dayStartScreen', {
      outletType: 'day_start',
      date: moment(currentdate).format('Do MMM YYYY dddd'),
    });
  };

  const navigateToDayEnd = () => {
    navigate('dayStartScreen', {
      outletType: 'day_end',
      date: moment(currentdate).format('Do MMM YYYY dddd'),
    });
  };

  const navigateToCheckIn = () => {
    if(dayStartEnable && !dayEndEnable ){
    navigate('checkInScreen', {
      date: moment(currentdate).format('Do MMM YYYY dddd'),
    });
  }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState({
    value: false,
    index: 0,
  });

  const [currentdate, setCurrentDate] = useState(new Date());

  const [outletData, setOutletData] = useState(null);

  useEffect(() => {
    if (isFocused) {
      getTrackingData(currentdate);
    }
  }, [isFocused]);

  const resetStates = () => {
    setOutletData([]);
    setDayEndEnable(false);
    setDayStartEnable(false);
    setDayStartTime(null);
    setDayEndTime(null);
  };

  const getTrackingData = async date => {
    setIsLoading(true);
    setuserName(await getData(constant.name));
    resetStates();
    if (date) {
      let params = {
        user_id: await getData(constant.userID),
        device_id: await getData(constant.deviceID),
        token: await getData(constant.token),
        date: moment(date).format('YYYY-MM-DD'),
      };
      const res = await API.get('/sales_man_tracking_data.php', {
        params,
      });

      setIsLoading(false);
      if (res && res.data && res.data.data) {
        let data = res.data.data;
       // console.log('res ===>>>> data ', data);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].outlet_type === 'day_start') {
              setDayStartEnable(true);
              setDayStartTime(data[i].date_time);
              setDayStartData(data[i]);
            } else if (data[i].outlet_type === 'day_end') {
              setDayEndEnable(true);
              setDayEndTime(data[i].date_time);
              setDayEndData(data[i]);
            } else {
              console.log('res ===>>>> data ', data[i]);
              setOutletData(prevState => [...prevState, data[i]]);
            }
          }
        }
      }
    }
  };

  function compare(dateTimeA, dateTimeB) {
    var momentA = moment(dateTimeA, 'DD/MM/YYYY');
    var momentB = moment(dateTimeB, 'DD/MM/YYYY');
    if (momentA > momentB) return 1;
    else if (momentA < momentB) return -1;
    else return 0;
  }

  const dateSelected = date => {
    setCurrentDate(date);
    getTrackingData(date);
    let today = moment(new Date()).format('ll');
    let dateSelected = moment(date).format('ll');
    if (today === dateSelected) {
      setDisableActions(false);
    } else {
      setDisableActions(true);
    }
  };

  //create array of images
  const locationImages = locationImages => {
    if (locationImages) {
      let images = locationImages.split(',');
      if (images.length > 0) {
        setOutletImages([]);
        setHasImages(false);
        images.map(item => {
          let url = {uri: constant.baseUrlTracking + item};
          setHasImages(true);
          setOutletImages(prevState => [...prevState, url]);
        });
        setShowImagePreview({value: true, index: 0});
      }
    }
  };

  const renderItem = item => {
    const outletObj = item.item;
    return (
      <View style={styles.contactContainer}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}>
          <View style={styles.distanceView}>
            <Text style={{color: '#fff', fontWeight: '600'}}>
              {moment(outletObj.date_time).format('h:mm A')}
            </Text>
            <Text style={{color: '#fff', fontWeight: '600'}}>
              {outletObj.kms_covered} Km
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSystemLocation(outletObj.map_address);
              setUserLocation(outletObj.user_modified_address);
              setModalVisible(true);
            }}
            style={styles.locationView}>
            <IonIcon name="location-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              locationImages(
                outletObj.location_image ? outletObj.location_image : null,
              );
            }}
            style={styles.locationView}>
            <IonIcon name="images-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
       
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingHorizontal:5}}>
          <Text style={styles.itemText}>Outlet Name : </Text>
           <Text  style={{fontWeight:'regular',color: '#4e4f4f',}}>{outletObj.outlet_name}</Text>
        </View>

        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingHorizontal:5}}>
          <Text style={styles.itemText}>Type : </Text>
           <Text style={{fontWeight:'regular',color: '#4e4f4f',}}>{outletObj.outlet_type_name}</Text>
        </View>
        
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingHorizontal:5}}>
        <Text style={styles.itemText}>Client Details : </Text>
        <Text style={{fontWeight:'regular',color: '#4e4f4f',}}>{outletObj.contact_person_name}/{outletObj.contact_person_number}</Text>
        </View>

        <View style={{ borderColor: '#E6E6E6', borderWidth: 1, width: '100%', borderRadius: 7, padding: 5 }}>
          <Text style={{ fontWeight:'regular',color: '#4e4f4f'}}>
            <Text style={styles.itemText}>Notes : </Text>
            {outletObj.notes}
          </Text>
       </View>
        
      </View>
    );
  };

  if (isLoading) {
    return <Loader />;
  } else {
    return (
      <SafeAreaView edges={['top']} style={{backgroundColor: constant.primaryColor}}>
        <NavigationBarE
          title={'Track'}
          dateSelected={data => {
            dateSelected(data);
          }}
        />
        <View style={styles.container}>
          <View style={styles.topbarContainer}>
            <Text style={styles.greetingText}>Hi, {userName}</Text>
            <Text style={styles.greetingText2}>
              {moment(currentdate).format('Do MMM YYYY dddd')}
            </Text>
          </View>
          {/* <View style={styles.checkInContainer}>
            <TouchableOpacity onPress={() => setIsCheckIn(true)} style={[styles.checkInButton, {backgroundColor : isCheckIn ? "#08A9DD" : "#FFF"}]}>
              <Text style={[styles.checkInButtonText, {color: isCheckIn ? "#FFFFFF" : '#77838F'}]}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsCheckIn(false)} style={[styles.followUpButton, {backgroundColor : !isCheckIn ? "#08A9DD" : "#FFF"}]}>
              <Text style={[styles.checkInButtonText, {color: !isCheckIn ? "#FFFFFF" : '#77838F'}]}>
                Follow-Ups Visitis
              </Text>
            </TouchableOpacity>
          </View> */}
          {isCheckIn ? (
          <View style={{flex: 1, height: 'auto'}}>
            <View style={styles.checkInContainer}>
              <TouchableOpacity
                disabled = {disableActions}
                onPress={() => {
                  if (dayStartEnable) {
                    if (daystartData.location_image) {
                      let url = {
                        uri: constant.baseUrlTracking + daystartData.location_image,
                      };
                      setDaysImage(url);
                      setIsDayModal(true);
                    }
                    setSystemLocation(daystartData.map_address);
                    setUserLocation(daystartData.user_modified_address);
                    setModalVisible(true);
                  } else {
                    navigateToDayStart();
                  }
                }}
                style={styles.dayStartConatiner}>
                <View style={{flex: 1}}>
                  <Text style={styles.dayStartText}>Day Start</Text>
                  <Text style={styles.timerText}>
                    {daystartTime
                      ? moment(daystartTime).format('h:mm A')
                      : '00:00 PM'}
                  </Text>
                </View>
                <View style={styles.locationContainer}>
                  <Image
                    style={styles.imageStyles}
                    source={require('../../assets/location.png')}
                  />
                  <Text style={styles.viewText}>View</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled = {disableActions}
                style={styles.dayEndConatiner}
                onPress={() => {
                  if (dayEndEnable) {
                    if (dayendData.location_image) {
                      let url = {
                        uri: constant.baseUrlTracking + dayendData.location_image,
                      };
                      setDaysImage(url);
                      setIsDayModal(true);
                    }
                    setSystemLocation(dayendData.map_address);
                    setUserLocation(dayendData.user_modified_address);
                    setModalVisible(true);
                  } else {
                    navigateToDayEnd();
                  }
                }}>
                <View style={{flex: 1}}>
                  <Text style={styles.dayStartText}>Day End</Text>
                  <Text style={styles.timerText}>
                    {dayendTime
                      ? moment(dayendTime).format('h:mm A')
                      : '00:00 PM'}
                  </Text>
                </View>
                <View style={styles.dayEndExitContainer}>
                  <Image
                    style={styles.imageStyles}
                    source={require('../../assets/dayEnd.png')}
                  />
                  <Text style={styles.viewText}>View</Text>
                </View>
              </TouchableOpacity>
            </View>
            {outletData && (
              <View style={{flex: 1, display: 'flex', paddingBottom: '30%'}}>
                <FlatList
                  key={item => item.id}
                  keyExtractor={item => item.id}
                  data={outletData}
                  scrollEnabled={true}
                  renderItem={renderItem}
                />
              </View>
            )}
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                // disabled={dayEndEnable}
                onPress={() => navigateToCheckIn()}
                style={[styles.followUpButton, {flexDirection: 'row'}]}>
                  <Image
                    style={[styles.imageStyles, {marginRight: 10}]}
                    source={require('../../assets/checkIn.png')}
                  />
                <Text style={[styles.checkInButtonText, {color: '#77838F'}]}>
                  Check-In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          ) : (<FollowUpVisitScreen date={currentdate}/>) }
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                {' '}
                <Text style={{fontWeight: '600'}}>System Location : </Text>{' '}
                {systemLocation}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{fontWeight: '600'}}>User Entered Location: </Text>{' '}
                {userLocation}
              </Text>
              {isDayModal && (
                <View style={{paddingVertical: 10}}>
                  <ImageRender image={daysImage.uri} />
                </View>
              )}
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setIsDayModal(false);
                  setDaysImage(null);
                  setModalVisible(!modalVisible);
                }}>
                <Text style={styles.textStyle}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {showImagePreview && hasImages ? (
          console.log("outletImages",hasImages),
          <ImageView
            images={outletImages}
            imageIndex={showImagePreview.index}
            onRequestClose={() => setShowImagePreview({value: false, index: 0})}
            visible={showImagePreview.value}
          />
        ) : null}
      </SafeAreaView>
    );
  }
};

export default memo(TrackScreen);

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
  Modal, 
  Pressable
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavigationBar from '../../Common/NavigationBar';
import * as constant from '../../Utils/Constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {getData} from '../../Helpers/StorageHelper';
import ImageRender from '../../Common/ImageRender';
import ImageView from 'react-native-image-viewing';
import moment from 'moment';
import Snackbar from 'react-native-snackbar';
import ImagePicker from 'react-native-image-crop-picker';
import ImgToBase64 from 'react-native-image-base64';
import Loader from '../../Common/Loader';
import {Dropdown} from 'react-native-element-dropdown';
import API from '../../Utils/Api';

const ActionDetail = ({route, navigation}) => {
  const [showImagePreview, setShowImagePreview] = useState({
    value: false,
    index: 0,
  });
  const [loading, setLoading] = useState(false);
  //Styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#E5EBF4',
      height: '100%',
    },
    clapperView: {
      paddingVertical: 10,
    },
    questionContainer: {
      marginHorizontal: 10,
      borderColor: 'lightgray',
      borderWidth: 1,
      backgroundColor: "#ecf1f8"
    },
    flatListContainer: {
      flex: 0.65,
      //maxHeight: '50%',
    },
    flatListItem: {
      padding: 20,
      alignItems: 'flex-end',
    },
    bottomView: {
      flex: 0.35,
       bottom: 0,
       position: 'absolute',
      backgroundColor: '#fff',
      width: '100%',
      padding: 10,
    },
    chatInputView: {
      flex: 1,
      flexDirection: 'row',
      borderColor: 'lightgray',
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      padding: 5,
    },
    shareView: {
      flexDirection: 'row',
      borderColor: 'lightgray',
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      maxWidth: 100,
      marginRight: 10,
    },
    flatListItemTitle: {
      fontSize: 16,
      fontWeight: '400',
      paddingBottom: 8,
      color: "#000",
    },
    flatListItemDate: {
      fontSize: 12,
      fontWeight: '300',
      color: "#000"
    },
    dropdown: {
      flex: 1,
      margin: 10,
      height: 50,
      borderBottomColor: '#487abc',
      borderBottomWidth: 0.5,
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
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modelContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)"
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      marginTop: 22,
    },
    modalView: {
      minWidth: '90%',
      backgroundColor: "white",
      borderRadius: 20,
      padding: 25,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    popupButton: {
      padding: 10,
      margin: 5,
      backgroundColor: constant.primaryColor
    },
    popupDescInput: {
      flexDirection: 'row',
      padding: 10,
      margin: 10,
      borderColor: 'lightgray',
      borderWidth: 0.5,
    }, 
    modalText:{
      color: 'gray'
    },
    modalHeaderText:{
      color: 'black',
      fontWeight: 'bold',
    },
  });

  const [surveyData, setSurveryData] = useState(null);

  const [actionList, setActionList] = useState(null);

  const [status, setStatus] = useState(null);

  const [escalatedList, setEscalatedList] = useState([]);

  const [escalationID, setEscalationID] = useState(null);

  const [escalationExist, setEscalationExist] = useState(null)

  const getEscalatedList = async () => {
    const res = await API.get('/escalation_list.php', {
      params: {
        user_id: await getData(constant.userID),
        device_id: await getData(constant.deviceID),
        token: await getData(constant.token),
      },
    });

    if (res.data.status === 'success') {
      if (res.data.data.length > 0) {
        setEscalatedList([])
        console.log("res.data.data ======>>>> ", res.data.data)
        setEscalatedList(res.data.data);
      } else {
        Snackbar.show({
          text: 'Escalation List Empty',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } else {
      Snackbar.show({
        text: 'Something went wrong',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };


  const getActionsDetails = async () => {
    const user_id = await getData(constant.userID);
    const device_id = await getData(constant.deviceID);
    const token = await getData(constant.token);
    const action_Id = route.params.action_id;
    let getActionList =`${constant.baseUri}action_hist_details-main.php?user_id=${user_id}&token=${token}&device_id=${device_id}&action_id=${action_Id}&response_status=${status}`;
    console.log("action details api", getActionList);
    axios
      .get(getActionList)
      .then(result => {
        if (result && result.status == 200) {
          const data = result.data.data;
          console.log(data, 'data');
          if (data.length > 0) {
            setSurveryData(data[0]);
            let datas = data[0];
            if (datas.actionDetails && datas.actionDetails.length > 0) {
              setActionList(datas.actionDetails);
              if(datas.actionDetails){
                setStatus(datas.actionDetails[datas.actionDetails.length - 1].response_status);
              }
            }
            if (data[0].survey_images !== '') {
              let images = data[0].survey_images.split(',');
              if (images.length > 0) {
                console.log('asdasdasd', images);
                setSurveyImages([]);
                images.map(item => {
                  let url = {uri: constant.baseUrl + item};
                  setSurveyImages(prevState => [...prevState, url]);
                });
              }
            }
          } else {
            Snackbar.show({
              text: 'No data found!',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        } else {
          Snackbar.show({
            text: 'Problem while fetching',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      })
      .catch(err => {
        Snackbar.show({
          text: 'Something went wrong!',
          duration: Snackbar.LENGTH_SHORT,
        });
        console.log('err :', err);
      });
  };

  //Image Picker

  const [imageBase64Datas, setImageBase64Datas] = useState([]);

  const [uploadImage, setUploadImage] = useState([]);

  const onChooseGallery = async () => {
    if (imageBase64Datas.length == 4) {
      Alert.alert('', 'You can only upload 4 images');
      return;
    }

    await ImagePicker.openCamera({
      compressImageQuality: 0.7,
      mediaType: 'photo',
      multiple: true,
      maxFiles: 4,
    })
      .then(image => {
        setUploadImage([...uploadImage, image]);
      })
      .catch(error => {
        console.error(error);
        // Snackbar.show({
        //   text: 'Error: ' + error.message,
        //   duration: Snackbar.LENGTH_LONG,
        //   backgroundColor: 'red',
        // });
      });
  };

  const convertToBase64 = async () => {
    if (uploadImage.length > 0) {
      await ImgToBase64.getBase64String(
        uploadImage[uploadImage.length - 1].path,
      )
        .then(base64String => {
          setImageBase64Datas([...imageBase64Datas, base64String]);
        })
        .catch(err => console.log('err', err));
    }
  };

  useEffect(() => {
    convertToBase64();
  }, [uploadImage]);

  const postAnUpdate = async () => {
    if (actionResponse === '') {
      Alert.alert('Please add an update to post');
      return;
    }

    if (status === null) {
      Alert.alert('Please mark a status');
      return;
    }

    setLoading(true);
    //------//------//
    const formData = new FormData();
    const response_image =
      imageBase64Datas !== '' ? imageBase64Datas.toString() : '';
    formData.append('user_id', await getData(constant.userID));
    formData.append('device_id', await getData(constant.deviceID));
    formData.append('token', await getData(constant.token));
    formData.append('survey_action_id', route.params.action_id);
    formData.append('response_image', response_image);
    formData.append('action_response', actionResponse);
    formData.append('response_status', status);
    formData.append('escalation_id', escalationID)
    if (escalationID) {
      formData.append('escalation', "Y")
    } else {
      formData.append('escalation', "N")
    }
    axios({
      url: `${constant.baseUri}action_observation_post.php`,
      method: 'POST',
      data: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(function (result) {
        setLoading(false);
        if (result && result.status == 200) {
          const data = result.data.data;
          setActionResponse(null);
          getActionsDetails();
          Keyboard.dismiss();
          if (data.length > 0) {
          }
        } else {
          Snackbar.show({
            text: 'Problem while fetching',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      })
      .catch(function (error) {
        setLoading(false);
        Snackbar.show({
          text: 'Something went wrong!',
          duration: Snackbar.LENGTH_SHORT,
        });
        console.log('err :', error.response);
      });

    //------//------//
  };

  useEffect(() => {
    getActionsDetails();
  }, []);

  const setStatusTo = value => {
    setStatus(value);
  };

  const renderEscaltedList = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.escalation_name}</Text>
      </View>
    );
  };

  const [surveyImages, setSurveyImages] = useState([]);

  const [actionResponse, setActionResponse] = useState('');

  const renderItem = ({item}) => (
    <View style={styles.flatListItem}>
      <Text style={styles.flatListItemTitle}>
        {item.action_response && item.action_response != "null" ? item.action_response : "" }
      </Text>
      {item.escalation_name &&
      (
        <View
          style={{
            borderRadius: 5,
            paddingHorizontal: 5,
            backgroundColor: '#E30B5C',
          }}>
          <Text style={{color: '#fff', paddingVertical: 5}}>Escalated to {item.escalation_name}</Text>
        </View>
      )}
      {item.response_image !== null && item.response_image !== '' && (
        <TouchableOpacity
          onPress={() => {
            openImageFromList(item);
          }}>
          <ImageRender
            key={item.action_id}
            image={constant.baseUrl + item.response_image}
          />
        </TouchableOpacity>
      )}
      <Text style={styles.flatListItemDate}>
        {item.response_status} by {item.email} on {moment(item.response_date).format('ll')}
      </Text>
      <Text style={styles.flatListItemDate}>{item.date}</Text>
    </View>
  );

  const [showImagePreviewList, setShowImagePreviewList] = useState({
    value: false,
    index: 0,
  });

  const [imageToPreview, setImageToPreview] = useState([]);

  const openImageFromList = item => {
    let url = {uri: constant.baseUrl + item.response_image};
    setImageToPreview([url]);
    setShowImagePreviewList({value: true, index: 0});
  };

  const clearEscalation = () => {
    setEscalationID(null)
  }

  const isRecurring = () => {
    return route.params.recurring === "1" || route.params.recurring === "2" || route.params.recurring === "3"
  }

  const [modalVisible, setModalVisible] = useState(false);

  const getSeverity = () => {
    if (route.params.severity === "15") {
      return "Low"
    } else if (route.params.severity === "16") {
      return "Medium"
    } else if (route.params.severity === "17") {
      return "High"
    } else {
      return "Low"
    }
  }

  const getRepeatStatus = value => {
    if (value === '0') {
      return 'No';
    } else if (value === '1') {
      return 'Daily';
    } else if (value === '2') {
      return 'Weekly';
    } else if (value === '3') {
      return 'Monthly';
    }
  };

  const getWeekDay = value => {
    if (value === '1') {
      return 'Monday';
    } else if (value === '2') {
      return 'Tuesday';
    } else if (value === '3') {
      return 'Wednesday';
    } else if (value === '4') {
      return 'Thursday';
    } else if (value === '5') {
      return 'Friday';
    } else if (value === '6') {
      return 'Saturday';
    } else if (value === '7') {
      return 'Sunday';
    }
  };

  const DescriptionModal = (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <TouchableOpacity
        style={styles.modelContainer}
        activeOpacity={0.4}
        onPressOut={() => setModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{
                width: "100%",
                backgroundColor: constant.primaryColor,
                padding: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              <Text style={{color: 'white'}}>{route.params.action_type}</Text>
            </TouchableOpacity>
            <View style = {{flexDirection: "row", paddingVertical:5}}>
              <Text style={styles.modalHeaderText}>Assigned Sites(s): </Text>
              <Text style={styles.modalText}>{route.params.assigned_site_id}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Priority: </Text>
              <Text style={styles.modalText}>{getSeverity()}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Assign Date: </Text>
              <Text style={styles.modalText}>{moment(route.params.action_assigned_date).format('ll')}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Responsible : </Text>
              <Text style={styles.modalText}>{route.params.assigntoemail}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Target Compeletion Date : </Text>
              <Text style={styles.modalText}>{moment(route.params.target_completion_date).format('ll')}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Repeat : </Text>
              <Text style={styles.modalText}>{getRepeatStatus(route.params.recurring)}</Text>
            </View>
            <View style = {{flexDirection: "row", paddingVertical: 5}}>
              <Text style={styles.modalHeaderText}>Recurring Day : </Text>
              <Text style={styles.modalText}>{route.params.recurring === "2" ? getWeekDay(route.params.recur_day) : route.params.recur_day }</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return <Loader />;
  } else {
    return (
      <SafeAreaView
        style={{backgroundColor: constant.primaryColor}}
        edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <View style={styles.container}>
            <NavigationBar
              title={'Action to be taken'}
              showBackButton={true}
              hideRightButtons={true}
              onPressBack={() => navigation.goBack()}
            />
            <View style={styles.questionContainer}>
              <View style = {{flexDirection: "row", justifyContent: "center" }}>
                <View style = {{width: "85%"}}>
                  {route.params.action && (
                    <>
                      <TouchableOpacity onPress={() => setModalVisible(true)} style={{padding: 5, alignItems: 'center'}}>
                        <Text
                          style={{
                            paddingBottom: 5,
                            textTransform: 'capitalize',
                            color: '#000',
                            fontWeight: '700',
                            fontSize: 16
                          }}>
                          {route.params.action}
                        </Text> 
                      </TouchableOpacity>
                    </>
                  )}
                  {route.params.action_details ? (
                    <View style={{margin: 5, alignItems: 'center'}}>
                      <Text
                        numberOfLines={3}
                        style={{paddingBottom: 5, color: '#000'}}>
                        {route.params.action_details}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {isRecurring() && (
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={{ width: "10%",justifyContent: "center", alignItems: "center"}}>
                      <Ionicons
                        name="repeat-sharp"
                        size={35}
                        color="black"
                      />
                    </TouchableOpacity>
                  )}
              </View>
              {surveyData?.survey_query !== "DIRECT ACTION" && (
              <View style={{backgroundColor: '#fff', padding: 10}}>
                <Text
                  numberOfLines={3}
                  style={{paddingBottom: 10, color: '#000'}}>
                  {surveyData?.survey_query}
                </Text>
                <View style={{flexDirection: 'row', height: 30}}>
                  <View
                    style={{
                      backgroundColor: '#ffff99',
                      borderRadius: 5,
                      justifyContent: 'flex-start',
                      width: 50,
                      padding: 5,
                    }}>
                    {surveyData?.choosenvalue ? (
                      <Text style={{textAlign: 'center', color: '#000'}}>
                        {surveyData?.choosenvalue}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {surveyImages.length > 0 && (
                  <View style={styles.clapperView}>
                    <ScrollView horizontal>
                      {surveyImages.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            setShowImagePreview({value: true, index: index})
                          }>
                          <ImageRender key={index} image={item.uri} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {surveyData?.notes !== '' && (
                  <>
                    <Text style={{paddingBottom: 10, color: '#000'}}>
                      Notes
                    </Text>
                    <Text>{surveyData?.notes}</Text>
                  </>
                )}
              </View>
               )}
            </View>
            <View style={{flex: 1}}>
              <View style={styles.flatListContainer}>
                <FlatList
                  data={actionList}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => 'key' + index}
                />
              </View>
              <View style={styles.bottomView}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={[
                      styles.shareView,
                      {
                        backgroundColor:
                          status === 'In-Progress' ? "#FF2E2E" : null,
                      },
                    ]}
                    onPress={() => setStatusTo('In-Progress')}>
                    <Text
                      style={{
                        color: status === 'In-Progress' ? '#fff' : '#000',
                      }}>
                      In-Progress
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.shareView,
                      {
                        backgroundColor:
                          status === 'Completed' ? 'green' : null,
                      },
                    ]}
                    onPress={() => setStatusTo('Completed')}>
                    <Text
                      style={{color: status === 'Completed' ? '#fff' : '#000'}}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={escalatedList}
                    maxHeight={300}
                    labelField="escalation_name"
                    valueField="id"
                    placeholder="Do you want to escalate this ?"
                    searchPlaceholder="Search..."
                    value={escalationID}
                    onFocus={() =>
                      escalatedList.length === 0 ? getEscalatedList() : null
                    }
                    onChange={item => {
                      setEscalationID(item.id);
                    }}
                    renderItem={renderEscaltedList}
                  />
                  <TouchableOpacity
                    style={{
                      width: '15%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => clearEscalation()}>
                    <Text
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        padding: 4,
                        color: constant.primaryColor,
                      }}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={{padding: 10, width: 50}}
                    onPress={() => onChooseGallery()}>
                    <Ionicons name="image" size={24} color="black" />
                  </TouchableOpacity>
                  <View style={styles.chatInputView}>
                    <TextInput
                      style={{flex: 1, color: '#000'}}
                      placeholder="Add an update"
                      placeholderTextColor="gray"
                      multiline
                      value={actionResponse}
                      onChangeText={setActionResponse}
                    />
                    <TouchableOpacity
                      style={{padding: 8, bottom: 0}}
                      onPress={() => postAnUpdate()}>
                      <Ionicons name="send-outline" size={20} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {showImagePreview && (
            <ImageView
              images={surveyImages}
              imageIndex={showImagePreview.index}
              onRequestClose={() =>
                setShowImagePreview({value: false, index: 0})
              }
              visible={showImagePreview.value}
            />
          )}
          {showImagePreviewList && (
            <ImageView
              images={imageToPreview}
              imageIndex={showImagePreviewList.index}
              onRequestClose={() =>
                setShowImagePreviewList({value: false, index: 0})
              }
              visible={showImagePreviewList.value}
            />
          )}
          {DescriptionModal}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
};

export default ActionDetail;

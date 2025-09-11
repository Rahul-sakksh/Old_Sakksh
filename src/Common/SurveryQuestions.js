import React, {memo, Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, Modal, Pressable, TextInput, Linking, Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback, PermissionsAndroid} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import getOptionTypes from '../Utils/OptionTypes';
import StarRating from 'react-native-star-rating-widget';
import * as constant from '../Utils/Constants';
import ImageRender from './ImageRender';
import ImagePicker from 'react-native-image-crop-picker';
import Snackbar from 'react-native-snackbar'; 
import ImgToBase64 from 'react-native-image-base64';
import axios from 'axios';
import ImageView from "react-native-image-viewing";
import ParsedText from 'react-native-parsed-text';
import Loader from './Loader';
import {navigate} from '../Utils/RootNavigation'
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { color } from 'react-native-elements/dist/helpers';
import {launchCamera} from 'react-native-image-picker';
import { Camera } from 'react-native-camera-kit';
import { Image as CompressorImage } from 'react-native-compressor';


class SurveyQuestions extends Component {
  constructor(props) {
    super(props);
    this.timeout = React.createRef(null);
    
    let storeReport = props.data.survey_store_report && props.data.survey_store_report.length > 0 ? props.data.survey_store_report[0] : {};
    let actions = props.data.store_report_action && props.data.store_report_action.length != 0 ? props.data.store_report_action[0] : {};
    let img = [];
    if(storeReport.survey_images) {
      let images = storeReport.survey_images.split(',');
      if (images.length > 0) {
        images.map(item => {
          img.push(constant.baseUrl + item);
        })
      }
    }


    this.state = {
      actionData: props.data.store_report_action && props.data.store_report_action.length != 0 ? actions : "",
      location: null,
      isTFEnabled: '',
      isInit: true,
      addReportActive: false,
      mobile_start_date_time: '',
      mobile_end_date_time: '',
      actionID: actions.action_id ? actions.action_id : "",
      esclationStatus: actions.escalation_status ? actions.escalation_status : "",
      actionStatus: actions.action_status ? actions.action_status : "",
      actionTaken: actions.action ? actions.action : "",
      surveyReportID: storeReport.id ? storeReport.id : "",
      disableAction: props.data.store_report_action && props.data.store_report_action.length != 0,
      isMarkingComplete: false,
      showRating: props.data.type && props.data.type === 'Marking Based' ? true : false,
      showImagePreview: {value: false, index: 0},
      imagearray: [],
      imageBase64Datas: [],
      addReportDesc: storeReport.report_desc ? storeReport.report_desc : '',
      modalVisible: false,
      surveyImages: [],
      description: storeReport.report_desc ? storeReport.report_desc : '',
      selectedAction: storeReport.choosen_value ? storeReport.choosen_value : '',
      isDisable: false,
      holderRating: 0,
      rating: storeReport.rating_scale ? storeReport.rating_scale : 0,
      markDone: 0,
      uploadImage: img,  
    }
  }
  

  componentDidMount = () => {
    this.updateCachedDate()
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.selectedAction !== this.state.selectedAction) {
      console.log('selectedAction changed:', this.state.selectedAction);
    }
  }

  // Save context
  saveReportDesc = () => {
    this.setState({modalVisible: false})
  }
 requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS auto-prompts
  };

  handleCapturedImage = () => {
    try {
      const newImage = this.state.latestCapturedImage;
     
       const   uploadImage = Array.from(new Set([...this.state.uploadImage, newImage]))
           
          this.updateOtherFieldInfo({ uploadImage:  uploadImage,});
      
      
    } catch (err) {
      console.error('Image capture error:', err);
      Alert.alert('', 'Something went wrong, please try again!');
    }
  };

  onChooseGallery = async () => {

    const {uploadImage} = this.state;
    if (uploadImage.length == 4) {
      Alert.alert('', 'You can only upload 4 images');
      return;
    }
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) return;
  
    this.props.navigation.navigate('CameraScreen', {
      onCapture: (uri) => {    
        this.setState({ latestCapturedImage: uri }, () => {
          this.handleCapturedImage(); 
        });
      }
    });

  };

  padToTwoDigits = (number) => {
    return number.toString().padStart(2, '0');
  }

  getDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = this.padToTwoDigits(now.getMonth() + 1); 
    const day = this.padToTwoDigits(now.getDate());

    const hours = this.padToTwoDigits(now.getHours());
    const minutes = this.padToTwoDigits(now.getMinutes());
    const seconds = this.padToTwoDigits(now.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  }

  prepareTosendData = (value) => {
    
    const {mobile_start_date_time, addReportDesc, uploadImage, rating, description, selectedAction} = this.state;
    const mobile_start_date_time1 = mobile_start_date_time ? mobile_start_date_time : this.getDateTime();
    this.setState({mobile_start_date_time: mobile_start_date_time1});
    let parameters = {
      survey_id: this.props.params.survey_id,
      user_id: this.props.params.user_id,
      store_id: this.props.params.store_id,
      token: this.props.params.token,
      device_id: this.props.params.device_id,
      query_id: this.props.data.id,
      mobile_end_date_time: this.getDateTime(),
      mobile_start_date_time: mobile_start_date_time1,
      report_desc: addReportDesc ? addReportDesc : description,
      fles: value?.uploadImage ? value?.uploadImage : uploadImage,
      score: value?.rating || rating,
      choosenvalue: value?.selectedAction || selectedAction
    };
    return parameters;
  }


  updateWithLocation = async (parameters, userLocation) => {
   
   
    try {
      const { survey_id, user_id, device_id, store_id, token, query_id, report_desc, fles, score, mobile_start_date_time, mobile_end_date_time, choosenvalue } = parameters;
      const { id: question_id, audit_question_id } = this.props.data;
      const { reporting_date } = this.props.params;
      const { area_id } = this.props.sectiond;
  
      const baseKey = `survey_q_${survey_id}_${store_id}_${question_id}_${audit_question_id}_${reporting_date}_${area_id}`;
  
      const local_data = {
        survey_id,
        user_id,
        device_id,
        store_id,
        token,
        query_id,
        report_desc,
        fles_count: fles.length,
        score,
        mobile_start_date_time,
        mobile_end_date_time,
        choosenvalue,
        choosen_value: choosenvalue,
        latitude: String(userLocation?.latitude || ""),
        longitude: String(userLocation?.longitude || "")
      };
  
      const keyValuePairs = [
        [baseKey, JSON.stringify(local_data)]
      ];
  
      fles.forEach((file, index) => {
        
        keyValuePairs.push([`${baseKey}_fles_${index}`, file]);
      });
  
      keyValuePairs.push([
        `survey_q_${survey_id}_${store_id}_${reporting_date}`,
        'true'
      ]);
  
      await AsyncStorage.multiSet(keyValuePairs);

      let syncData = await AsyncStorage.getItem(baseKey)

      console.log(syncData);
      
      if(syncData){   
        
        let AsyncStorageData= JSON.parse(syncData)
    
        this.setState({ selectedAction:AsyncStorageData.choosenvalue })
        this.setState({ rating: AsyncStorageData.score })
        this.setState({ uploadImage: fles }) 
      }   
       
    } catch (e) {
      console.log("ERROR IN SAVING LOCAL DATA", e);
    }
  }

  hasPermissionIOS = async () => {
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

  hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await this.hasPermissionIOS();
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

  
  getLocation = async (value) => {
    console.log('this.props.userLocation',this.props.userLocation);
          this.updateWithLocation(this.prepareTosendData(value), this.props.userLocation)
  
  }


  updateTextFieldInfo = () => {
    clearTimeout(this.timeout.current);
    this.timeout.current = setTimeout(()=>{
      this.props.enableSync();
      this.getLocation()
    }, 1200);
  }


  updateOtherFieldInfo = (value) => {
    //rating, selectedAction, uploadImage
    this.props.enableSync(); 
    this.getLocation(value)
  }

  updateCachedDate = async  (data) => {
    try {
      if (!this.props.isFromApi) {
        const { survey_id, store_id, reporting_date } = this.props.params;
        const { id: question_id, audit_question_id } = this.props.data;
        const { area_id } = this.props.sectiond;
  
        const baseKey = `survey_q_${survey_id}_${store_id}_${question_id}_${audit_question_id}_${reporting_date}_${area_id}`;
        const localData = await AsyncStorage.getItem(baseKey);
  
        const jsonValue = JSON.parse(localData);
       
     if (!this.props.isDisabled && jsonValue) {
          let imgDtArr = [];
  
          if (jsonValue.fles_count && jsonValue.fles_count > 0) {
            const flesKeys = Array.from({ length: jsonValue.fles_count }, (_, idx) => `${baseKey}_fles_${idx}`);
            const flesResults = await AsyncStorage.multiGet(flesKeys);
            imgDtArr = flesResults.map(([_, val]) => val);
          }
    
          this.setState({
            surveyReportID: jsonValue.id,
            selectedAction: jsonValue.choosenvalue,
            addReportDesc: jsonValue.report_desc,
            description: jsonValue.report_desc,
            rating: jsonValue.score,
            disableAction: true,
            mobile_end_date_time: jsonValue.mobile_end_date_time || "",
            mobile_start_date_time: jsonValue.mobile_start_date_time || "",
            uploadImage: imgDtArr,
          });
        }
      }
    } catch (e) {
      console.log("ERROR", e);
    }
  }


  DescriptionModal = () => {
    const {modalVisible, addReportDesc} = this.state;
    return <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        this.setState({modalVisible: !modalVisible});
      }}
     >
        <View  onPress={() => {
        this.setState({modalVisible: true});
      }} style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{this.props.data.survey_query}</Text>
            <View style={styles.popupDescInput}>
              <TextInput
                style={{flex: 1, color: '#545454',fontWeight:'600'}}
                multiline={true}
                dataDetectorTypes="all"
                onChangeText={ (text) => this.setState({addReportDesc: text}, () => {
                  this.updateTextFieldInfo();
                })}
                value={addReportDesc}
              />
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <Pressable
                onPress={() => {
                  this.setState({modalVisible: !modalVisible});
                }}
                style={styles.popupButton}>
                <Text style={{color: 'white'}}>Back</Text>
              </Pressable>
              <TouchableOpacity
                onPress={() => this.saveReportDesc()}
                style={styles.popupButton}>
                <Text style={{color: 'white'}}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </Modal>
  };

  parseimageToPreview = () => {
    const {uploadImage} = this.state;
    let img = [];
    uploadImage.map(item => {
      let url = { uri: item }
      img.push(url);
    })
    return img;
  }

 handleUrlPress = (url, matchIndex /*: number*/) => {
   Linking.openURL(url);
 };

  createAction = () => {
    if (this.props.store_id) {
      navigate('createAction', {storeId: this.props.store_id, site_details: this.props.site, surveyData: this.props.data, surveyReportID: surveyReportID});
    }
  }

  render = () => {
    const { actionData,
    location,
    isTFEnabled,
    isInit,
    addReportActive,
    mobile_start_date_time,
    mobile_end_date_time,
    actionID,
    esclationStatus,
    actionStatus,
    actionTaken,
    surveyReportID,
    disableAction,
    isMarkingComplete,
    showRating,
    showImagePreview,
    imagearray,
    imageBase64Datas,
    addReportDesc,
    modalVisible,
    surveyImages,
    description,
    selectedAction,
    isDisable,
    holderRating,
    rating,
    uploadImage,
    markDone } = this.state;

    return <View style={[styles.container, this.props.isvalid == false ? {backgroundColor: "#ffd0d0e6"} : {}]}>

      <View style={styles.questionContainer}>
        <Text style={styles.item}>
          {this.props.index + 1}. {this.props.data.survey_query}
          {/* {this.props.data.Mandatory === 'Yes' || (this.props.data.option_types === 'YENO' && (this.props.data.yes_image == "R" || this.props.data.no_image == "R") ) ? (
           <Text style={{color: 'red', fontSize: 20}}>*</Text>
          ) : null} */}
           {this.props.data.Mandatory === 'Yes' ? (
           <Text style={{color: 'red', fontSize: 20}}>*</Text>
          ) : null}
        </Text>
        {this.props.isvalid == false && <Text style={{color: "#e40a0a", fontSize: 14}}>{this.props.validmsg}</Text> }
      </View>
      <View style={styles.actionContainer}>
        <View style={{width: '75%'}}>
          {this.props.data.option_types !== 'Text' && (
            <>
              <ScrollView horizontal>
                {getOptionTypes(this.props.data.option_types).map((item, index) => (
                  <TouchableOpacity
                    onPress={() => {this.updateOtherFieldInfo({selectedAction:item.value})}}
                    disabled={this.props.isDisabled}
                    key={index}
                    style={[
                      styles.actionStyle,
                      {
                        backgroundColor:
                          selectedAction === item.value ? item.color : null,
                        borderColor:
                          selectedAction === item.value ? '#fff' : '#000',
                      },
                    ]}>
                    <Text style={styles.actionText}>{item.value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          {this.props.data.option_types === 'Text' && (
            <View style={[styles.popupDescInput, {pointerEvents: this.props.isDisabled ? "none" : "auto"}]}>
              <TextInput
                style={{flex: 1, color: '#545454',fontWeight:'600'}}
                multiline={true}
                dataDetectorTypes="all"
                onChangeText={(text) => {this.setState({addReportDesc: text}, () => {this.updateOtherFieldInfo();})}}
                value={addReportDesc}
              />
            </View>
          )}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => this.onChooseGallery()}
            disabled={this.props.isDisabled}
            style={{position: "relative"}}>
    

            <Ionicons name="camera-outline" size={20} color="grey" />
            {( (selectedAction == "Yes" || selectedAction == "No" ) && this.props.data.yes_image == "R" && this.props.data.no_image == "R") ||
             (this.props.data.yes_image == "R" && selectedAction == "Yes") ||
             (this.props.data.no_image == "R" && selectedAction == "No") ? (
              ((selectedAction !== "NA") && <Text style={{color: 'red', fontSize: 20, position: "absolute", top: -12, right: -6}}>*</Text>)
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {this.setState({modalVisible: true})}}
            disabled={this.props.isDisabled}>
            <Ionicons name="chatbox-outline" size={20} color="grey" />
          </TouchableOpacity>
        </View>
      </View>
     
      {uploadImage.length > 0 && (
        <View style={styles.clapperView}>
          <ScrollView horizontal>
          {uploadImage.map((item, index) => (
              <TouchableOpacity
                  key={index}
                  onPress={() => this.setState({showImagePreview: {value: true, index: index}})
                }>
                <ImageRender key={index} image={item} />
              </TouchableOpacity>
            ))}
           
          </ScrollView>
        </View>
      )}
      {addReportDesc !== '' && this.props.data.option_types !== 'Text' && (
        <View style={styles.descriptionView}>
          <ParsedText
            disabled={this.props.isDisabled}
            parse={[
              {
                pattern: /\B\@([\w\-]+)/gim,
                style: {color: '#0084ff'},
              },
              {
                type: 'url',
                style: {color: '#0084ff'},
                onPress: this.handleUrlPress,
              },
            ]}
            style={styles.paragraph}>
            {addReportDesc} 
          </ParsedText>
        </View>
      )}
      <View style={styles.clapperView}>
        <TouchableOpacity
          style={{width: 50, height: 30}}
          onPress={() => this.createAction()}
          disabled={disableAction}>
          <Image
            source={require('../assets/action.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        {actionTaken !== '' && (
          <View style={styles.actionView}>
            <Text>{actionTaken}</Text>
          </View>
        )}
      </View>
      {actionStatus != '' ? (
        <TouchableOpacity
          onPress={() =>
            navigate('actionDetail', actionData)
          }>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginHorizontal: 24,
              marginBottom: 8,
            }}>
            {esclationStatus === 'Y' && (
              <View
                style={{
                  borderRadius: 5,
                  paddingHorizontal: 5,
                  marginHorizontal: 8,
                  backgroundColor: '#E30B5C',
                }}>
                <Text style={{color: '#fff', paddingVertical: 5}}>
                  Escalated
                </Text>
              </View>
            )}
            {actionStatus != '' && (
              <View
                style={{
                  backgroundColor:
                    actionStatus === 'Pending' ? '#fffff0' : '#ECFFDC',
                  borderRadius: 5,
                  paddingHorizontal: 5,
                }}>
                <Text style={styles.date}>
                  {actionStatus === 'Pending' ? 'To Do' : 'Closed'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : null}
      {showRating && (
        <View style={styles.ratingView}>
          <StarRating
            color={constant.primaryColor}
            emptyColor={'#ccc'}
            starSize={20}
            disabled
            rating={rating}
            onChange={!this.props.isDisabled ?  (rating) => {this.updateOtherFieldInfo({rating:rating})} : (rating) => {this.setState({holderRating: rating})}}
          />
        </View>
      )}
      <View style={styles.bottomBorderView} />
      {this.DescriptionModal()}
      {showImagePreview && (
        <ImageView
          images={this.parseimageToPreview()}
          imageIndex={showImagePreview.index}
          onRequestClose={() =>  this.setState({showImagePreview: {value: false, index: 0}}) }
          visible={showImagePreview.value}
        />
      )}

    </View>
  };
}

    export default memo(SurveyQuestions);


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    padding: 10,
    paddingHorizontal: 16,
    //justifyContent: 'space-around',
  },
  actionContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionStyle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    margin: 5,
    flexWrap: 'wrap',
  },
  bottomBorderView: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginLeft: 12,
  },
  item: {
    width: '92%',
    fontFamily: 'Arial',
    color: 'black',
  },
  actionText: {
    color: '#000'
  },
  clapperView: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center'
  },
  ratingView: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  descriptionView: {
    padding: 10,
    margin: 12,
    borderColor: '#000',
    borderWidth: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
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
    padding: 10,
    color: 'gray'
  },
  actionView: {
    flex: 1,
    padding: 10,
    marginHorizontal: 12,
    borderColor: '#000',
    borderWidth: 0.5,
  },
  date: {
    paddingVertical: 5,
    color: 'gray',
  },
});
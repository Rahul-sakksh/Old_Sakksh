import React, {memo, Component} from 'react';
import {View, Text, SectionList, StyleSheet, Alert, Platform, PermissionsAndroid, ActivityIndicator, TextInput, UIManager, LayoutAnimation, Modal} from 'react-native';
import API from '../Utils/Api';
import NavigationBar from '../Common/NavigationBar';
import * as constant from '../Utils/Constants';
import SurveryQuestions from '../Common/SurveryQuestions';
import {SafeAreaView} from 'react-native-safe-area-context';
import Loader from '../Common/Loader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';
import { navigate } from '../Utils/RootNavigation';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import GetLocation from 'react-native-get-location';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import ImgToBase64 from 'react-native-image-base64';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ToastAndroid } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';


class Questionaire extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      questionaire: [],
      isLoading: true,
      isQsLoading: false,
      enableMarkComplete: false,
      disableInteraction: false,
      isPdfLoading: false,
      hasSync: false,
      isSubmit: false,
      isFromApi: false,
      submitPerc: 0,
      searchTxt: "",
      totalQz: 0,
      isConnected: null,
      expandedSections:{},
      showFilterPopup:false,
      selectedFilter : 'All',
      incompletedShow: false,
    }
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
 

  //Util function to change key name
  renameKey = (obj, oldKey, newKey) => {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }

  //Function to get questionaire
  getQuestionaire = async (values, _flg) => {
    try {
      const response = await API.get('/sales_survey_report_audit_copy.php', { params: values });
        
           
      if (response.data.data && response.data.data.length > 0) {
        let enableMarkComplete = false;
        let disableInteraction = false;
  
        response.data.data.forEach(obj => this.renameKey(obj, 'bifurcation', 'data'));
  
        response.data.data.forEach(obj => {
          if (obj.data) {
            obj.data.forEach(data => {
              console.log(data);
              
              if (data.is_uploaded) enableMarkComplete = true;
  
              if (data.survey_store_report && data.survey_store_report.length > 0) {
                if (data.survey_store_report[0].mark_completed === "1") {
                  enableMarkComplete = false;
                  disableInteraction = true;
                }
              }
            });
          }
        });
  
        // Save data to AsyncStorage
        await AsyncStorage.setItem('@questionaire_data', JSON.stringify(response.data.data));
  
        this.setState({ enableMarkComplete, disableInteraction });
  
        if (_flg) {
          this.setSubmitPercentage(1);
          setTimeout(() => {
            this.setState({ isSubmit: false, submitPerc: 0, totalQz: 0, hasSync: false }, () => {
              this.validateBeforeSubmit(response.data.data);
            });
          }, 500);
        } else {
          this.setState({ questionaire: response.data.data, isLoading: false, isQsLoading: false });
        }
      }
    } catch (error) {
      if (!this.state.isConnected) {
        Alert.alert('Connection Lost', 'Connection lost. Please reconnect to continue.');
          }
      this.setState({ isSubmit: false, submitPerc: 0 , hasSync: false , enableMarkComplete:false})
      console.error("Failed to fetch questionaire", error);
    }
  };

  componentDidMount = () => {
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);

    NetInfo.fetch().then(state => {
      this.setState({ isConnected: state.isConnected }, () => {
        if (state.isConnected) {
          this.updateSysc();
          this.getQuestionaire(this.props.route.params.params);
        } else {
          this.updateSysc();
          this.loadQuestionaireFromStorage(); // load offline data
        }
      });
    });
  };

  loadQuestionaireFromStorage = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('@questionaire_data');
      if (jsonData !== null) {
        const data = JSON.parse(jsonData);
        let enableMarkComplete = false;
        let disableInteraction = false;

        data.forEach(obj => {
          if (obj.data) {
            obj.data.forEach(data => {
              if (data.is_uploaded) enableMarkComplete = true;
  
              if (data.survey_store_report && data.survey_store_report.length > 0) {
                if (data.survey_store_report[0].mark_completed === "1") {
                  enableMarkComplete = false;
                  disableInteraction = true;
                }
              }
            });
          }
        });
    
        this.setState({ questionaire: data, isLoading: false, isQsLoading: false,enableMarkComplete, disableInteraction  });
      } else {
        console.warn('No saved questionaire data found');
      }
    } catch (error) {
      console.error('Error loading questionaire from storage:', error);
    }
  };


  //-------Location Ends ------//
  conponentDidUpdate = () => {
    if (this.props.route && this.props.route.params && this.props.route.params.params) {
      this.getQuestionaire(this.props.route.params.params);
    }
  }

  componentWillUnmount() {
    // Unsubscribe from network state updates
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleConnectivityChange = async (state) => {
    this.setState({ isConnected: state.isConnected });
    if(state.isConnected){
      
    await AsyncStorage.setItem('@store_list', JSON.stringify(this.props.route.params.storeList));}

    const dataToStore = {
      storeId: this.props.route.params.params.store_id, 
      audits: this.props.route.params.surveyList
    };
    
    await AsyncStorage.setItem('@survey_audit_list', JSON.stringify(dataToStore));

   
    const survey_reporting_date = {
      survey_id: this.props.route.params.params.survey_id, 
      audits: this.props.route.params.dateList
    };
    await AsyncStorage.setItem('@survey_reporting_date', JSON.stringify(survey_reporting_date));

    await AsyncStorage.setItem('@survey_reporting_selected_date', this.props.route.params.params.reporting_date);

  };

  enableSync = () => {
    this.setState({isFromApi: false, hasSync: true})
  }

  // -----Location-------// 
  //Get Location
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

  updateSysc = async () => {
    try {
      const { disableInteraction, enableMarkComplete } = this.state;
      if (disableInteraction || enableMarkComplete) return;
  
      const { survey_id, store_id, reporting_date } = this.props.route.params.params;
      const cacheKey = `survey_q_${survey_id}_${store_id}_${reporting_date}`;
  
      const asdata = await AsyncStorage.getItem(cacheKey);
  
      if (asdata) {
        this.setState({ hasSync: true });
      }
    } catch (e) {
      console.log("Error in updateSysc", e);
    }
  };
  


  //check if any question is left without answer
  isQuestionsWithoutAnswers = () => {
    for (var i = 0; i < questionaire.length; i++) {
      var element = questionaire[i].data
      for (var j = 0; j < element.length; j++) {
        var name = element[j];
        if (name.is_uploaded === 0) {
          return true;
        }
      }
    }
  }

  showPromptBeforeMarkComplete = () => {
    let alertMessage = 'Do you really want to mark the survey Completed?';
    Alert.alert(
      'Mark Complete',
      alertMessage,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Yes', style: 'cancel',  onPress: () => {this.markComplete(this.props.route.params.params)}},
      ],
      {cancelable: false},
    );
  }

  //Function to handle submit
  markComplete = async values => { 

    this.setState({isPdfLoading: true});
    
    const params = new FormData();
    params.append('survey_id', values.survey_id);
    params.append('user_id', values.user_id);
    params.append('device_id', values.device_id);
    params.append('store_id', values.store_id);
    params.append('token', values.token);
    params.append('reporting_date', values.reporting_date);

    const requestOptions = {
      method: "POST",
      body: params,
      redirect: "follow"
    };
    fetch(`${constant.baseUri}mark_complete.php`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
       
          if (res.data && res.data.length > 0) {
            if (res.status === 'success') {
              
              this.setState({
                disableInteraction: true,
                isLoading: false,
                isPdfLoading: true,
                incompletedShow:false,
                
              }, () => {
                this.getQuestionaire(this.props.route.params.params);
                this.sendMail(values);
                this.getPdf(values);
              });
            }
            Snackbar.show({
              text: res.data[0].message,
              duration: Snackbar.LENGTH_SHORT,
            });
            setTimeout(() => {
              this.setState({isPdfLoading: false});
            }, 500)
          }
      })
      .catch((error) => { 
        
        if (error.response?.status === 305) {
          this.getQuestionaire(this.props.route.params.params);
          Alert.alert(
            'Mark Complete',
            error.response?.data?.data[0].message,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        } else{ 
          this.setState({
            disableInteraction: true,
            isLoading: false,
            isPdfLoading: true,
            incompletedShow:false,
          }, () => {
            this.getQuestionaire(this.props.route.params.params);
            this.sendMail(values);
            this.getPdf(values);
          });
       
        Snackbar.show({
          text: 'Inspection has been submitted successfully!',
          duration: Snackbar.LENGTH_SHORT,
        });
        setTimeout(() => {
          this.setState({isPdfLoading: false});
        }, 500)
      }
        this.setState({isLoading: false});
      });

  }

  sendMail = async values => {
    let urlParams = `${constant.baseApi}/cpanel/survey_report_email_mob.php?store=${values.store_id}&survey_id=${values.survey_id}&submit_date=${values.reporting_date}&area=`
    axios.get(urlParams)
    .then((result) => {
      console.log('result :', result);
    })
    .catch((err) => {
      console.log('err :', err);
    })
  }

  getPdf = async values => {
    let urlParams = `${constant.baseApi}/cpanel/surevyReport.php?store=${values.store_id}&survey_id=${values.survey_id}&reportDt=${values.reporting_date}`;
    navigate('pdfViewer', {base64: urlParams});
    this.setState({isPdfLoading: true});
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.searchTxt !== this.props.searchTxt ||
      prevProps.questionaire !== this.props.questionaire
    ) {
      this.updateExpandedSections();
    }
    
  }

  updateExpandedSections = () => {
    const { questionaire, searchTxt } = this.props;
    const expanded = {};

    questionaire.forEach(section => {
      const filteredData = section.data.filter(item =>
        (item.survey_query + "").toLowerCase().includes(searchTxt.toLowerCase())
      );
      expanded[section.area_id] = filteredData.length > 0;
    });

    this.setState({ expandedSections: expanded });
  };

  toggleSection = (area_id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    this.setState(prevState => ({
      expandedSections: {
        ...prevState.expandedSections,
        [area_id]: !prevState.expandedSections[area_id]
      }
    }));
  };

 
  renderItem = ({item, index, section}) =>  { 
    
    const navigation = useNavigation();
    return <SurveryQuestions 
    isFromApi={this.state.isFromApi} 
    key={item.id} 
    isvalid = {item.isvalid} 
    navigation={navigation}
    validmsg = {item.validmsg} 
    sectiond={section} 
    index = {index} 
    data={item} 
    enableSync={this.enableSync} 
    params={this.props.route.params.params} 
    isUploaded = {() => this.setState({enableMarkComplete: true}) } 
    isDisabled = {this.state.disableInteraction} 
    isImageRequired = {this.props.route.params.isImageRequired}
    userLocation = {this.props.route.params.userLocation}
  />
  };

  dateToShow = () => {
    return moment(this.props.route.params.params.reporting_date, 'YYYY-MM-DD')
  }

  getSiteName = () => {
    return this.props.route.params.site
  }

  syscDataToDb = async () => {
console.log(this.state.submitPerc,'subPer>>>>>>>>');

    const {questionaire, isConnected} = this.state;
    
    if(isConnected){
      if(questionaire.length){
        let tCount = 0;
        for ( var i = 0; i < questionaire.length; i++ ){
          let items = questionaire[i];
          for ( var j = 0; j < items.data.length; j++ ){
            tCount++;
          }
        }
        this.setState({totalQz: tCount, isFromApi: true, isSubmit: true}, () => { this.syncDataToDbPush();})
      }
    } else {
      Alert.alert("", "Internet not available, Please try again!")
    }
  }

  setSubmitPercentage(value) {
    this.setState({ submitPerc: value });
  }

  syncDataToDbPush = async () => {
    
    const { questionaire } = this.state;
    const { survey_id, store_id, reporting_date } = this.props.route.params.params;
    let loop = 0;
    let flg = true;
    let an = 0;
    let totalQz = this.state.totalQz;
    try {
      this.setSubmitPercentage(0.1);
      // Gather all keys for bulk get
      const keysToFetch = [];
    

      questionaire.forEach(items => {
        items.data.forEach(item => {
          const baseKey = `survey_q_${survey_id}_${store_id}_${item.id}_${item.audit_question_id}_${reporting_date}_${items.area_id}`;
          keysToFetch.push(baseKey);
          for (let p = 0; p < 4; p++) {
            this.setState({submitPerc: this.state.submitPerc*p/100 });
            keysToFetch.push(`${baseKey}_fles_${p}`);
          }
        });
      });
  
      const allItems = await AsyncStorage.multiGet(keysToFetch);
      this.setSubmitPercentage(0.2);

      const keyValueMap = Object.fromEntries(allItems);


      const totalItems = questionaire.reduce((count, items) => count + items.data.length, 0);
      let processedCount = 0;
    
      for (const items of questionaire) {
        for (const item of items.data) {
        
          if (!this.state.isConnected) {
            throw new Error("Internet disconnected during sync");
          }
         
          const baseKey = `survey_q_${survey_id}_${store_id}_${item.id}_${item.audit_question_id}_${reporting_date}_${items.area_id}`;
          const itemData = keyValueMap[baseKey];
          if (itemData && flg) {
            
            try {
              const itemJson = JSON.parse(itemData);
              const imageDates = [];
              
              for (let p = 0; p < itemJson.fles_count; p++) {
                const imgKey = `${baseKey}_fles_${p}`;
                const imageData = keyValueMap[imgKey];
                if (imageData) imageDates.push(imageData);
              }
  
              itemJson["fles"] = imageDates;
              await this.submitWithLocation(itemJson, loop);
              loop++;
              
  
            } catch (innerErr) {
              console.log("Inner JSON parse error", innerErr);
              flg = false;
            }
          }       
        }
        
        processedCount++;
        const perc = 0.2 + ((0.5 / questionaire.length ) * processedCount); // Uploading: 20% to 70%
        this.setSubmitPercentage(perc); 
     
      }

      this.setSubmitPercentage(0.8)

      
  
      // Final refresh or error
       if (flg) {
        // Remove all used keys at once
        await AsyncStorage.multiRemove(keysToFetch);
        await AsyncStorage.removeItem(`survey_q_${survey_id}_${store_id}_${reporting_date}`);
      
        if (!this.state.isConnected) {
          throw new Error("Internet disconnected during sync");
        }
      
        this.getQuestionaire(this.props.route.params.params, true);
      } else {
        this.setState({ isSubmit: false, submitPerc: 0 });
        Alert.alert('', 'Something went wrong, Please try again!');
      }
  

    } catch (error) {
      console.log("SYNC ERROR:", error.message);
      this.setState({ isSubmit: false, submitPerc: 0 });
    
      if (error.message === 'Internet disconnected during sync') {
        Alert.alert('Connection Lost', 'Internet connection was lost during sync. Please try again.');
      } else {
        Alert.alert('Error', 'Unexpected error occurred. Please try again later.');
      }
    }
    
  };
  

  validateBeforeSubmit = async (_qd) => {
              
    const {questionaire, isConnected} = this.state;
    if(isConnected){
      let flg = true;
      let questionaireE = _qd ? _qd : questionaire;
      try {
        if(questionaireE.length){
          for ( var i = 0; i < questionaireE.length; i++ ){
            let items = questionaireE[i];
            for ( var j = 0; j < items.data.length; j++ ){
              
              let res = this.checkforImageUpload(items.data[j]);
              if(res.flg){
                questionaireE[i].data[j].isvalid = true;
              } else {
                if(flg){
                  flg = false;
                }
                questionaireE[i].data[j].isvalid = false;
                questionaireE[i].data[j].validmsg = res.msg;
              }
            }
           
          }
        }
         
        this.setState({questionaire: questionaireE, isLoading: false, isQsLoading: false , incompletedShow:true }, () => {
          if(flg){
            if( this.state.selectedFilter === 'Incomplete' ){
            this.setState({selectedFilter:'All'})}
            this.setState({enableMarkComplete: true}, () => {
              console.log("AFTER SAVE", this.state.questionaire);
              if(!_qd){
                this.showPromptBeforeMarkComplete();
              }
            });
          } else {
            setTimeout(() => {
              Alert.alert("", "Please fill the required fields!");
            }, 300) 
          }
          if(_qd){
            setTimeout(() => {
              Alert.alert('', 'Audit data sync with server.');
            }, 300)
           
          }
        });
       
      } catch(e){
        console.log("VALIDATION ERROR", e)
      }
    } else {
      Alert.alert("", "Internet not available, Please try again!")
    }
  }

  checkforImageUpload = (data) => {
    let status = {flg: true ,msg: ""};
    let {report_desc, choosen_value, choosenvalue, survey_images} = data.survey_store_report[0] ? data.survey_store_report[0] : {};
    report_desc = report_desc ? report_desc : "";
    choosen_value = choosen_value ? choosen_value : choosenvalue ? choosenvalue : "";
    survey_images = survey_images ? survey_images : "";
    if(data.Mandatory === 'Yes' && choosen_value === 'NA'){
      return  {flg: true ,msg: ``};
    }
    if (data.Mandatory ===  'Yes' && data.option_types === "Text" && report_desc === '') {
      return {flg: false ,msg: `Please add text to this question!!!`};
    }

    if (data.Mandatory === 'Yes' && choosen_value == '') {
      return {flg: false ,msg: `Option selection is mandatory`};
    }

    if (data.option_types === 'YENO' && choosen_value == '') {
      return {flg: false ,msg: `Option selection is mandatory`};
    }

  
    if (data.option_types === "YENONA" && choosen_value === 'NA') {
      return  {flg: true ,msg: ``};
    } else if (choosen_value == 'Yes') {
      switch (data.yes_image) {
        case 'R':
          if (survey_images.length == 0) {
            return {flg: false ,msg: `Please upload atleast one image`};
          } else {
            return {flg: true ,msg: ""};
          }
        case 'P':
          if (survey_images.length == 0) {
            return {flg: true ,msg: ""};
          } else {
            return {flg: true ,msg: ""};
          }
        default:
          return {flg: true ,msg: ""};
      }
    } else if (choosen_value == 'No') {
      switch (data.no_image) {
        case 'R':
          if (survey_images.length == 0) {
            return {flg: false ,msg: `Please upload atleast one image`};
          } else {
            return {flg: true ,msg: ""};
          }
        case 'P':
          if (survey_images.length == 0) {
            return {flg: true ,msg: ""};
          } else {
            return {flg: true ,msg: ""};
          }
        default:
          return {flg: true ,msg: ""};
      }
    } else {
      return {flg: true ,msg: ""};
    }
    return status;
  }

  submitWithLocation = async (parameters, index) => {
   
      let image64 = [];
      for(var i = 0; i < parameters.fles.length; i++){
        if(parameters.fles[i].indexOf(constant.baseUri) != -1){
            image64.push(parameters.fles[i]);
        } else {
          await ImgToBase64.getBase64String(parameters.fles[i])
          .then(base64String => {
            image64.push(base64String);
          })
          .catch(err => console.log('err', err));
        }
      }

      const formData = new FormData();

      formData.append('survey_id', parameters.survey_id);
      formData.append('user_id', parameters.user_id);
      formData.append('device_id', parameters.device_id);
      formData.append('store_id', parameters.store_id);
      formData.append('token', parameters.token);
      formData.append('query_id', parameters.query_id);
      formData.append('report_desc', parameters.report_desc);
      formData.append('fles', image64);
      formData.append('reporting_date', this.props.route.params.params.reporting_date);
      formData.append('score', parameters.score);
      formData.append('choosenvalue', parameters.choosenvalue ? parameters.choosenvalue : "");
      formData.append('latitude', parameters.latitude);
      formData.append('longitude', parameters.longitude);
      formData.append('mobile_start_date_time', parameters.mobile_start_date_time);
      formData.append('mobile_end_date_time', parameters.mobile_end_date_time);
      
    // console.log('formData',formData);
    
     try{
      const sresult = await axios({
        url: `${constant.baseUri}survey_store_report_pj.php`,
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(' ✅ ✅ ✅ suceess',sresult.data);

      return true;
    } catch (error) {
      console.log("QS SYNC ERROR", error)
      Alert("Something went wrong, Please try again!!!");
      return false;
    }
  }



  render = () => {
    const  {
      questionaire,
      isLoading,
      isQsLoading,
      enableMarkComplete,
      disableInteraction,
      isPdfLoading,
      hasSync,
      isSubmit,
      submitPerc,
      searchTxt,
      expandedSections,
      incompletedShow,
    } = this.state;


    return isLoading ?
     <Loader /> :
     (
      <SafeAreaView
        style={{backgroundColor: constant.primaryColor}}
        edges={['top']}>
        <View style={styles.container}>
          <NavigationBar
            title={this.props.route.params.survey_name}
            showBackButton={true}
            hideRightButtons={true}
            onPressBack={() => this.props.navigation.goBack()}
          />
          <View style ={{borderColor: constant.headerGreen, borderWidth: 1 ,margin: 8, paddingBottom: 8, alignItems: "center", justifyContent: 'center'}}>
            <Text
              style={{paddingTop: 5, fontWeight: 'bold', textAlign: 'center', paddingBottom: 8}}>
              {moment(this.dateToShow()).format('MMM DD, YYYY')}
            </Text>
            <Text>{this.getSiteName().area}</Text>
          </View>
          <View style={{position: "relative"}}>
            <TextInput
              style={{padding: 5, width: "95%", borderWidth: 1, borderColor: "#000", marginTop: 4, alignSelf: "center"}}
              value={searchTxt}
              placeholder='Enter text to search...'
              onChangeText={(text) => {this.setState({searchTxt: text})}} />

              <Ionicons
                name="search"
                size={24}
                color="#000"
                style={{paddingRight: 20, position: "absolute", right: 30, top: 10}}
              />
              
              <View style={{ paddingRight: 20, position: "absolute", right: 0, top: 10 }}>
                   <TouchableOpacity onPress={() => this.setState({ showFilterPopup: !this.state.showFilterPopup })}>
                     <View>
                       <AntDesign name="filter" size={24} />
                       {this.state.selectedFilter !== 'All' && (
                         <View
                           style={{
                             position: 'absolute',
                             top: -1,
                             right: 0,
                             width: 8,
                             height: 8,
                             borderRadius: 4,
                             backgroundColor: '#3f67eb',
                           }}
                         />
                       )}
                     </View>
                   </TouchableOpacity>
                 </View>
                 
                 {this.state.showFilterPopup && (
                     <View
                       style={{
                         position: 'absolute',
                         right: 10,
                         top: 50,
                         backgroundColor: '#fff',
                         borderWidth: 1,
                         borderColor: '#a1a1a1',
                         borderRadius: 10,
                         zIndex: 1000,
                         width: 150,
                         overflow: 'hidden',
                       }}
                     >
                    {(incompletedShow ? ['All', 'Mandatory', 'Incomplete'] : ['All', 'Mandatory']).map((filter, index, array) => (
                      <View key={filter}>
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({ selectedFilter: filter, showFilterPopup: false });
                          }}
                          style={{
                            padding: 10,
                            backgroundColor: this.state.selectedFilter === filter ? '#57a8eb' : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              color: this.state.selectedFilter === filter ? 'white' : 'black',
                              fontWeight: this.state.selectedFilter === filter ? 'bold' : '500',
                            }}
                          >
                            {filter}
                          </Text>
                        </TouchableOpacity>
                        {index !== array.length - 1 && (
                          <View style={{ height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 10 }} />
                        )}
                      </View>
                    ))}
               </View>
                 )}


            </View>  
          {questionaire && (
            <SectionList
              initialNumToRender={80}
              sections={questionaire.reduce((result, section) => {
                
                let filteredData = section.data;

                 // Apply selected filter first
                 if (this.state.selectedFilter === 'Mandatory') {
                   filteredData = filteredData.filter(item => item.Mandatory === 'Yes' || (item.option_types === 'YENO' && (item.yes_image == "R" || item.no_image == "R") ));
                 } else if (this.state.selectedFilter === 'Incomplete') {
                   filteredData = filteredData.filter(item => item.isvalid === false);
                 } 
                 // else if (this.state.selectedFilter === 'Unanswered') {
                 //   filteredData = filteredData.filter(item =>
                 //     !item.choosen_value && !item.choosenvalue
                 //   );
                 // } else if (this.state.selectedFilter === 'Answered') {
                 //   filteredData = filteredData.filter(item =>
                 //     item.choosen_value || item.choosenvalue
                 //   );
                 // }
             
              // Then apply search text
              filteredData = filteredData.filter(item =>
                (item.survey_query + '').toLowerCase().includes(this.state.searchTxt.toLowerCase())
              );
          
                if (filteredData.length > 0) {
                  result.push({
                    area_name: section.area_name,
                    area_id: section.area_id,
                    data: expandedSections[section.area_id] ? filteredData : [],
                    originalData: filteredData,
                  });
                }
          
                return result;
              }, [])}
              keyExtractor={(item, index) => item.id + item.area}
              renderItem={this.renderItem}
              renderSectionHeader= {({ section }) => {
                const { area_name, area_id } = section;
                const isExpanded = this.state.expandedSections[area_id];
            
                return (
                  <TouchableOpacity
                    onPress={() => this.toggleSection(area_id)}
                    style={{ backgroundColor: '#fff' }}
                  >
                    <View style={styles.headerView}>
                      <Text style={styles.header}>{area_name}</Text>
                      <AntDesign
                        name={isExpanded ? 'up' : 'down'}
                        size={18}
                        style={{ color:'#ffff' }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                this.state.selectedFilter === 'Incomplete' ? (
                  <View style={{ padding: 20, alignItems: 'center',marginTop:20 }}>
                    <Text style={{ color: 'black' }}>You’ve filled out all required fields.</Text>
                  </View>
                ) : null
              }
            />
          )}


          {(hasSync && !disableInteraction) ? 
          <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={isSubmit}
            style={[
              styles.button,
              isSubmit ? styles.buttonDisable : styles.buttonEnable
            ]}
            onPress={async () => { await this.syscDataToDb() }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Save Questions
            </Text>
          </TouchableOpacity>
          </View> :
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              disabled={!enableMarkComplete}
              style={[
                styles.button,
                enableMarkComplete ? styles.buttonEnable : styles.buttonDisable,
              ]}
              onPress={() => this.validateBeforeSubmit()}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                }}>
                Mark Complete
              </Text>
            </TouchableOpacity>
          </View>}
        </View>
        {isPdfLoading && <View style={{position:"absolute", top: 220, justifyContent:"center", alignSelf: "center", zIndex: 99, backgroundColor: "#fff", borderRadius: 10, elevation: 5, padding: 25}}>
            <ActivityIndicator color={"#222"} size={"large"} />
            <Text
                style={{
                  color: '#000',
                  fontSize: 18,
                  marginTop: 10,
                  fontWeight: '700',
                  textAlign: 'center',
                }}> Please wait, while report is getting generated.</Text>
        </View>}
        {isSubmit && 
          <View style={{position:"absolute", height: "100%", widht: "100%", alignContent: "center", alignSelf: "center",  zIndex: 99, backgroundColor: "#ccc"}}>
            <View style={{position:"absolute", top: 220, justifyContent:"center", alignSelf: "center", zIndex: 99, backgroundColor: "#fff", borderRadius: 10, elevation: 5, padding: 25}}>
              <ActivityIndicator color={"#222"} size={"large"} />
              <Text
                  style={{
                    color: '#000',
                    fontSize: 18,
                    marginTop: 10,
                    marginBottom: 10,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}> Audit sync inprogress... </Text>
              <Progress.Bar progress={submitPerc} width={200} />   
            </View>
          </View>
        } 

      </SafeAreaView>
    );
  }
}



  //Styles for the screen
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      height: '100%',
      paddingBottom: 20,
    },
    item: {
      padding: 20,
      marginVertical: 8,
    },
    headerView: {
      margin: 8,
      padding: 10,
      backgroundColor: constant.headerGreen,
      justifyContent: 'space-between',
      alignItems:'center',
      display:'flex',
      flexDirection:'row'
    },
    header: {
      fontSize: 18,
      color: '#fff',
      fontWeight: 'bold',
    },
    buttonContainer: {
      height: '10%',
      backgroundColor: '#ffff',
      justifyContent: 'center',
      marginHorizontal:10
    },
    button: {
      backgroundColor: constant.buttonColor,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignContent: 'center',
    },
    buttonEnable: {
      backgroundColor: '#cc618f',
    },
    buttonDisable: {
      backgroundColor: '#ccc',
    },
  });

export default memo(Questionaire);

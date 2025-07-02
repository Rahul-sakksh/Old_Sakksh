import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  useColorScheme,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationBarE } from "../../Common/NavigationBarEybii";
import Icon from "react-native-vector-icons/Feather";
import IonIcon from "react-native-vector-icons/Ionicons";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GetLocation from "react-native-get-location";
import API from "../../Utils/Api";
import { getData } from "../../Helpers/StorageHelper";
import * as constant from "../../Utils/Constants";
import moment from "moment";
import ImageRender from "../../Common/ImageRender";
import ImagePicker from "react-native-image-crop-picker";
import ImgToBase64 from "react-native-image-base64";
import Snackbar from "react-native-snackbar";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Loader from "../../Common/Loader";
import PhoneInput from "react-native-phone-number-input";
import Geolocation from "react-native-geolocation-service";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Image } from "react-native-elements";
import ImageView from "react-native-image-viewing";

function CheckIn({ navigation, route }) {
  const colorScheme = useColorScheme();
  const [locationText, setLocationText] = useState();
  const [state, setStates] = useState([]);
  const [selectedAddress, setselectedAddress] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setselectedCity] = useState("");
  const [pincode, setpincode] = useState("");
  const [contactIndex, setcontactIndex] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState([]);
  const [outletTypes, setOutletTypes] = useState([]);
  const [outletType, setOutletType] = useState(null);
  const [leadTypes, setLeadTypes] = useState([]);
  const [leadType, setLeadType] = useState(null);
  const [visitTypes, setVisitTypes] = useState([]);
  const [vistType, setvisitType] = useState(null);
  const [outletName, setOutletName] = useState(null);
  const [followupDate, setFollowupDate] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  //add loader
  const [isLoading, setIsLoading] = useState(false);
  const [issLoading, setIssLoading] = useState(false);

  //Intial Contacts
  var initialContacts = [];

  const [contactData, setcontactData] = useState([]);
  const [contactName, setcontactName] = useState(null);
  const [contactNumber, setcontactNumber] = useState(null);
  const [showImagePreview, setImagePreview] = useState([]);

  const [imageUri, setImageUri] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [UploadimageBase64Datas, setUploadImageBase64Datas] = useState([]);

  const addElement = () => {
    var newContact = [
      ...contactData,
      { id: contactIndex, name: contactIndex, phNumber: "", email: "" },
    ];
    setcontactData(newContact);
  };

  const postData = async () => {
    console.log("contactNumber.length", contactNumber);

    if (!(contactNumber == null || contactNumber.length == 0)) {
      if (!valid) {
        Alert.alert("Phone number is not valid");
        return;
      }
    }

    // if (outletType == null) {
    //   Alert.alert('Please select The Outlet Type');
    //   return;
    // }
    if (imageBase64Datas.length == 0) {
      Alert.alert("Please upload a selfie");
      return;
    }
    if (locationText == "" && !isEdit) {
      Alert.alert("Please enter address");
      return;
    }

    let imageData = [imageBase64Datas];
    UploadimageBase64Datas.map((item) => {
      imageData.push(item);
    });

    console.log("imageData", imageData.length);

    setIssLoading(true);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", await getData(constant.userID));
      formData.append("device_id", await getData(constant.deviceID));
      formData.append("token", await getData(constant.token));
      formData.append("map_address", locationText);
      formData.append("user_modified_address", address);
      formData.append("city", selectedCity);
      formData.append("state", selectedAddress);
      formData.append("pincode", pincode);
      formData.append("lat", String(location.latitude));
      formData.append("longi", String(location.longitude));
      formData.append("location_image", imageData.toString());
      formData.append("outlet_type", outletType);
      formData.append("contact_person_name", contactName);
      formData.append("contact_person_number", contactNumber);
      formData.append("outlet_name", outletName);
      formData.append("outlet_code", "");
      formData.append("lead_status", leadType);
      formData.append("followup_date", followupDate);
      formData.append("visit_type", vistType);
      formData.append("notes", meetingNotes);
      console.log("dsdhjgasdsd", formData);
      axios({
        url: `${constant.baseUri}sales_man_tracking.php`,
        method: "POST",
        data: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
        .then(function (response) {
          setIsLoading(false);
          let data = response;
          console.log("dataaaa", data);
          navigation.goBack();
        })
        .catch(function (error) {
          setIsLoading(false);
          setIssLoading(false);
          Snackbar.show({
            text: "Unable to upload ! Please try again",
            duration: Snackbar.LENGTH_LONG,
            backgroundColor: "red",
          });
          console.log("error :", error);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  // -----Location-------//
  //Get Location
  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert("Unable to open settings");
      });
    };
    const status = await Geolocation.requestAuthorization("whenInUse");

    if (status === "granted") {
      return true;
    }

    if (status === "denied") {
      Alert.alert("Location permission denied");
    }

    if (status === "disabled") {
      Alert.alert(
        `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
        "",
        [
          { text: "Go to Settings", onPress: openSetting },
          { text: "Don't Use Location", onPress: () => {} },
        ]
      );
    }

    return false;
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === "ios") {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === "android" && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        "Location permission denied by user.",
        ToastAndroid.LONG
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        "Location permission revoked by user.",
        ToastAndroid.LONG
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
          android: "high",
          ios: "best",
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        // forceRequestLocation: forceLocation,
        // forceLocationManager: useLocationManager,
        // showLocationDialog: locationDialog,
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);
  // useEffect(() => {
  //   GetLocation.getCurrentPosition({
  //     enableHighAccuracy: false,
  //     timeout: 150000,
  //   })
  //     .then(location => {
  //       setLocation(location);
  //       getAddress(location);
  //     })
  //     .catch(ex => {
  //       const {code, message} = ex;
  //       console.warn(code, message);
  //       if (code === 'CANCELLED') {
  //         Alert.alert('Location cancelled by user or by another request');
  //       }
  //       if (code === 'UNAVAILABLE') {
  //         Alert.alert('Location service is disabled or unavailable');
  //       }
  //       if (code === 'TIMEOUT') {
  //         Alert.alert('Location request timed out');
  //       }
  //       if (code === 'UNAUTHORIZED') {
  //         Alert.alert('Authorization denied');
  //       }
  //     });
  // }, []);

  const getAddress = async (location) => {
    let params = {
      company_id: 1,
      api_key: "24916435facdadd10ec8bc2080cebf52",
      lat: location.latitude,
      long: location.longitude,
    };
    const res = await API.get("/geocode-reverse.php", { params });
    if (res.data && res.data.results.length > 0 && res.data.results[0]) {
      setLocationText(res.data.results[0].formatted_address);
      setAddress(res.data.results[0].formatted_address);
    }
  };
  //-------Location Ends ------//

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: constant.primaryColor,
    },
    contentContainer: {
      flex: 1,
      backgroundColor: "white",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      shadowColor: "#fff",
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      marginBottom: 20,
    },
    topbarContainer: {
      height: "10%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      top: 0,
    },
    greetingText: {
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: 20,
      lineHeight: 23,
      color: "#2C3039",
    },
    greetingText2: {
      fontStyle: "normal",
      fontWeight: "300",
      fontSize: 16,
      lineHeight: 20,
      textAlign: "right",
      color: "#2C3039",
      width: 110,
    },
    locationView: {
      //height: 36,
      flexDirection: "row",
      justifyContent: "space-between",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      paddingHorizontal: 10,
      marginHorizontal: 20,
      alignItems: "center",
    },
    locationInput: {
      flex: 1,
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: 14,
      color: "#2C3039",
    },
    editView: {
      justifyContent: "center",
      alignItems: "flex-end",
      marginHorizontal: 20,
      marginTop: 20,
    },
    editText: {
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: 14,
      color: "#0877DD",
      textAlign: "center",
      marginLeft: 5,
    },
    textItem: {
      flex: 1,
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      color: "#000",
    },
    item: {
      padding: 17,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    streetAdressContainer: {
      marginHorizontal: 20,
      marginTop: 20,
      paddingLeft: 8,
      height: 36,
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
    },
    placeholderStyle: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      color: "#77838F",
    },
    selectedTextStyle: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      color: "#000",
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    streetDropdown: {},
    cityPinContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 20,
      padding: 8,
    },
    contactPinContainer: {
      // flexDirection: 'row',
      // justifyContent: 'space-evenly',
      marginTop: 20,
      marginHorizontal: 20,
    },
    uploadContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginTop: 20,
      marginHorizontal: 20,
      gap: 15,
    },
    cityPinDropDownContainer: {
      width: "45%",
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
      paddingLeft: 8,
      height: 36,
    },
    pincodeInputView: {
      //height: 36,
      width: "45%",
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
      justifyContent: "center",
      paddingLeft: 8,
      height: 36,
    },
    contactInputView: {
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
      justifyContent: "center",
      paddingLeft: 8,
      //height: 36,
    },
    pincodeText: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      color: "#77838F",
      padding: 5,
    },
    selectStateContainer: {
      marginHorizontal: 20,
      height: 36,
      marginTop: 20,
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
      justifyContent: "center",
      paddingLeft: 8,
    },
    bottomContainer: {
      height: 67,
      marginTop: 20,
      marginHorizontal: 20,
      borderColor: "#000",
      borderRadius: 5,
      borderWidth: 0.2,
      elevation: 2,
    },
    submitContainerView: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    submitButton: {
      flex: 1,
      height: 45,
      marginTop: 20,
      marginHorizontal: 20,
      borderRadius: 5,
      width: "40%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0877DD",
    },
    submitText: {
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: 16,
      lineHeight: 20,
      color: "#fff",
    },
    sectionHeader: {
      justifyContent: "flex-start",
      alignItems: "flex-start",
      marginTop: 20,
      marginHorizontal: 20,
    },
    uploadButton: {
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
      backgroundColor: "#0877DD",
      marginTop: 20,
      borderRadius: 10,
      marginHorizontal: 20,
      alignSelf: "flex-start",
    },
    sectionHeading: {
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: 16,
      lineHeight: 20,
      color: "#000",
    },
    uploadButtonText: {
      fontStyle: "normal",
      fontWeight: "600",
      fontSize: 13,
      color: "white",
    },
    meetingInputText: {
      marginHorizontal: 20,
      height: 100,
      marginTop: 20,
      borderColor: "#E6E6E6",
      borderRadius: 5,
      borderWidth: 1,
      paddingLeft: 8,
      paddingTop: 8,
    },
    floatingCameraButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      bottom: 5,
      position: "absolute",
      left: 20,
      height: 40,
      backgroundColor: "#FAFAFA",
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 2,
    },
    uploadImageIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      bottom: 5,
      height: 40,
      backgroundColor: "#FAFAFA",
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 2,
    },

    addContactButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      backgroundColor: "#FAFAFA",
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 2,
    },
    addContactView: {
      marginHorizontal: 20,
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    addContactText: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 16,
      color: "#0877DD",
      textAlign: "center",
      marginLeft: 5,
    },
    contactContainer: {
      borderRadius: 10,
      borderWidth: 1,
      marginHorizontal: 20,
      marginVertical: 10,
      paddingBottom: 10,
      borderColor: "#E6E6E6",
    },
    contactIndex: {
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 16,
      paddingTop: 10,
      paddingLeft: 10,
      color: "#0877DD",
    },
    phInput: {
      paddingLeft: 12,
      borderRadius: 0,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    modalOptionText: {
      marginLeft: 15,
      fontSize: 16,
      color: "#333",
      fontWeight: "500",
    },
    cancelButton: {
      padding: 15,
      alignItems: "center",
      marginTop: 10,
    },
    cancelButtonText: {
      color: "red",
      fontSize: 16,
      fontWeight: "500",
    },
  });

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.state_name}</Text>
      </View>
    );
  };

  const renderVisitItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.value}</Text>
      </View>
    );
  };

  const renderCityItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.city}</Text>
      </View>
    );
  };

  const renderItemOutletType = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.outlet_type_name}</Text>
      </View>
    );
  };

  const renderItemLead = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.value}</Text>
      </View>
    );
  };

  // const renderContactItem = item => {
  //   return (
  //     <View style={styles.contactContainer}>
  //       <Text style = {styles.contactIndex} >Contact {item.item.id}</Text>
  //       <View style={{flexDirection: 'row',
  //     justifyContent: 'space-evenly', padding: 8}}>
  //         <View style={styles.pincodeInputView}>
  //           <TextInput
  //             style={styles.pincodeText}
  //             placeholderStyle={styles.placeholderStyle}
  //             onChangeText={setcontactName}
  //             placeholder="Name*"
  //             value={contactName}
  //           />
  //         </View>
  //         <View style={styles.pincodeInputView}>
  //           <TextInput
  //             style={styles.pincodeText}
  //             placeholderStyle={styles.placeholderStyle}
  //             onChangeText={setcontactNumber}
  //             placeholder="+91 00000 00000*"
  //             value={contactNumber}
  //           />
  //         </View>
  //       </View>
  //       <View style={styles.selectStateContainer}>
  //         <TextInput
  //           style={styles.pincodeText}
  //           placeholderStyle={styles.placeholderStyle}
  //           onChangeText={setpincode}
  //           placeholder="Email ID"
  //           value={pincode}
  //         />
  //       </View>
  //     </View>
  //   );
  // };

  const phoneRef = useRef();

  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(phoneRef.current.isValidNumber(value));
  }, [value]);

  //Contact Details
  const ContactDetails = (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Client Details</Text>
      </View>
      <View style={styles.contactPinContainer}>
        <View style={[styles.contactInputView, { height: 36 }]}>
          <TextInput
            autoCorrect={false}
            style={styles.pincodeText}
            placeholderStyle={styles.placeholderStyle}
            onChangeText={setcontactName}
            placeholder="Name"
            placeholderTextColor={colorScheme === "dark" ? "#77838F" : ""}
            value={contactName}
          />
        </View>
        <View style={[styles.contactInputView, { marginTop: 20 }]}>
          <PhoneInput
            ref={phoneRef}
            defaultValue={value}
            defaultCode="IN"
            layout="second"
            onChangeText={(text) => {
              setValue(text);
            }}
            onChangeFormattedText={(text) => {
              setcontactNumber(text);
            }}
            disableArrowIcon
            containerStyle={{ width: "100%" }}
            textContainerStyle={styles.phInput}
            textInputStyle={{
              padding: 0,
              fontSize: 14,
            }}
          />

          {/* <TextInput
            autoCorrect={false}
            style={styles.pincodeText}
            placeholderStyle={styles.placeholderStyle}
            onChangeText={setcontactNumber}
            placeholder="+91 00000 00000*"
            value={contactNumber}
          /> */}
        </View>
      </View>
      {/* <View style={styles.selectStateContainer}>
        <TextInput
          style={styles.pincodeText}
          placeholderStyle={styles.placeholderStyle}
          onChangeText={setpincode}
          placeholder="Email ID"
          value={pincode}
        />
      </View> */}
    </View>
  );

  const AddNote = (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Add Note</Text>
      </View>
      <View style={styles.contactPinContainer}>
        <View
          style={[
            styles.contactInputView,
            { height: 66, justifyContent: "flex-start" },
          ]}
        >
          <TextInput
            autoCorrect={false}
            style={[styles.pincodeText]}
            placeholderStyle={styles.placeholderStyle}
            onChangeText={setMeetingNotes}
            placeholder="Type your note here..."
            placeholderTextColor={colorScheme === "dark" ? "#77838F" : ""}
            value={meetingNotes}
            multiline={true}
          />
        </View>
      </View>
    </View>
  );
  //Outlet Details
  const OutletDetails = (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Outlet Details</Text>
      </View>
      <View style={styles.cityPinContainer}>
        <View style={styles.pincodeInputView}>
          <TextInput
            style={styles.pincodeText}
            placeholderStyle={styles.placeholderStyle}
            onChangeText={setOutletName}
            placeholder="Outlet Name"
            placeholderTextColor={colorScheme === "dark" ? "#77838F" : ""}
            value={outletName}
          />
        </View>
        <View style={styles.cityPinDropDownContainer}>
          <Dropdown
            style={styles.streetDropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={outletTypes}
            maxHeight={300}
            labelField="outlet_type_name"
            valueField="id"
            placeholder="Outlet Type"
            searchPlaceholder="Search..."
            value={outletType}
            onChange={(item) => {
              setOutletType(item.id);
            }}
            renderItem={renderItemOutletType}
          />
        </View>
      </View>
      {/* <View style={styles.selectStateContainer}>
        <TextInput
          style={styles.pincodeText}
          placeholderStyle={styles.placeholderStyle}
          onChangeText={setpincode}
          placeholder="If other, Enter Outlet Type"
          value={pincode}
        />
      </View> */}
    </View>
  );

  const pickFromGallery = async () => {
    launchImageLibrary({ mediaType: "photo" }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const newUri = response.assets[0].uri;

        setImageUri((prevUris) => [...prevUris, newUri]);
        setModalVisible(false);

        if (newUri) {
          try {
            const base64String = await ImgToBase64.getBase64String(newUri);
            setUploadImageBase64Datas((prevData) => [
              ...prevData,
              base64String,
            ]);
          } catch (err) {
            console.log("Error converting image to base64:", err);
          }
        }
      }
    });
  };

  const openCamera = async () => {
    console.log("Camera button pressed");

    try {
      const image = await ImagePicker.openCamera({
        compressImageQuality: 0.5,
        mediaType: "photo",
        multiple: false,
        useFrontCamera: true,
        compressImageMaxWidth: 600,
      });

      const newUri = image.path;
      setImageUri((prevUris) => [...prevUris, newUri]);
      setModalVisible(false);

      try {
        const base64String = await ImgToBase64.getBase64String(newUri);
        setUploadImageBase64Datas((prevData) => [...prevData, base64String]);
      } catch (err) {
        console.log("Error converting image to base64:", err);
      }
    } catch (error) {
      console.log("Camera error or cancelled:", error?.message || error);
    }
  };

  const UploadImage = (
    <View>
      <TouchableOpacity
        onPress={() => {
          if (imageUri.length >= 2) {
            Alert.alert("Maximum Reached", "You can only upload 2 images");
            return;
          }
          setModalVisible(true);
        }}
        style={styles.uploadButton}
      >
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>
      {/* <View style={styles.uploadContainer}>
              <TouchableOpacity onPress={pickFromGallery}  style={styles.uploadImageIcon}>
                <IonIcon name="image-outline" size={20} color="#0877DD" />
              </TouchableOpacity>
        
              <TouchableOpacity  onPress={openCamera} style={styles.uploadImageIcon}>
                <IonIcon name="camera-outline" size={20} color="#0877DD" />
              </TouchableOpacity>
      </View> */}
      <View style={[styles.uploadContainer, { marginTop: 0 }]}>
        {imageUri.map((uri, index) => (
          <View
            key={index}
            style={{
              position: "relative",
              marginTop: 15,
              width: 50,
              height: 50,
            }}
          >
            <TouchableOpacity
              style={{
                borderColor: "#807e7a",
                borderWidth: 0.5,
                borderRadius: 5,
              }}
              onPress={() => setImagePreview({ value: true, index })}
            >
              <Image
                source={{ uri }}
                style={{ width: 50, height: 50, borderRadius: 5 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "white",
                borderRadius: 10,
                elevation: 3,
              }}
              onPress={() => {
                setImageUri((prev) => prev.filter((_, i) => i !== index));
                setUploadImageBase64Datas((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            >
              <IonIcon name="close-circle" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  //StateList
  useEffect(() => {
    stateList();
  }, []);

  const stateList = async () => {
    const stateList = await API.get("/state_master.php");

    if (
      stateList.data &&
      stateList.data.data &&
      stateList.data.data.length > 0
    ) {
      console.log("StateList asas", stateList.data.data);
      setStates(stateList.data.data);
    }
  };

  useEffect(() => {
    if (selectedAddress) {
      getCity(selectedAddress);
    }
  }, [selectedAddress]);

  const getCity = async (code) => {
    let params = {
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
      state_code: code,
    };

    const cityList = await API.get("/state_city_list.php", {
      params,
    });

    if (cityList.data && cityList.data.data && cityList.data.data.length > 0) {
      console.log("cityList asas", cityList.data.data);
      setCities(cityList.data.data);
    }
  };

  //Outlet types
  useEffect(() => {
    getOutletTypes();
    getLeadTypes();
    getVisitTypes();
  }, []);

  // useEffect(() => {
  //   if (outletType === null) {
  //     console.log("IS ----");
  //     setOutletType(4)
  //   }
  // }, [outletTypes])

  const getOutletTypes = async () => {
    let params = {
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
    };
    const outletTypes = await API.get("/outlet_types.php", {
      params,
    });

    console.log("res", outletTypes);
    if (
      outletTypes.data &&
      outletTypes.data.data &&
      outletTypes.data.data.length > 0
    ) {
      console.log("StateList asas", outletTypes.data.data);
      setOutletTypes(outletTypes.data.data);
    }
  };

  const getLeadTypes = async () => {
    let params = {
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
      type: "lead_status",
    };
    const leadTypes = await API.get("/code_master.php", {
      params,
    });

    console.log("res", outletTypes);
    if (
      leadTypes.data &&
      leadTypes.data.data &&
      leadTypes.data.data.length > 0
    ) {
      console.log("kleadas as===>>>", leadTypes.data.data);
      setLeadTypes(leadTypes.data.data);
    }
  };

  const getVisitTypes = async () => {
    let params = {
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
      type: "visit_type",
    };
    const visitTypes = await API.get("/code_master.php", {
      params,
    });

    console.log("res", visitTypes);
    if (
      visitTypes.data &&
      visitTypes.data.data &&
      visitTypes.data.data.length > 0
    ) {
      console.log("visit as===>>>>>>", visitTypes.data.data);
      setVisitTypes(visitTypes.data.data);
    }
  };

  //-------Image Upload--------//

  const [uploadImage, setUploadImage] = useState([]);
  const [imageBase64Datas, setImageBase64Datas] = useState([]);

  const onChooseGallery = async () => {
    setUploadImage([]);
    setImageBase64Datas([]);
    if (imageBase64Datas.length == 1) {
      Alert.alert("", "You can only upload 1 images");
      return;
    }

    await ImagePicker.openCamera({
      compressImageQuality: 0.5,
      mediaType: "photo",
      multiple: true,
      maxFiles: 4,
      useFrontCamera: true,
      compressImageMaxWidth: 600,
    })
      .then((image) => {
        setUploadImage([...uploadImage, image]);
      })
      .catch((error) => {
        // console.error(error);
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
        uploadImage[uploadImage.length - 1].path
      )
        .then((base64String) => {
          setImageBase64Datas([...imageBase64Datas, base64String]);
        })
        .catch((err) => console.log("err", err));
    }
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setFollowupDate(moment(date).format("YYYY-MM-DD"));
    hideDatePicker();
  };

  useEffect(() => {
    convertToBase64();
  }, [uploadImage]);

  //-------Image upload ends --------//

  const [currentdate, setCurrentDate] = useState(new Date());

  const dateSelected = (date) => {
    setCurrentDate(date);
  };
  const parseimageToPreview = () => {
    let img = [];
    imageUri.map((item) => {
      let url = { uri: item };
      img.push(url);
    });
    return img;
  };

  if (isLoading) {
    return <Loader />;
  } else {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <NavigationBarE title={"CheckIn"} hideCalender={true} />
        <View style={styles.contentContainer}>
          <View style={styles.topbarContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={25} color="#757677" />
            </TouchableOpacity>
            <Text style={styles.greetingText2}>{route.params.date}</Text>
          </View>
          <KeyboardAwareScrollView extraHeight={50}>
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
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Icon name="edit" size={15} color="#757677" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {isEdit && (
              <View style={[styles.selectStateContainer, { height: 50 }]}>
                <TextInput
                  style={styles.pincodeText}
                  multiline={true}
                  placeholderStyle={styles.placeholderStyle}
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
                onChange={(item) => {
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
                  onChange={(item) => {
                    setselectedCity(item.city);
                  }}
                  renderItem={renderCityItem}
                />
              </View>
              <View style={styles.pincodeInputView}>
                <TextInput
                  style={styles.pincodeText}
                  placeholderStyle={styles.placeholderStyle}
                  onChangeText={setpincode}
                  placeholder="Pincode"
                  placeholderTextColor={colorScheme === "dark" ? "#77838F" : ""}
                  value={pincode}
                />
              </View>
            </View>
            {OutletDetails}
            {UploadImage}
            {ContactDetails}
            {AddNote}
            {/* <FlatList
            keyExtractor={item => item.id}
            data={contactData}
            scrollEnabled={false}
            renderItem={renderContactItem}
          /> */}
            {/* <View style={styles.addContactView}>
            <TouchableOpacity onPress={() => {
                setcontactIndex(contactIndex + 1);
                addElement()
            }} style={styles.addContactButton}>
              <Icon name="plus" size={20} color="#0877DD" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                setcontactIndex(contactIndex + 1);
                addElement()
            }}>
              <Text style={styles.addContactText}>
                Add another contact (upto 10)
              </Text>
            </TouchableOpacity>
          </View> */}
            {/* {LeadDetails()} */}
            <View style={styles.submitContainerView}>
              <TouchableOpacity
                onPress={() => onChooseGallery()}
                style={styles.floatingCameraButton}
              >
                <Icon name="camera" size={20} color="#0877DD" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => postData()}
                disabled={issLoading}
                style={styles.submitButton}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
            {uploadImage.length > 0 && (
              <View
                style={{
                  alignItems: "flex-start",
                  marginHorizontal: 20,
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                {uploadImage.map((item, index) => (
                  <TouchableOpacity onPress={() => setUploadImage([])}>
                    <ImageRender key={index} image={item.path} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </KeyboardAwareScrollView>
        </View>
        {isDatePickerVisible && (
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : ""}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        )}
        {issLoading && (
          <View
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#21212194",
            }}
          >
            <ActivityIndicator
              size={"large"}
              style={{
                justifyContent: "center",
                flex: 1,
                alignContent: "center",
              }}
              color={"#95c6ff"}
            />
          </View>
        )}

        {showImagePreview && (
          <ImageView
            images={parseimageToPreview()}
            imageIndex={showImagePreview.index}
            onRequestClose={() => setImagePreview({ value: false, index: 0 })}
            visible={showImagePreview.value}
          />
        )}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
                <IonIcon name="camera-outline" size={20} color="#0877DD" />
                <Text style={styles.modalOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={pickFromGallery}
              >
                <IonIcon name="image-outline" size={20} color="#0877DD" />
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  function LeadDetails() {
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Lead Details</Text>
        </View>
        <View style={styles.cityPinContainer}>
          <View style={styles.pincodeInputView}>
            <Dropdown
              style={styles.streetDropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={leadTypes}
              maxHeight={300}
              labelField="value"
              valueField="id"
              placeholder="Select Lead Type*"
              searchPlaceholder="Search..."
              value={leadType}
              onChange={(item) => {
                setLeadType(item.id);
              }}
              renderItem={renderItemLead}
            />
          </View>
          <View style={styles.cityPinDropDownContainer}>
            <Dropdown
              style={styles.streetDropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={visitTypes}
              maxHeight={300}
              labelField="value"
              valueField="id"
              placeholder="Select Visit Type*"
              searchPlaceholder="Search..."
              value={vistType}
              onChange={(item) => {
                setvisitType(item.id);
              }}
              renderItem={renderVisitItem}
            />
          </View>
        </View>
        <View style={styles.selectStateContainer}>
          <TouchableOpacity style={styles.pincodeText} onPress={showDatePicker}>
            <Text style={{ color: followupDate ? "#000" : "#77838F" }}>
              {followupDate ? followupDate : "Follow Up Date"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.meetingInputText}>
          <TextInput
            style={styles.pincodeText}
            placeholderStyle={styles.placeholderStyle}
            // onChangeText={setMeetingNotes}
            placeholder="Meeting Notes"
            // value={meetingNotes}
          />
        </View>
      </View>
    );
  }
}

export default CheckIn;

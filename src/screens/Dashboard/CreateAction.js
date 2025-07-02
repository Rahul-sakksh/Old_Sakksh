import React, {memo, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RadioButton from '../../Common/RadioButton';
import * as constant from '../../Utils/Constants';
import NavigationBar from '../../Common/NavigationBar';
import {Dropdown} from 'react-native-element-dropdown';
import API from '../../Utils/Api';
import {getData} from '../../Helpers/StorageHelper';
import Snackbar from 'react-native-snackbar';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { navigate } from '../../Utils/RootNavigation';

function CreateAction({navigation, route}) {

  const [isLoading, setIsLoading] = useState(false);
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: '#FAFAFA',
    },
    whatNeedsDoneTI: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginVertical: 8,
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 5,
      minHeight: 40,
    },
    dropdown: {
      height: 50,
    },
    textItem: {
      flex: 1,
      fontSize: 14,
      color: 'gray'
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    placeholderStyle: {
      fontSize: 14,
      color: 'gray',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: 'gray'
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 14,
    },
    dateView: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      justifyContent: 'space-between',
      borderRadius: 5,
      minHeight: 40,
      alignItems: 'center',
    },
  });

  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.name}</Text>
      </View>
    );
  };

  //Render Store List
  const renderStoreItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.area}</Text>
      </View>
    );
  };

  const createAction = async () => {
    if (purposeInput === '') {
      Alert.alert('Please add what needs to be done!')
      return
    }

    if (repeatState === 2 && repeatSubStateValue === null) {
      Alert.alert(
        'You have selected weekly repeatation, but forgot to select day of the week, Please select a day',
      );
      return;
    } else if (repeatState === 3 && repeatSubStateValue === null) {
      Alert.alert(
        'You have selected monthly repeatation, but forgot to select date of the month, Please select a date',
      );
      return;
    }

    if (option !== "Learning" && option !== "Best Practice") {
      if (option === '') {
        Alert.alert('Please select a option');
        return;
      } else if (responsibleUser == '') {
        Alert.alert('Please select a responsible user');
        return;
      } else if (severity == '') {
        Alert.alert('Please select severity of this action');
        return;
      }
    }
    setIsLoading(true)

    const response = await API.get('/action_assign_post.php', {
    params :{
      user_id: await getData(constant.userID),
      device_id: await getData(constant.deviceID),
      token: await getData(constant.token),
      store_id: storeId,
      survey_id: route.params && route.params.surveyData?.survey_id,
      store_survey_report_id: route.params && route.params.surveyReportID,
      survey_query_id: route.params && route.params.surveyData?.audit_question_id,
      severity: severity,
      action_status: 'Pending',
      action_assigned_to: responsibleUser,
      action_type: option,
      target_completion_date: moment(date).format('YYYY-MM-DD'),
      action: purposeInput,
      action_details: actionDetails,
      recurring: repeatState,
      recur_day: repeatSubStateValue,
      // accountable_user: accountableUser,
      // approver_user: approver,
      assigned_site_id: storeId
    } })

    console.log("--------action-assign", response)
    setIsLoading(false)
    if (response.data.status === "success") {
      navigation.goBack()
      Snackbar.show({
        text: 'Successfully submitted',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#49be25',
      });
    } else {
      Snackbar.show({
        text: 'Something went wrong',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: 'red',
      });
    }

  };

  const [users, setUsers] = useState([]);

  //date Picker
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [storeListExist, setStoreListExist] = useState(true)
  const [storeList, setStoreList] = useState([]);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    console.log("hello",route.params)
    if (route.params === undefined) {
      getStores();
    } else {
      console.log("hello setStoreListExist == true",route.params)
      setStoreListExist(false)
      setStoreList([ route.params && route.params?.site_details && route.params.site_details])
      setStoreId(route.params && route.params?.storeId)
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      console.log("hello storeID",route.params)
      setStoreListExist(false)
      getUsers(storeId)
    }
  }, [storeId])

  //Fetch user list
  const getUsers = async (storeId) => {
    try {
    const response = await API.get('/action_user_list.php', {
      params: {
        user_id: await getData(constant.userID),
        device_id: await getData(constant.deviceID),
        token: await getData(constant.token),
        store_id: storeId,
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      setUsers(response.data.data);
    } else {
      console.log("response", response)
      Snackbar.show({
        text: 'No user to assign found',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: 'yello',
      });
    }
  } catch (error) {
    Snackbar.show({
      text: 'Something went wrong!',
      duration: Snackbar.LENGTH_SHORT,
    });
    console.log('err :', error.response);
  }
  };

  const [option, setOption] = useState('');
  const data = [
    {value: 'Issue'},
    {value: 'Best Practice'},
    {value: 'Learning'},
  ];

  const [purposeInput, setPurposeInput] = useState('');
  const [responsibleUser, setResponsibleUser] = useState('');

  // const [accountableUser, setAccountableUser] = useState('');
  // const [approver, setApprover] = useState('');


  const [actionDetails, setActionDetails] = useState('');

  const severities = [
    {name: 'High', id: '17'},
    {name: 'Medium', id: '16'},
    {name: 'Low', id: '15'},
  ];

  const repeatStatus = [
    {name: 'No', id: 0},
    {name: 'Daily', id: 1},
    {name: 'Weekly', id: 2},
    {name: 'Monthly', id: 3}
  ];

  const [severity, setSeverity] = useState('');
  const [repeatState, setRepeatState] = useState('');
  const [repeatSubState, setRepeatSubState] = useState(null)
  const [repeatSubStatePlaceholder, setRepeatSubStatePlaceholder] = useState("")
  const [repeatSubStateValue, setRepeatSubStateValue] = useState("")

  //Week Days
  const weekDays = [
    {name: 'Monday', id: 1},
    {name: 'Tuesday', id: 2},
    {name: 'Wednesday', id: 3},
    {name: 'Thursday', id: 4},
    {name: 'Friday', id: 5},
    {name: 'Saturday', id: 6},
    {name: 'Sunday', id: 7}
  ];

  const monthlyDays = [
    {name: '1', id: 1},
    {name: '2', id: 2},
    {name: '3', id: 3},
    {name: '4', id: 4},
    {name: '5', id: 5},
    {name: '6', id: 6},
    {name: '7', id: 7},
    {name: '8', id: 8},
    {name: '9', id: 9},
    {name: '10', id: 10},
    {name: '11', id: 11},
    {name: '12', id: 12},
    {name: '13', id: 13},
    {name: '14', id: 14},
    {name: '15', id: 15},
    {name: '16', id: 16},
    {name: '17', id: 17},
    {name: '18', id: 18},
    {name: '19', id: 19},
    {name: '20', id: 20},
    {name: '21', id: 21},
    {name: '22', id: 22},
    {name: '23', id: 23},
    {name: '24', id: 25},
    {name: '26', id: 27},
    {name: '28', id: 28},
    {name: '29', id: 29},
    {name: '30', id: 30},
    {name: '31', id: 31}
  ];

  useEffect(() => {
    if (repeatState === 2) {
      setRepeatSubState(weekDays)
      setRepeatSubStatePlaceholder("Select Day")
    } else if (repeatState === 3) {
      setRepeatSubState(monthlyDays)
      setRepeatSubStatePlaceholder("Select Date")
    } else {
      setRepeatSubStateValue(null)
      setRepeatSubState(null)
    }
  }, [repeatState])

  const getStores = async () => {
    const res = await API.get('/action_store_list.php', {
      params: {
        user_id: await getData(constant.userID),
        device_id: await getData(constant.deviceID),
        token: await getData(constant.token),
      },
    });

    if (res.data.status === 'success') {
      if (res.data.data.length > 0) {
        console.log("res.data.data", res.data.data)
        setStoreList([])
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
  };
  

  return (
    <SafeAreaView style={{backgroundColor: constant.primaryColor}}>
      <View style={styles.container}>
        <NavigationBar
          title={'Create Action'}
          showBackButton={true}
          hideRightButtons={true}
          onPressBack={() => navigation.goBack()}
        />
        <ScrollView>
          <View style={{margin: 10}}>
            <RadioButton data={data} onSelect={value => setOption(value)} />
          </View>
          <View style={styles.whatNeedsDoneTI}>
            <TextInput
              style={{fontSize: 14, color: '#000'}}
              placeholder="*Title"
              placeholderTextColor="#77838F"
              placeholderStyle={styles.placeholderStyle}
              multiline={true}
              dataDetectorTypes="all"
              onChangeText={setPurposeInput}
              value={purposeInput}
            />
          </View>

          <View style={styles.whatNeedsDoneTI}>
            <TextInput
              style={{fontSize: 14, color: '#000'}}
              placeholder="Action Details"
              placeholderTextColor="#77838F"
              placeholderStyle={styles.placeholderStyle}
              multiline={true}
              dataDetectorTypes="all"
              onChangeText={setActionDetails}
              value={actionDetails}
            />
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              marginVertical: 8,
              borderRadius: 5,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={storeList}
              search
              maxHeight={300}
              labelField="area"
              valueField="id"
              placeholder="Assign Site"
              searchPlaceholder="Search..."
              value={storeId}
              onChange={item => {
                console.log("use effect didn't called", item)
                setStoreId(item.id);
               // getUsers(item.id)
              }}
              renderItem={renderStoreItem}
            />
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              marginVertical: 8,
              borderRadius: 5,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={users}
              disable={storeListExist}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Responsible"
              searchPlaceholder="Search..."
              value={responsibleUser}
              onChange={item => {
                setResponsibleUser(item.id);
              }}
              renderItem={renderItem}
            />
          </View>
          {/* <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              marginVertical: 8,
              borderRadius: 5,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={users}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Accountable"
              searchPlaceholder="Search..."
              value={accountableUser}
              onChange={item => {
                setAccountableUser(item.id);
              }}
              renderItem={renderItem}
            />
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              marginVertical: 8,
              borderRadius: 5,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={users}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Approver"
              searchPlaceholder="Search..."
              value={approver}
              onChange={item => {
                setApprover(item.id);
              }}
              renderItem={renderItem}
            />
          </View> */}
          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              borderRadius: 5,
              marginVertical: 8,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={severities}
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Priority"
              searchPlaceholder="Search..."
              value={severity}
              onChange={item => {
                setSeverity(item.id);
              }}
              renderItem={renderItem}
            />
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              borderRadius: 5,
              marginVertical: 8,
            }}>
            <TouchableOpacity
              style={styles.dateView}
              onPress={() => setOpen(true)}>
              <TextInput
                style={{fontSize: 16, color: 'gray'}}
                placeholder="Target Date"
                placeholderTextColor="#77838F"
                placeholderStyle={styles.placeholderStyle}
                editable={false}
                value={moment(date).format('YYYY-MM-DD')}></TextInput>
              <AntDesign name="calendar" size={20} color="gray" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 20,
              paddingHorizontal: 10,
              borderRadius: 5,
              marginVertical: 8,
            }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={repeatStatus}
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder="Does not repeat"
              searchPlaceholder="Search..."
              value={repeatState}
              onChange={item => {
                setRepeatState(item.id);
              }}
              renderItem={renderItem}
            />
          </View>
          {repeatSubState ? (
            <View
              style={{
                backgroundColor: '#fff',
                marginHorizontal: 20,
                paddingHorizontal: 10,
                borderRadius: 5,
                marginVertical: 8,
              }}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={repeatSubState}
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder={repeatSubStatePlaceholder}
                searchPlaceholder="Search..."
                value={setRepeatSubStateValue}
                onChange={item => {
                  setRepeatSubStateValue(item.id);
                }}
                renderItem={renderItem}
              />
            </View>
          ) : null}
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginHorizontal: 10,
              paddingHorizontal: 10,
              marginVertical: 8,
            }}>
            <TouchableOpacity
              disabled={isLoading}
              style={{backgroundColor: constant.primaryColor, padding: 10}}
              onPress={() => createAction()}>
              <Text style={{color: '#fff', fontSize: 14}}>Create</Text>
            </TouchableOpacity>
          </View>
          <DatePicker
            modal
            open={open}
            minimumDate={new Date()}
            date={date}
            mode={'date'}
            onConfirm={date => {
              setOpen(false);
              setDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </ScrollView>
      </View>
      {isLoading &&
        <View style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0, backgroundColor: "#21212194"}}>
          <ActivityIndicator size={"large"} style={{justifyContent: "center", flex: 1, alignContent: "center"}} color={"#95c6ff"} />
        </View>}
    </SafeAreaView>
  );
}

export default memo(CreateAction);

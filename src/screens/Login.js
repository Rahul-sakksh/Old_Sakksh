import React, {memo, useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
} from 'react-native-responsive-dimensions';
import {getData, storeData} from '../Helpers/StorageHelper';
import axios from 'axios';
import * as constant from '../Utils/Constants';
import {navigate, replace} from '../Utils/RootNavigation';
import { ScrollView } from 'react-native-gesture-handler';
import DeviceInfo, { getUniqueId } from 'react-native-device-info';

function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //justifyContent: 'center',
      alignItems: 'center',
    },
    inputBox: {
      height: 62,
      borderBottomColor: 'grey',
      borderBottomWidth: 1,
    },
    inputStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#000',
      marginBottom: 10,
    },
    btnStyle: {
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#cc618f',
      marginVertical: 10,
    },
    btnText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    formContainer: {
      width: rw(80),
    },
    buttonEnable: {
      backgroundColor: '#cc618f',
    },
    buttonDisable: {
      backgroundColor: '#ccc',
    },
  });

  useEffect(() => {
    let deviceID = Platform.OS === 'ios' ? DeviceInfo.getUniqueIdSync() : DeviceInfo.getAndroidIdSync();
    console.log("DEICEHIHDE", deviceID)
    storeData(constant.deviceID, deviceID);
  }, []);

  const handleSubmit = async values => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_name', values.name);
      formData.append('password', values.password);
      formData.append('device_id', await getData(constant.deviceID));
      console.log("response.data.data", `${constant.baseUri}login.php`, formData)
      axios({
        url: `${constant.baseUri}login.php`,
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(function (response) {
          console.log("==-====", response)
          setIsLoading(false);
          let data = response.data.data;
          if (data[0] && data[0].message) {
            console.log('------------------',data[0] );
            
            Alert.alert(data[0].message);
          } else if (data[0] && data[0].id && data[0].token) {
            storeData(constant.name, data[0].name)
            storeData(constant.userID, data[0].id);
            storeData(constant.token, data[0].token);
            storeData(constant.loggedIn, 'true');
            storeData(constant.userRole, data[0].user_role);
            storeData(constant.retailerID, data[0].parent_retailer);
            replace( data[0].user_role === '5' ? 'sManagerDashboard' : 'dashboard');
          } else {
            Alert.alert("Something went wrong!!!");
          }
        })
        .catch(function (error) {
          console.log('error :', error);
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
      <Image
              source={ require('../assets/image.png')}
              style={{resizeMode:'contain', width: '80%', height: '30%'}}
            />
      <Formik
        initialValues={{
          name: '',
          password: '',
        }}
        onSubmit={values => handleSubmit(values)}
        validationSchema={yup.object().shape({
          name: yup.string().required('Please, enter your Username!'),
          password: yup
            .string().required('Please, enter your Password!')
            .min(4)
            .max(10, 'Password should not excced 10 chars.')
            .required(),
        })}>
        {({
          values,
          handleChange,
          errors,
          setFieldTouched,
          touched,
          isValid,
          handleSubmit,
        }) => (
          <View style={styles.formContainer}>
            <View style={{paddingBottom: 10}}>
              <TextInput
                value={values.name}
                style={styles.inputBox}
                onChangeText={handleChange('name')}
                onBlur={() => setFieldTouched('name')}
                placeholder="Username"
                placeholderTextColor={'#ccc'}
              />
              {touched.name && errors.name && (
                <Text style={{fontSize: 12, color: '#FF0D10'}}>
                  {errors.name}
                </Text>
              )}
            </View>
            <View style={{paddingBottom: 20}}>
              <TextInput
                value={values.password}
                style={styles.inputBox}
                onChangeText={handleChange('password')}
                placeholder="Password"
                placeholderTextColor={'#ccc'}
                onBlur={() => setFieldTouched('password')}
                secureTextEntry={true}
              />
              {touched.password && errors.password && (
                <Text style={{fontSize: 12, color: '#FF0D10'}}>
                  {errors.password}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.btnStyle,
                isValid ? styles.buttonEnable : styles.buttonDisable,
              ]}
              disabled={!isValid}
              onPress={handleSubmit}
              underlayColor="#fff">
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(Login);

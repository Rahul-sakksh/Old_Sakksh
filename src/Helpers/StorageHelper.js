import AsyncStorage from "@react-native-async-storage/async-storage";

//Storing in Async Storage
export async function storeData(key, value) {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      // saving error
    }
  }
  
  //Getting from Async Storage
  export async function getData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
      return null;
    } catch (e) {
      // error reading value
    }
  }
  
  //Removing from Async Storage
  export async function removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // removing error
    }
  }

  //Clearening Async Storage
  export async function clearStorage() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // error
    }
  }
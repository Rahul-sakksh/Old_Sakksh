import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as constant from '../Utils/Constants';

export default function RadioButton({data, onSelect}) {
  const styles = StyleSheet.create({
    option: {
      fontSize: 14,
      color: 'black',
      textAlign: 'center',
    },
    unselected: {
      backgroundColor: 'white',
      margin: 6,
      padding: 10,
      borderRadius: 30,
      shadowColor: 'grey',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 1,
      shadowOpacity: 1.0,
      width: "30%",
      justifyContent:'center'
    },
    selected: {
      backgroundColor: constant.primaryColor,
      margin: 6,
      padding: 10,
      borderRadius: 30,
      width: "30%",
      color: '#fff',
      justifyContent:'center'
    },
    optionSelected: {
      fontSize: 14,
      textAlign: 'center',
      color: "#fff",

    },
  });

  const [userOption, setUserOption] = useState(null);
  const selectHandler = value => {
    onSelect(value);
    setUserOption(value);
  };
  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
      {data.map(item => {
        return (
          <Pressable
            style={
              item.value === userOption ? styles.selected : styles.unselected
            }
            onPress={() => selectHandler(item.value)}>
            <Text style={item.value === userOption ? styles.optionSelected : styles.option}> {item.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

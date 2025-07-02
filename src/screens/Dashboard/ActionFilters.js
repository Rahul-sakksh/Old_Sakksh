import React from 'react';
import {View, FlatList, StyleSheet, Text, StatusBar, TouchableOpacity } from 'react-native';
import NavigationBar from '../../Common/NavigationBar';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as constant from  '../../Utils/Constants'
import { navigate } from '../../Utils/RootNavigation';

const DATA = [
  {
    id: '1',
    title: 'Issue',
  },
  {
    id: '2',
    title: 'Best Practices',
  },
  {
    id: '3',
    title: 'Learning’s',
  },
  {
    id: '4',
    title: 'Overdue',
  },
  {
    id: '5',
    title: 'Due Date',
  },
  {
    id: '6',
    title: 'Pending',
  },
  {
    id: '7',
    title: 'Site',
  },
  {
    id: '8',
    title: 'Status',
  },
  {
    id: '9',
    title: 'Assigned To',
  },
  {
    id: '10',
    title: 'Assignee',
  },
];

const ActionFilters = ({navigation}) => {
  const renderItem = ({ item }) => (
    <Item title={item.title} />
  );

  const Item = ({ title }) => (
    <View style={styles.item}>
        <TouchableOpacity onPress={() => {navigate('videos', {title})}}>
      <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar showBackButton={true} onPressBack={() => navigation.goBack()} title={'Filters'} hideRightButtons={true}/>
      <View style = {{flex:1, backgroundColor: '#fff'}}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: constant.primaryColor
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 8
  },
  title: {
    fontSize: 16,
  },
});

export default ActionFilters;
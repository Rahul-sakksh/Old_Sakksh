import React, {memo, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from 'react-native';
import {getData} from '../../Helpers/StorageHelper';
import * as constant from '../../Utils/Constants';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import Loader from '../../Common/Loader';
import moment from 'moment';
import {navigate} from '../../Utils/RootNavigation';
import {useIsFocused} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';
function ActionList({filter, showHideSortBy}) {
  const isFocused = useIsFocused();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fafafa',
      height: '85%',
      flex: 1,
    },
    sortByContainer: {
      padding: 5,
      flexDirection: 'row',
    },
    button: {
      borderColor: 'lightgray',
      borderWidth: 0.5,
      borderRadius: 15,
      padding: 8,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemContainer: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      margin: 10,
    },
    title: {
      paddingVertical: 5,
      fontSize: 15,
      fontWeight: '600',
      textTransform: 'capitalize',
      color: '#595959',
    },
    learningColor: {
      paddingVertical: 5,
      fontSize: 15,
      fontWeight: '600',
      color: '#000',
      textTransform: 'uppercase',
    },
    issueColor: {
      paddingVertical: 5,
      fontSize: 15,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    severity: {
      paddingVertical: 5,
      color: 'green',
    },
    date: {
      paddingVertical: 5,
      color: 'gray',
    },
  });

  useEffect(() => {
    if (filter) {
      setActionList([]);
      setFilterBy(filter)
      // switch (filter) {
      //   case 'All':
      //     setActionList(actionListData);
      //     break;

      //   case 'Issues':
      //     setActionList(
      //       actionListData.filter(actions => actions.action_type === 'Issue'),
      //     );
      //     break;

      //   case 'Best Practice':
      //     setActionList(
      //       actionListData.filter(
      //         actions => actions.action_type === 'Best Practice',
      //       ),
      //     );
      //     break;

      //   case 'Learning':
      //     setActionList(
      //       actionListData.filter(
      //         actions => actions.action_type === 'Learning',
      //       ),
      //     );
      //     break;

      //   case 'Pending':
      //     setActionList(
      //       actionListData.filter(
      //         actions => actions.action_status === 'Pending',
      //       ),
      //     );
      //     break;

      //   case 'Overdue':
      //     setActionList(
      //       actionListData.filter(actions => actions.delaydays > 0),
      //     );
      //     break;

      //   case 'Closed':
      //     setActionList(
      //       actionListData.filter(
      //         actions => actions.action_status === 'Closed',
      //       ),
      //     );
      //     break;

      //   default:
      //     break;
      // }
    }
  }, [filter]);

  const [actionList, setActionList] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionListData, setActionListData] = useState(null);

  const [sortedBy, setSortedBy] = useState(null);

  const [selectedButton, setSelectedButton] = useState(null);

  const [filterBy, setFilterBy] = useState(null)

  const getActions = async () => {
    setActionList(null);
    setLoading(true);
    const user_id = await getData(constant.userID);
    const device_id = await getData(constant.deviceID);
    const token = await getData(constant.token);
    let getActionList = `${constant.baseUri}srv_action_list.php?user_id=${user_id}&token=${token}&device_id=${device_id}&sort_by=${sortedBy}&filter_by=${filterBy}`;
    console.log('getActionList', getActionList);
    axios
      .get(getActionList)
      .then(result => {
        setLoading(false);
        if (result && result.status == 200) {
          const data = result.data.data;
          console.log(data);
          setActionListData(data);
          setActionList(data);
        } else {
          Snackbar.show({
            text: 'Problem while fetching',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      })
      .catch(err => {
        setLoading(false);
        Snackbar.show({
          text: 'Something went wrong!',
          duration: Snackbar.LENGTH_SHORT,
        });
        console.log('err :', err);
      });
  };

  useEffect(() => {
    if (isFocused) {
      getActions();
    }
  }, [isFocused, sortedBy, filterBy]);

  const getSeverityTextAndColor = severity => {
    if (severity === '15') {
      return ['Low', '#f5c542'];
    } else if (severity === '16') {
      return ['Medium', 'orange'];
    } else {
      return ['High', '#E30B5C'];
    }
  };

  const moveToDetails = data => {
    navigate('actionDetail', data);
  };

  const isRecurring = data => {
    return (
      data.recurring === '1' || data.recurring === '2' || data.recurring === '3'
    );
  };

  const renderItem = ({item}) => {
    const severity = getSeverityTextAndColor(item.severity);
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => moveToDetails(item)}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {item.action_type === 'Issue' ? (
              <Text style={[styles.learningColor]}>{item.action_type}</Text>
            ) : (
              <Text style={styles.issueColor}>{item.action_type}</Text>
            )}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {isRecurring(item) && (
                <TouchableOpacity>
                  <Ionicons
                    name="repeat"
                    size={18}
                    color="black"
                    style={{paddingRight: 20}}
                  />
                </TouchableOpacity>
              )}
              <Text style={[styles.severity, {color: severity[1]}]}>
                {severity[0]}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 0.5,
              backgroundColor: 'lightgray',
              marginVertical: 5,
            }}></View>
          <Text style={styles.title}>{item.action}</Text>
          <Text style={styles.date}>
            {moment(item.action_assigned_date).format('LL')}
          </Text>
          <Text style={styles.date}>Assigned to: {item.assigntoemail}</Text>
          <View
            style={{
              height: 0.5,
              backgroundColor: 'lightgray',
              marginVertical: 5,
            }}></View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                backgroundColor:
                  item.action_status === 'Pending' ? '#fffff0' : '#ECFFDC',
                borderRadius: 5,
                paddingHorizontal: 5,
              }}>
              <Text style={styles.date}>
                {item.action_status === 'Pending' ? 'To Do' : 'Closed'}
              </Text>
            </View>
            {item.delaydays <= 0 ? (
              <Text style={styles.date}>
                Target {moment(item.target_completion_date).format('LL')}
              </Text>
            ) : (
              <Text style={styles.date}>{item.delaydays} days delay</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const sortBy = value => {
    setSortedBy(value);
    switch (value) {
      case 'action_assigned_date':
        setSelectedButton(0);
        break;
      case 'Target_completion_date':
        setSelectedButton(1);
        break;
      case 'assignedby':
        setSelectedButton(2);
        break;
      default:
        setSelectedButton(3);
        break;
    }
  };

  if (loading) {
    return <Loader />;
  } else {
    return (
      <View style={styles.container}>
        {showHideSortBy && (
        <View style={styles.sortByContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
          </View>
          <ScrollView horizontal>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedButton === 0 ? constant.primaryColor : null,
                  },
                ]}
                onPress={() => sortBy('action_assigned_date')}>
                <Text style={{fontSize: 12, color: selectedButton === 0 ? 'white' : null}}>
                  {' '}
                  Assigned Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedButton === 1 ? constant.primaryColor : null,
                  },
                ]}
                onPress={() => sortBy('Target_completion_date')}>
                <Text style={{fontSize: 12,color: selectedButton === 1 ? 'white' : null}}>
                  {' '}
                  Completion Date
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedButton === 2 ? constant.primaryColor : null,
                  },
                ]}
                onPress={() => sortBy('assignedby')}>
                <Text style={{fontSize: 12, color: selectedButton === 2 ? 'white' : null}}>
                  {' '}
                  Assigned By
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      selectedButton === 3 ? constant.primaryColor : null,
                  },
                ]}
                onPress={() => sortBy('action_assigned_to')}>
                <Text style={{fontSize: 12, color: selectedButton === 3 ? 'white' : null}}>
                  {' '}
                  Assigned To
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        )}
        <View
          style={{
            borderColor: constant.headerGreen,
            borderWidth: 0.5,
            margin: 5,
            padding: 5,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 14, fontWeight: 'bold'}}>
            Total: {actionList && actionList.length}
          </Text>
        </View>
        <FlatList
          data={actionList}
          renderItem={renderItem}
          keyExtractor={(item, index) => 'key' + index}
        />
      </View>
    );
  }
}

export default memo(ActionList);

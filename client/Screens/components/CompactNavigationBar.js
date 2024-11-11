import {Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useContext} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {SocketContext} from '../../Screens/api/socketContext';

import styles from '../styles';

const CompactNavigationBar = ({backAction}) => {
  const navigation = useNavigation();
  const {unreadCount, setUnreadCount} = useContext(SocketContext);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
    setUnreadCount(0);
  };

  return (
    <View
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 4,
      }}>
      <TouchableOpacity
        style={{
          zIndex: 1,
          position: 'absolute',
          left: 0,
          margin: 15,
        }}
        onPress={backAction}>
        <Icon name="arrow-left" size={30} color={'green'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.notifIcon}
        onPress={handleNotificationPress}>
        <Icon name="bell" size={30} color={'darkgreen'} />
        {unreadCount > 0 && (
          <View style={styles.notificationIndicator}>
            <Text style={styles.notificationIndicatorText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.calendarIcon}
        onPress={() => {
          navigation.navigate('Calendar');
        }}>
        <Icon name="calendar-alt" size={30} color={'darkgreen'} />
      </TouchableOpacity>
      <Image
        source={require('../../assets/Logo/750x1125.png')}
        style={{
          width: '100%',
          height: 60,
        }}
      />
    </View>
  );
};

export default CompactNavigationBar;

import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationBar from './components/CompactNavigationBar';
import {Avatar} from 'react-native-paper';
import {SocketContext} from '../Screens/api/socketContext';
import {getToken} from './api/tokenStorage';
import {fetchData} from './api/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import SeeMoreButton from './components/SeeMoreButton';
import TimeDisplay from './components/TimeDisplay';

function NotificationScreen(props) {
  const navigation = useNavigation();
  const {notifications} = useContext(SocketContext);
  const [userData, setUserData] = useState('');
  const [storedNotifications, setStoredNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [remainingNotifications, setRemainingNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const saveNotificationsToStorage = async notifications => {
    try {
      const jsonValue = JSON.stringify(notifications);
      await AsyncStorage.setItem('@notifications', jsonValue);
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  };

  const loadNotificationsFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@notifications');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error loading notifications:', e);
      return [];
    }
  };

  const getData = async () => {
    const token = await getToken();
    try {
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);

      const loadedNotifications = await loadNotificationsFromStorage();
      setStoredNotifications(loadedNotifications);
      setDisplayedNotifications(
        loadedNotifications
          .slice(0, 5)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      );
      setRemainingNotifications(
        loadedNotifications
          .slice(5)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      );
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const combineAndSaveNotifications = async () => {
      const loadedNotifications = await loadNotificationsFromStorage();
      const uniqueNotifications = notifications.filter(
        notification =>
          !loadedNotifications.some(
            storedNotification =>
              storedNotification.timestamp === notification.timestamp,
          ),
      );
      const combinedNotifications = [
        ...uniqueNotifications,
        ...loadedNotifications,
      ];

      const sortedNotifications = combinedNotifications.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setStoredNotifications(sortedNotifications);
      setDisplayedNotifications(sortedNotifications.slice(0, 5));
      setRemainingNotifications(sortedNotifications.slice(5));
      await saveNotificationsToStorage(sortedNotifications);
    };
    if (notifications.length > 0) {
      combineAndSaveNotifications();
    }
  }, [notifications]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      getData();
    });

    return unsubscribe;
  }, [props.navigation]);

  const loadMoreNotifications = () => {
    const nextNotifications = remainingNotifications.slice(0, 5);
    const newDisplayedNotifications = [
      ...displayedNotifications,
      ...nextNotifications,
    ];
    const sortedNotifications = newDisplayedNotifications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
    setDisplayedNotifications(sortedNotifications);
    setRemainingNotifications(remainingNotifications.slice(5));
  };

  //TODO: Don't delete! Only archived/Read
  const deleteNotificationsFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('@notifications');
      setStoredNotifications([]);
      setDisplayedNotifications([]);
      setRemainingNotifications([]);
    } catch (e) {
      console.error('Error deleting notifications:', e);
    }
  };

  const navigateToAnnouncementPost = async notification => {
    const token = await getToken();
    try {
      const announcementsResponse = await fetchData('/announcedata', token);
      const announcements = announcementsResponse.data.announcements;
      // console.log('Announcements Response:', announcements);
      console.log('Announcements:', announcements);
      console.log('Notification Header:', notification.announcementHeader);

      const matchingAnnouncement = announcements.find(
        announcement =>
          announcement.header.trim().toLowerCase() ===
          notification.announcementHeader.trim().toLowerCase(),
      );

      if (matchingAnnouncement) {
        navigation.navigate('AnnouncementPost', {
          announcementId: matchingAnnouncement._id,
        });
      } else {
        console.log('No matching announcement found for this notification');
      }
    } catch (error) {
      console.error('NS: Error fetching announcements:', error);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getData} />
      }>
      <View>
        <NavigationBar backAction={() => navigation.navigate('MainHome')} />
        <View style={{backgroundColor: '#306434', height: '100%'}}>
          <Text style={styles.notificationText}>Notifications</Text>

          <TouchableOpacity
            onPress={deleteNotificationsFromStorage}
            style={styles.deleteNotificationsButton}>
            <Icon name="playlist-remove" size={30} color="white" />
          </TouchableOpacity>

          <View style={{padding: 10}}>
            {displayedNotifications.length === 0 ? (
              <View>
                <Text style={{fontSize: 20, color: 'grey'}}>
                  No notifications
                </Text>
              </View>
            ) : (
              <>
                {displayedNotifications.map((notification, index) => {
                  const dateNotif = new Date(notification.timestamp);
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationContainer,
                        {
                          padding: 8,
                          width: '100%',
                          backgroundColor: 'white',
                          flexDirection: 'row',
                          marginBottom: 1,
                        },
                      ]}
                      onPress={() => navigateToAnnouncementPost(notification)}>
                      <View style={{marginRight: 12}}>
                        <Avatar.Image
                          source={{
                            uri:
                              notification.profilePicture ||
                              'https://cscqcph.com/images/cscqcph.png',
                          }}
                          size={60}
                          style={{backgroundColor: 'white'}}
                        />
                      </View>
                      <View style={{flex: 1}}>
                        <Text
                          style={[
                            styles.detailsNotification,
                            {fontSize: 18, marginBottom: 4},
                          ]}>
                          {notification.announcementHeader}
                        </Text>
                        <Text style={[styles.detailsNotification]}>
                          {notification.posterName}
                        </Text>
                        <Text style={[styles.detailsNotification]}>
                          {notification.message}
                        </Text>
                        <TimeDisplay time={notification.timestamp} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <SeeMoreButton
                  onPress={loadMoreNotifications}
                  remainingItems={remainingNotifications}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default NotificationScreen;

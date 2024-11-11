import React, {createContext, useState, useEffect} from 'react';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import {getToken} from './../api/tokenStorage';
import {fetchData} from './../api/api.js';

const SocketContext = createContext();

const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      const userDataResponse = await fetchData('/userdata', token);
      const userID = userDataResponse.data.data._id;

      const newSocket = io('http://192.168.1.11:8000', {
        transports: ['websocket'],
        query: {
          userId: userID,
        },
      });

      newSocket.on('connect', () => {
        console.log('SC: Connected to server');
      });

      newSocket.on('newAnnouncement', message => {
        setNotifications(prevNotifications => [...prevNotifications, message]);
        setUnreadCount(prevCount => prevCount + 1);
        Toast.show({
          type: 'success',
          text1: '📢 New Announcement!',
          text2:
            '🗨️ ' + message.announcementHeader ||
            'Click on the bell to go check it out!',
          onPress: () => Toast.hide(),
        });
      });

      newSocket.on('newCommunityAnnouncement', message => {
        setNotifications(prevNotifications => [...prevNotifications, message]);
        setUnreadCount(prevCount => prevCount + 1);
        Toast.show({
          type: 'success',
          text1: '📢 New Community Announcement!',
          text2:
            '🗨️ ' + message.announcementHeader ||
            'Click on the bell to go check it out!',
          onPress: () => Toast.hide(),
        });
      });

      newSocket.on('newEventMobile', message => {
        setNotifications(prevNotifications => [...prevNotifications, message]);
        setUnreadCount(prevCount => prevCount + 1);
        Toast.show({
          type: 'success',
          text1: '📢 New Event Posted!',
          text2:
            '🗨️ ' + message.eventName ||
            'Click on the bell to go check it out!',
          onPress: () => Toast.hide(),
        });
      });

      newSocket.on('newCommunityEventMobile', message => {
        setNotifications(prevNotifications => [...prevNotifications, message]);
        setUnreadCount(prevCount => prevCount + 1);
        Toast.show({
          type: 'success',
          text1: '📢 New Community Event Posted!',
          text2:
            '🗨️ ' + message.eventName ||
            'Click on the bell to go check it out!',
          onPress: () => Toast.hide(),
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    };

    fetchUserData();
  }, []);

  return (
    <SocketContext.Provider
      value={{socket, notifications, unreadCount, setUnreadCount}}>
      {children}
    </SocketContext.Provider>
  );
};

export {SocketContext, SocketProvider};

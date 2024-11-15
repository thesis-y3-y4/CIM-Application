import React, {Component, useEffect, useState, useRef} from 'react';
import {LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import SplashScreen from 'react-native-splash-screen';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {io} from 'socket.io-client';

import {UserContextProvider} from './Screens/api/userContext.js';
import {
  SocketContextProvider,
  SocketProvider,
} from './Screens/api/socketContext';
import {fetchData} from './Screens/api/api.js';
import {getToken} from './Screens/api/tokenStorage.js';
import firebase from '@react-native-firebase/app';

import CalendarScreen from './Screens/CalendarScreen';
import CommunitiesScreen from './Screens/Community/CommunitiesScreen';
import FriendsScreen from './Screens/FriendsScreen';
import MinigamesScreen from './Screens/MinigamesScreen';
import NotificationScreen from './Screens/NotificationScreen';
import HomeScreen from './Screens/HomeScreen';
import ProfileScreen from './Screens/ProfileScreen';
import DrawerContent from './DrawerContent';
import AboutScreen from './Screens/AboutScreen';
import LoginPage from './Screens/Login/LoginPage';
import CommunityDetailsScreen from './Screens/Community/CommunityDetailsScreen';
import CreatePostScreen from './Screens/Community/CreatePostScreen';
import CimdleScreen from './Screens/Minigames/CimdleScreen';
import FlappyCimScreen from './Screens/Minigames/FlappyCimScreen';
import AnnouncementPostScreen from './Screens/AnnouncementPost';
import ProfileFriendScreen from './Screens/ProfileFriendScreen';
import ShopScreen from './Screens/ShopScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/FontAwesome5';

const toastConfig = {
  gameWon: props => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: 'darkgreen',
        width: '80%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      text1Style={{
        fontSize: 20,
        fontWeight: '700',
        color: 'lightgrey',
        marginBottom: '30',
      }}
      text2Style={{
        fontSize: 14,
        color: 'white',
      }}
      text1="SPLENDID!"
      text2="You have guessed the word correctly!"
    />
  ),
  gameLost: props => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: 'darkgreen',
        width: '80%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      text1Style={{
        fontSize: 20,
        fontWeight: '700',
        color: 'lightgrey',
        marginBottom: '30',
      }}
      text2Style={{
        fontSize: 14,
        color: 'white',
      }}
      text1="No more attempts left."
      // text2="The correct word is: ${word}" //hi hello, hindi ko sure how this should work, em sorry t_t
    />
  ),

  success: props => (
    <BaseToast
      {...props}
      onPress={() => Toast.hide()}
      style={{
        borderLeftColor: 'green',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        borderRightColor: 'green',
        borderRightWidth: 7,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      onPress={() => Toast.hide()}
      text2NumberOfLines={3}
      style={{
        borderLeftColor: 'red',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        borderRightColor: 'red',
        borderRightWidth: 7,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
  updateProfilePictureSuccess: props => (
    <BaseToast
      {...props}
      onPress={() => Toast.hide()}
      style={{
        borderLeftColor: 'green',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        borderRightColor: 'green',
        borderRightWidth: 7,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 14,
      }}
      text1="Success!"
      text2="Profile picture has been updated"
    />
  ),
  updateProfilePictureFailed: props => (
    <BaseToast
      {...props}
      onPress={() => Toast.hide()}
      style={{
        borderLeftColor: 'red',
        borderLeftWidth: 7,
        width: '90%',
        height: 70,
        borderRightColor: 'red',
        borderRightWidth: 7,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
      }}
      text2Style={{
        fontSize: 14,
      }}
      text1="Oops!"
      text2="Unable to update profile picture"
    />
  ),
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp();
}

const StackNav = () => {
  LogBox.ignoreLogs(['Reanimated 2', 'Animated: `useNativeDriver`']);
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        statusBarColor: 'darkgreen',
        headerStyle: {
          backgroundColor: 'green',
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Communities" component={CommunitiesScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Minigames" component={MinigamesScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen
        name="CommunityDetails"
        component={CommunityDetailsScreen}
      />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="Cimdle" component={CimdleScreen} />
      <Stack.Screen name="FlappyCim" component={FlappyCimScreen} />
      <Stack.Screen
        name="AnnouncementPost"
        component={AnnouncementPostScreen}
      />
      <Stack.Screen name="ProfileFriend" component={ProfileFriendScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />

      <Stack.Screen
        name="LoginUser"
        component={LoginNav}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const DrawerNav = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name="DrawerHomeInitial" component={StackNav} />
    </Drawer.Navigator>
  );
};

const LoginNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="DrawerHome" component={DrawerNav} />
    </Stack.Navigator>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  async function getData() {
    const data = await AsyncStorage.getItem('isLoggedIn');
    console.log(data, 'at App.jsx');
    setIsLoggedIn(data);
  }

  useEffect(() => {
    getData();

    setTimeout(() => {
      SplashScreen.hide();
    }, 900);
  }, [isLoggedIn]);

  const ForwardedToast = React.forwardRef((props, ref) => (
    <Toast {...props} ref={ref} />
  ));

  return (
    <SocketProvider value={socket}>
      <NavigationContainer>
        {isLoggedIn ? <DrawerNav /> : <LoginNav />}
        <ForwardedToast config={toastConfig} />
      </NavigationContainer>
    </SocketProvider>
  );
}

export default App;

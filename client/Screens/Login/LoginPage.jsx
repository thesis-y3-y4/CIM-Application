import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {useEffect, useState, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {fetchUser} from '../api/api';
import {storeToken} from '../api/tokenStorage';
import styles from './styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';

function LoginPage({props}) {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(true);
  const [studentemail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleSubmit = async () => {
    console.log(studentemail, password);
    const userData = {
      studentemail: studentemail,
      password,
    };

    try {
      const response = await fetchUser('/login-user', userData);
      console.log(response.data);
      if (response.data.status == 'ok') {
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: 'Welcome to CIM App',
            text2: 'You have successfully logged in',
            visibilityTime: 3000,
            onPress: () => Toast.hide(),
          });
        }, 1000);
        const token = response.data.data;
        await storeToken(token);
        await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
        if (response.data.adminType) {
          await AsyncStorage.setItem('userType', response.data.adminType);
        } else {
          console.log('adminType is null or undefined');
        }

        const retrievedToken = await AsyncStorage.getItem('userToken');

        navigation.navigate('DrawerHome');
      } else {
        emailInputRef.current.clear();
        passwordInputRef.current.clear();

        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Invalid Credentials',
            text2: 'Please try again',
            visibilityTime: 3000,
            onPress: () => Toast.hide(),
          });
        }, 800);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'An error occurred, please try again',
          visibilityTime: 3000,
          onPress: () => Toast.hide(),
        });
      }, 800);
    }
  };

  async function getData() {
    const data = await AsyncStorage.getItem('isLoggedIn');
    console.log(data, 'at LoginPage.jsx');
  }

  useEffect(() => {
    getData();
    console.log('gotData');
  }, []);

  const handleBackPress = () => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Exit',
        onPress: () => BackHandler.exitApp(),
      },
    ]);
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, []),
  );

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always">
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.mainContainer}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../assets/Logo/logo.png')}
            />
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.text_header}>Login</Text>

            <View style={styles.action}>
              <FontAwesome name="user-o" style={styles.smallIcons} />
              <TextInput
                ref={emailInputRef}
                placeholder="School Email"
                placeholderTextColor={'#666'}
                style={styles.textInput}
                onChange={e => setEmail(e.nativeEvent.text)}
              />
            </View>

            <View style={styles.action}>
              <FontAwesome name="lock" style={styles.smallIcons} />
              <TextInput
                ref={passwordInputRef}
                placeholder="Password"
                placeholderTextColor={'#666'}
                style={styles.textInput}
                secureTextEntry={showPassword}
                onChange={e => setPassword(e.nativeEvent.text)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  color={showPassword ? 'grey' : 'green'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.button}>
            <TouchableOpacity style={styles.inBut} onPress={handleSubmit}>
              <View>
                <Text style={styles.textSign}>Login</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default LoginPage;

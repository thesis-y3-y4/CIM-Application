import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token
export const storeToken = async token => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    // console.log('TOKEN: ' + token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
  }
};

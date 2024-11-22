import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Avatar, Title} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  useNavigation,
  useFocusEffect,
  DrawerActions,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchData} from './Screens/api/api';
import {getToken} from './Screens/api/tokenStorage';

const DrawerList = [
  {icons: 'home-outline', label: 'Home', navigateTo: 'MainHome'},
  {icons: 'account-group', label: 'Communities', navigateTo: 'Communities'},
  {icons: 'gamepad', label: 'Minigames', navigateTo: 'Minigames'},
  {icons: 'shopping', label: 'Shop', navigateTo: 'Shop'},
  {icons: 'account-supervisor', label: 'Friends', navigateTo: 'Friends'},
  {icons: 'exclamation-thick', label: 'About', navigateTo: 'About'},
];

const DrawerLayout = ({icon, label, navigateTo}) => {
  const navigation = useNavigation();

  return (
    <DrawerItem
      icon={({color, size}) => <Icon name={icon} color={color} size={size} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

const DrawerItems = () => {
  return DrawerList.map((item, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={item.icons}
        label={item.label}
        navigateTo={item.navigateTo}
      />
    );
  });
};

function DrawerContent({refreshData}) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      navigation.navigate('LoginUser');
      return;
    }

    try {
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('DrawerContent: Error fetching user data:', error);
      setIsLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [getData]),
  );

  useEffect(() => {
    if (refreshData) {
      refreshData(getData);
    }
  }, [refreshData, getData]);

  async function signOut() {
    try {
      // Get token from storage
      const token = await getToken();
      if (!token) {
        console.log('No token found');
        return;
      }

      // Get user data to fetch studentemail
      const {studentemail} = userData;

      // Call the /logout-user endpoint
      const response = await fetchData('/logout-user', token, 'POST', {
        studentemail,
      });

      if (response.status === 'ok') {
        console.log('Logged out successfully');

        // Close DrawerContent
        navigation.dispatch(DrawerActions.closeDrawer());

        // Remove token and user data from AsyncStorage
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('token');

        // Reset user data state
        setUserData({});

        // Navigate to Login screen
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginUser'}],
        });
      } else {
        console.log('Error during logout:', response.message);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView>
        <View style={styles.drawerContent}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('Profile');
            }}>
            <View style={styles.userInfoSection}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#d2be00" />
              ) : (
                userData && (
                  <View>
                    <View style={{flexDirection: 'row', marginTop: 15}}>
                      <Avatar.Image
                        source={
                          userData.profilePicture
                            ? {uri: userData.profilePicture}
                            : require('./assets/default-profile.jpg')
                        }
                        size={50}
                        style={{marginTop: 5}}
                      />
                      <View style={{marginLeft: 10, flexDirection: 'column'}}>
                        <Title style={styles.title}>{userData.name}</Title>
                        <Text style={styles.caption} numberOfLines={1}>
                          {userData.studentemail}
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => signOut()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    width: '100%',
    color: '#999999',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#dedede',
    borderTopWidth: 1,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default DrawerContent;

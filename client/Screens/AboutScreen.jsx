  import {Text, View, ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import NavigationBar from './components/NavigationBar';

// import styles from './styles';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';

function AboutScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');

  async function getData() {
    const token = await getToken();

    //console.log('TokenDrawer: ' + token);
    try {
      const response = await fetchData('/userdata', token);

      //console.log('Response data:', response.data);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}>
      <View>
        <NavigationBar navigation={navigation} />

        <View style={styles.container}>

          <Text style={styles.title}>About</Text>
          <View>
            <Text style={styles.details}>Hello!</Text>
            <Text style={styles.details}>Welcome to the CIM App!</Text>
            <Text style={styles.details}>
              This app is designed to help you stay connected with the College
              of St. Catherine Quezon City. You can view announcements, events,
              and more!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: 'darkgreen',
  }
})

export default AboutScreen;

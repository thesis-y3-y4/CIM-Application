import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import NavigationBar from './components/NavigationBar';
import { fetchData } from './api/api';
import { getToken } from './api/tokenStorage';

function AboutScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');

  async function getData() {
    const token = await getToken();

    try {
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <ImageBackground
      source={require('C:\\Users\\dyerm\\Documents\\CIM-Application\\client\\assets\\aboutpagebg.png')}
      style={styles.backgroundImage}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View>
          <NavigationBar navigation={navigation} />

          <View style={styles.container}>
            <Text style={styles.title}>About</Text>
            <View>
              <Text style={styles.details1}>Welcome to the CIM App!</Text>
              <Text style={styles.details}>
              CIM is an innovative application aimed at transforming the way information is shared
              within the College of St. Catherine Quezon City. By consolidating announcements from 
              diverse sources into a single platform, CIM guarantees seamless access to vital updates, 
              ensuring stakeholders remain effortlessly informed.
              </Text>
              <Text style={styles.details2}>We extend our gratitude to the College of St. Catherine Quezon City 
                and its stakeholders for their {"\n"}support and collaboration in the development of CIM.</Text>
              
            </View>
          </View>
        </View>
        <Text style={styles.footer}>BAPjr</Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  details: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  details1: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
    marginBottom: 8,
  },
  details2: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
  },
  footer:{
    color: 'white',
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    letterSpacing: 1,
    position: 'absolute',
    bottom: 250,           // Distance from the bottom edge
    right: 80,
    opacity: 0.7,
    textShadowColor: 'black',
  },
});

export default AboutScreen;

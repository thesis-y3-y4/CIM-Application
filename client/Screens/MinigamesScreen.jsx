import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import NavigationBar from './components/NavigationBar';
import {getToken} from './api/tokenStorage';
import {fetchData} from './api/api';

function MinigamesScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  async function getData() {
    const token = await getToken();
    try {
      const response = await fetchData('/userdata', token);
      const userId = response.data.data._id;

      const minigameStatsResponse = await fetchData(
        `/cimdle-stats/${userId}`,
        token,
        'GET',
      );
      setUserData(minigameStatsResponse.data);
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
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minigames Screen</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.button}>
          <Image
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRMKCslCVgezPzH8FJx8uM8VNsxaQejVQixA&s',
            }}
            style={styles.image}
          />
          <Text style={styles.buttonText}>View Cimdle Statistics</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.title}>Cimdle Statistics</Text>
              <Text style={styles.statText}>
                Games Played: {userData.gamesPlayed || 0}
              </Text>
              <Text style={styles.statText}>Wins: {userData.wins || 0}</Text>
              <Text style={styles.statText}>Lose: {userData.lose || 0}</Text>
              <Text style={styles.statText}>
                Win Percentage: {userData.winPercentage || 0}%
              </Text>
              <Text style={styles.statText}>
                Average Guesses: {userData.averageGuesses || 0}
              </Text>
              <Pressable
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 26,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statText: {
    color: '#555',
    fontSize: 18,
    marginVertical: 5,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'darkgreen',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF5722',
    marginTop: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MinigamesScreen;

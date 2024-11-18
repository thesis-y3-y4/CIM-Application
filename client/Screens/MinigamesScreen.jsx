import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
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
  const [selectedGame, setSelectedGame] = useState(''); // Track the selected game for modal

  async function getData(gameType) {
    const token = await getToken();
    console.log('token', token);
    try {
      const response = await fetchData('/userdata', token);
      const userId = response.data.data._id;
      console.log('userid', userId);

      // Fetch stats based on game type (either CIMDle or FlappyCIM)
      const statsEndpoint =
        gameType === 'CIMDle'
          ? `/cimdle-stats/${userId}`
          : `/flappycim-stats/${userId}`;

      const minigameStatsResponse = await fetchData(
        statsEndpoint,
        token,
        'GET',
      );
      setUserData(minigameStatsResponse.data);
      console.log(minigameStatsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    if (selectedGame) {
      getData(selectedGame);
    }
  }, [selectedGame]);

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
        {/* CIMDle Stats Button */}
        <TouchableOpacity
          onPress={() => {
            setSelectedGame('CIMDle');
            setModalVisible(true);
          }}
          style={styles.button}>
          <Image
            source={require('../assets/minigames_logo/CIMdle_LOGO.png')}
            style={styles.image}
          />
          <Text style={styles.buttonText}>View CIMDle Statistics</Text>
        </TouchableOpacity>

        {/* Flappy CIM Stats Button */}
        <TouchableOpacity
          onPress={() => {
            setSelectedGame('FlappyCIM');
            setModalVisible(true);
          }}
          style={styles.button}>
          <Image
            source={require('../assets/minigames_logo/FLAPPY-CAT-LOGO.png')}
            style={styles.image}
          />
          <Text style={styles.buttonText}>View Flappy CIM Statistics</Text>
        </TouchableOpacity>

        {/* CIMDle or FlappyCIM Stats Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.title}>Statistics</Text>
              {/* Render stats dynamically based on selected game */}
              <Text style={styles.statText}>
                Games Played: {userData.gamesPlayed || 0}
              </Text>
              <Text style={styles.statText}>Wins: {userData.wins || 0}</Text>
              <Text style={styles.statText}>Lose: {userData.lose || 0}</Text>
              <Text style={styles.statText}>
                Win Percentage: {userData.winPercentage || 0}%
              </Text>
              {selectedGame === 'CIMDle' ? (
                <Text style={styles.statText}>
                  Average Guesses: {userData.averageGuesses || 0}
                </Text>
              ) : (
                <Text style={styles.statText}>
                  Average Tries: {userData.averageTries || 0}
                </Text>
              )}
              {/* Close Button */}
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
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
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MinigamesScreen;

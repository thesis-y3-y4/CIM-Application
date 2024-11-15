import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {GameEngine} from 'react-native-game-engine';
import {useNavigation, useRoute} from '@react-navigation/native';
import entities from './src/flappy_components/entities';
import Physics from './src/flappy_components/physics';
import {getToken} from '../api/tokenStorage.js';
import {fetchData} from '../api/api.js';

function FlappyCimScreen(props) {
  const route = useRoute();
  const {announcementId} = route.params;
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [running, setRunning] = useState(false);
  const [gameEngine, setGameEngine] = useState(null);
  const [attempts, setAttempts] = useState(5);
  const [gameResult, setGameResult] = useState(null);
  const [gameOverHandled, setGameOverHandled] = useState(false);

  async function getData() {
    const token = await getToken();
    try {
      const response = await fetchData('/userdata', token);
      const userId = response.data.data._id;

      const minigameResponse = await fetchData(
        `/announcedata/${announcementId}`,
        token,
      );

      if (!minigameResponse || !minigameResponse.data) {
        console.error('Minigame response is invalid:', minigameResponse);
        Alert.alert('Error', 'Minigame data not found');
        return;
      }

      setUserData(response.data.data);
      //console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error fetching FlappyCIM data:', error);
    }
  }

  useEffect(() => {
    getData();
    setRunning(false);
    if (attempts === 0) {
      setGameResult('No attempts left!');
    }
  }, [attempts]);

  function calculatePoints(attempts) {
    switch (attempts) {
      case 5:
        return 100;
      case 4:
        return 80;
      case 3:
        return 60;
      case 2:
        return 40;
      case 1:
        return 20;
      default:
        return 0;
    }
  }

  async function submitGameResult(result) {
    const token = await getToken();
    const points = calculatePoints(attempts);
    const stats = {
      result,
      points,
      FlappyCIM: {
        tries: attempts,
      },
    };
    console.log('Stats:', stats);

    try {
      const response = await fetchData(`/playminigame`, token, 'POST', {
        announcementId,
        userId: userData._id,
        game: 'Flappy CIM',
        result,
        stats,
        attempts,
        tries: attempts,
        points,
      });
      if (response.status === 201) {
        console.log('FlappyCIM result submitted:', response.data);
      }
    } catch (error) {
      console.error('Error submitting FlappyCIM result:', error);
      console.log('FlappyCIM announcementId:', announcementId);
      console.log('FlappyCIM userId:', userData._id);
      console.log('FlappyCIM result:', result);
      console.log('FlappyCIM tries:', attempts);
      console.log('FlappyCIM points:', points);
      console.log('FlappyCIM stats:', stats);
      console.log('FlappyCIM response:', response);
    }
  }

  const resetGame = () => {
    setGameResult(null);
    setRunning(true);
    setGameOverHandled(false); // Reset flag for the new game
    gameEngine.swap(entities());
  };

  const handleEvent = event => {
    if (!gameOverHandled) {
      switch (event.type) {
        case 'game_over':
          setGameOverHandled(true); // Set flag to prevent further handling
          setRunning(false);

          // If attempts are exhausted, show "No attempts left!" instead
          if (attempts === 1) {
            setAttempts(0);
            setGameResult('No attempts left!');
            submitGameResult('lose');

            setTimeout(() => {
              navigation.navigate('AnnouncementPost', {
                announcementId: announcementId,
              });
              console.log('FlappyCIM announcementId:', announcementId);
            }, 3000);
          } else {
            setAttempts(prev => prev - 1); // Decrement attempts
            setGameResult('Attempt Failed');
          }
          break;

        case 'game_won':
          setGameOverHandled(true); // Set flag to prevent further handling
          setRunning(false);
          setGameResult('You Win!');
          submitGameResult('win');

          setTimeout(() => {
            navigation.navigate('AnnouncementPost', {
              announcementId: announcementId,
            });
            console.log('FlappyCIM announcementId:', announcementId);
          }, 2000);
          break;
      }
    }
  };

  const startGame = () => {
    if (attempts > 0) {
      resetGame();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Attempts: {attempts}</Text>

      {gameResult && <Text style={styles.result}>{gameResult}</Text>}

      {attempts == 5 && (
        <Text style={styles.rule}>
          Pass all the obstacles to view the surprises.
        </Text>
      )}

      <ImageBackground
        source={require('./src/flappy_components/background-day.png')}
        style={styles.gameEngineStyle}>
        <GameEngine
          style={styles.gameEngineStyle}
          ref={ref => {
            setGameEngine(ref);
          }}
          systems={[Physics]}
          entities={entities()}
          running={running}
          onEvent={handleEvent}
        />
      </ImageBackground>

      {!running && attempts > 0 && (
        <View>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Press to Start</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameEngineStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rule: {
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    top: -180,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 18,
    color: '#FFF',
    zIndex: 10,
  },
  counter: {
    fontSize: 18,
    position: 'absolute',
    top: 30,
    left: 30,
    color: 'darkgreen',
    fontWeight: 'bold',
    zIndex: 10,
  },
  result: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15,
    color: '#FFF',
    zIndex: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: 'darkgreen',
    borderRadius: 10,
    marginBottom: 50,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
  },
});

export default FlappyCimScreen;

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
import Toast from 'react-native-toast-message';

function FlappyCimScreen(props) {
  const route = useRoute();
  const {announcementId} = route.params;
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [gameEngine, setGameEngine] = useState(null);
  const [gameState, setGameState] = useState({
    running: false,
    attempts: 5,
    gameResult: null,
    gameOverHandled: false,
  });

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
    } catch (error) {
      console.error('Error fetching FlappyCIM data:', error);
    }
  }

  useEffect(() => {
    getData();
    setGameState(prevState => ({
      ...prevState,
      running: false,
    }));
    if (gameState.attempts === 0) {
      setGameState(prevState => ({
        ...prevState,
        gameResult: 'No attempts left!',
      }));
    }
  }, [gameState.attempts]);

  function calculatePoints(attempts) {
    if (attempts === 0) {
      return 10;
    }
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
    }
  }
  async function submitGameResult(resultData) {
    const token = await getToken();
    const {result, points, FlappyCIM} = resultData;

    // Ensure FlappyCIM is always defined and has the necessary properties
    const stats = {
      result,
      points,
      FlappyCIM: FlappyCIM || {tries: 0},
    };

    console.log('Stats:', stats);
    try {
      const response = await fetchData(`/playminigame`, token, 'POST', {
        announcementId,
        userId: userData._id,
        game: 'Flappy CIM',
        result,
        stats,
        attempts: stats.FlappyCIM.tries,
        points,
      });
      if (response.status === 201) {
        console.log('FlappyCIM result submitted:', response.data);
      }
    } catch (error) {
      console.error('Error submitting FlappyCIM result:', error);
    }
  }

  const resetGame = () => {
    setGameState(prevState => ({
      ...prevState,
      gameResult: null,
      running: true,
      gameOverHandled: false,
    }));
    gameEngine.swap(entities());
  };

  const handleEvent = event => {
    if (!gameState.gameOverHandled) {
      switch (event.type) {
        case 'game_over':
          setGameState(prevState => ({
            ...prevState,
            gameOverHandled: true,
            running: false,
          }));

          // If attempts are exhausted, show "No attempts left!" instead
          if (gameState.attempts === 1) {
            setGameState(prevState => ({
              ...prevState,
              attempts: 0,
              gameResult: 'No attempts left!',
            }));
            Toast.show({
              type: 'error',
              position: 'top',
              text1: 'Game Over',
              text2: 'You lost the game.',
              visibilityTime: 3000,
            });

            submitGameResult({
              result: 'lose',
              points: 10,
              FlappyCIM: {
                tries: 0,
              },
            });
            setTimeout(() => {
              navigation.navigate('AnnouncementPost', {
                announcementId: announcementId,
              });
            }, 3000);
          } else {
            setGameState(prevState => ({
              ...prevState,
              attempts: prevState.attempts - 1,
              gameResult: 'Attempt Failed',
            }));
          }
          break;

        case 'game_won':
          setGameState(prevState => ({
            ...prevState,
            gameOverHandled: true,
            running: false,
            gameResult: 'You Win!',
          }));
          submitGameResult({
            result: 'win',
            points: calculatePoints(gameState.attempts),
            FlappyCIM: {
              tries: gameState.attempts,
            },
          });
          const points = calculatePoints(gameState.attempts);
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Good Job Wildcat!',
            text2: 'You won +' + points + ' points!',
            visibilityTime: 3000,
          });

          setTimeout(() => {
            navigation.navigate('AnnouncementPost', {
              announcementId: announcementId,
            });
          }, 2000);
          break;
      }
    }
  };

  const startGame = () => {
    if (gameState.attempts > 0) {
      resetGame();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Attempts: {gameState.attempts}</Text>

      {gameState.gameResult && (
        <Text style={styles.result}>{gameState.gameResult}</Text>
      )}

      {gameState.attempts === 5 && (
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
          running={gameState.running}
          onEvent={handleEvent}
        />
      </ImageBackground>

      {!gameState.running && gameState.attempts > 0 && (
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

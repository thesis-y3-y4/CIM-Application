import {Text, View, ScrollView, StyleSheet, Alert} from 'react-native';
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import NavigationBar from '../components/NavigationBar';
import Toast from 'react-native-toast-message';

import {getToken} from '../api/tokenStorage';
import {fetchData} from '../api/api';

import {colors, CLEAR, ENTER} from './src/constants';
import Keyboard from './src/cimdle_components/Keyboard';

//wordle:
const tries = 5;
const copyArray = arr => {
  return [...arr.map(rows => [...rows])];
};

function CimdleScreen(props) {
  const route = useRoute();
  const {announcementId} = route.params;
  const [userData, setUserData] = useState('');
  const [minigameWord, setMinigameWord] = useState('');
  const navigation = useNavigation();

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

      setMinigameWord(minigameResponse.data.minigameWord.toLowerCase());
      // console.log('Minigame word:', minigameResponse.data.minigameWord);

      setUserData(response.data.data);
      //console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error fetching CIMDLE data:', error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  function calculatePoints(guesses) {
    switch (guesses) {
      case 1:
        return 100;
      case 2:
        return 80;
      case 3:
        return 60;
      case 4:
        return 40;
      case 5:
        return 20;
      default:
        return 0;
    }
  }

  async function submitGameResult(result) {
    const token = await getToken();
    const points = calculatePoints(curRow);
    const stats = {
      result,
      points,
      CIMWordle: {
        guesses: curRow,
      },
    };
    console.log('Stats:', stats);

    try {
      const response = await fetchData(`/playminigame`, token, 'POST', {
        announcementId,
        userId: userData._id,
        game: 'CIM Wordle',
        result,
        guesses: curRow,
        points,
        stats,
      });

      if (response.status === 201) {
        console.log('CIMLDE result submitted:', response.data);
      }
    } catch (error) {
      console.error('Error submitting CIMDLE result:', error);
    }
  }

  //wordle constants:
  const word = minigameWord || 'cmdle'; //word to guess
  const letters = word.split(''); //splits word into array of letters.

  const [rows, setRows] = useState(
    new Array(tries).fill(new Array(letters.length).fill('')),
  );

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing');

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  const checkGameState = () => {
    if (gameWon()) {
      submitGameResult('win', curRow);

      setTimeout(() => {
        Toast.show({
          type: 'gameWon',
          visibilityTime: 3000,
        });
        setTimeout(() => {
          navigation.navigate('AnnouncementPost', {
            announcementId: announcementId,
          });
          console.log('CIMDLE announcementId:', announcementId);
        }, 3000);
      }, 1000);
      setGameState('won');
    } else if (gameLost()) {
      submitGameResult('lose');

      setTimeout(() => {
        Toast.show({
          type: 'gameLost',
          visibilityTime: 3000,
        });
        setTimeout(() => {
          navigation.navigate('AnnouncementPost', {
            announcementId: announcementId,
          });
          console.log('CIMDLE announcementId:', announcementId);
        }, 3000);
      }, 1000);
      setGameState('lost');
    }
  };

  const gameWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter == letters[i]);
  };

  const gameLost = () => {
    return curRow == rows.length;
  };

  const onKeyPressed = key => {
    if (gameState != 'playing') {
      return;
    }

    const updatedRows = copyArray(rows);

    if (key == ENTER) {
      if (curCol == rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
      return;
    }

    if (key == CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = '';
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row == curRow && col == curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];
    if (row >= curRow) {
      return colors.black;
    }
    if (letter == letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };

  const getLetterColor = color => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) == color),
    );
  };
  const greenCaps = getLetterColor(colors.primary);
  const yellowCaps = getLetterColor(colors.secondary);
  const greyCaps = getLetterColor(colors.darkgrey);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}> CIMDLE </Text>
        <Text style={styles.gameDesc}> Guess the word for more surprises.</Text>

        <View style={styles.map}>
          {rows.map((row, i) => (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((letter, j) => (
                <View
                  key={`cell-${i}-${j}`}
                  style={[
                    styles.cell,
                    {
                      borderColor: isCellActive(i, j)
                        ? colors.lightgrey
                        : colors.darkgrey,
                      backgroundColor: getCellBGColor(i, j),
                    },
                  ]}>
                  <Text style={styles.text}>{letter.toUpperCase()} </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Keyboard
          onKeyPressed={onKeyPressed}
          greenCaps={greenCaps}
          yellowCaps={yellowCaps}
          greyCaps={greyCaps}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 7,
    marginTop: 10,
  },

  gameDesc: {
    color: colors.lightgrey,
    fontSize: 10,
    fontStyle: 'italic',
  },

  map: {
    alignSelf: 'stretch',
    marginVertical: 10,
  },

  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  cell: {
    borderWidth: 3,
    borderColor: colors.darkgrey,
    flex: 1,
    height: 70,
    width: 70,
    aspectRatio: 1,
    margin: 3,
    maxWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    color: colors.lightgrey,
    fontWeight: 'bold',
    fontSize: 25,
  },
});

export default CimdleScreen;

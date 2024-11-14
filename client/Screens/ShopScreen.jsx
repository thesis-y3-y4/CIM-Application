import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import NavigationBar from './components/NavigationBar';

// import styles from './styles';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';

const frames = {
  cub: [
    {
      id: 'cub_frame1',
      name: 'Cub Frame 1',
      cost: 100,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_1.png'),
    },
    {
      id: 'cub_frame2',
      name: 'Cub Frame 2',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_2.png'),
    },
    {
      id: 'cub_frame3',
      name: 'Cub Frame 3',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_3.png'),
    },
    {
      id: 'cub_frame4',
      name: 'Cub Frame 4',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_4.png'),
    },
    {
      id: 'cub_frame5',
      name: 'Cub Frame 5',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_5.png'),
    },
  ],
  juvenile: [
    {
      id: 'juvenile_frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_1.png'),
    },
    {
      id: 'juvenile_frame2',
      name: 'Juvenile Frame 2',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_2.png'),
    },
    {
      id: 'juvenile_frame3',
      name: 'Juvenile Frame 3',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_3.png'),
    },
    {
      id: 'juvenile_frame4',
      name: 'Juvenile Frame 4',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_4.png'),
    },
    {
      id: 'juvenile_frame5',
      name: 'Juvenile Frame 5',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_5.png'),
    },
  ],
  wildcat: [
    {
      id: 'wildcat_frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_1.png'),
    },
    {
      id: 'wildcat_frame2',
      name: 'Wildcat Frame 2',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_2.png'),
    },
    {
      id: 'wildcat_frame3',
      name: 'Wildcat Frame 3',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_3.png'),
    },
    {
      id: 'wildcat_frame4',
      name: 'Wildcat Frame 4',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_4.png'),
    },
    {
      id: 'wildcat_frame5',
      name: 'Wildcat Frame 5',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_5.png'),
    },
    {
      id: 'wildcat_frame6',
      name: 'Wildcat Frame 6',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_6.png'),
    },
  ],
};
function ShopScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [allFrames, setAllFrames] = useState([]);

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

    // Combine all frames into one array for the FlatList
    const combinedFrames = [
      ...frames.cub.map(frame => ({...frame, tier: 'Cub'})),
      ...frames.juvenile.map(frame => ({...frame, tier: 'Juvenile'})),
      ...frames.wildcat.map(frame => ({...frame, tier: 'Wildcat'})),
    ];
    setAllFrames(combinedFrames);
  }, []);

  const purchaseFrame = frameCost => {
    if (userData.clawMarks >= frameCost) {
      Alert.alert(
        'Purchase Successful!',
        `You have unlocked the frame for ${frameCost} Claw Marks.`,
      );
    } else {
      Alert.alert(
        'Insufficient Claw Marks',
        'You do not have enough claw marks to unlock this frame.',
      );
    }
  };

  const renderFrame = ({item}) => (
    <View style={styles.frameCard}>
      <Image source={item.image} style={styles.frameImage} />
      <Text style={styles.frameName}>{item.name}</Text>
      <Text style={styles.frameCost}>{item.cost} Claw Marks</Text>
      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => purchaseFrame(item.cost)}>
        <Text style={styles.purchaseButtonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Move NavigationBar outside the scrollable content */}
      <NavigationBar navigation={navigation} />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Shop</Text>
        <FlatList
          data={allFrames}
          keyExtractor={item => item.id}
          renderItem={renderFrame}
          numColumns={2}
          columnWrapperStyle={styles.frameRow}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'darkgreen',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 15,
    textAlign: 'center',
  },
  frameRow: {
    justifyContent: 'space-between',
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  frameCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  frameImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  frameName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  frameCost: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 5,
  },
  purchaseButton: {
    backgroundColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ShopScreen;

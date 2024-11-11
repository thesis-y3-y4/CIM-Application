import {Text, View, ScrollView, StyleSheet, Image, TouchableOpacity} from 'react-native';
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
      id: 'frame1',
      name: 'Cub Frame 1',
      cost: 100,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_1.png'),
    },
    {
      id: 'frame2',
      name: 'Cub Frame 2',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_2.png'),
    },
    {
      id: 'frame2',
      name: 'Cub Frame 2',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_3.png'),
    },
    {
      id: 'frame2',
      name: 'Cub Frame 2',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_4.png'),
    },
    {
      id: 'frame2',
      name: 'Cub Frame 2',
      cost: 200,
      image: require('../assets/tier_list/Cubframes/CUB_TIER_FRAME_5.png'),
    },
  ],
  juvenile: [
    {
      id: 'frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_1.png'),
    },
    {
      id: 'frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_2.png'),
    },
    {
      id: 'frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_3.png'),
    },
    {
      id: 'frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_4.png'),
    },
    {
      id: 'frame1',
      name: 'Juvenile Frame 1',
      cost: 500,
      image: require('../assets/tier_list/JuvenileFrames/JUVENILE_TIER_FRAMES_5.png'),
    },
  ],
  wildcat: [
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_1.png'),
    },
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_2.png'),
    },
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_3.png'),
    },
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_4.png'),
    },
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_5.png'),
    },
    {
      id: 'frame1',
      name: 'Wildcat Frame 1',
      cost: 2000,
      image: require('../assets/tier_list/WildcatTier/WILDCAT_TIER_FRAME_6.png'),
    },
  ],
};

function ShopScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [framesByTier, setFramesByTier] = useState(frames); // Using the defined frames above

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

  const purchaseFrame = frameCost => {
    if (userData.clawMarks >= frameCost) {
      // Deduct claw marks and unlock frame (you'll handle this in backend and UI state)
      Alert.alert(
        'Purchase Successful!',
        `You have unlocked the frame for ${frameCost} Claw Marks.`,
      );
      // Here you would add API call to update user data on the server
    } else {
      Alert.alert(
        'Insufficient Claw Marks',
        'You do not have enough claw marks to unlock this frame.',
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View>
        <NavigationBar navigation={navigation} />

        <View style={styles.container}>
          <Text style={styles.title}>Shop</Text>
          {Object.keys(framesByTier).map(tier => (
            <View key={tier} style={styles.tierContainer}>
              <Text style={styles.tierTitle}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Frames
              </Text>
              <View style={styles.frameRow}>
                {framesByTier[tier].map(frame => (
                  <View key={frame.id} style={styles.frameCard}>
                    <Image source={frame.image} style={styles.frameImage} />
                    <Text style={styles.frameName}>{frame.name}</Text>
                    <Text style={styles.frameCost}>
                      {frame.cost} Claw Marks
                    </Text>
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => purchaseFrame(frame.cost)}>
                      <Text style={styles.purchaseButtonText}>Unlock</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'darkgreen',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 15,
    textAlign: 'center',
  },
  tierContainer: {
    marginBottom: 20,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'lightgrey',
    marginBottom: 10,
  },
  frameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  frameCard: {
    width: '45%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
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

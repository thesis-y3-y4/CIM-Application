import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';

import styles from './styles';
import Toast from 'react-native-toast-message';
import NavigationBar from './components/NavigationBar';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';
import LargeMediaModal from './components/LargeMediaModal';
import AnnouncementCard from './components/AnnouncementCard';
import SeeMoreButton from './components/SeeMoreButton';
import Icon from 'react-native-vector-icons/FontAwesome5';

function HomeScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const [announceData, setAnnounceData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState([]);
  const [remainingAnnouncements, setRemainingAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [userReacted, setUserReacted] = useState({});
  const [userReactions, setUserReactions] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [dislikeCounts, setDislikeCounts] = useState({});

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const token = await getToken();
      const userDataResponse = await fetchData('/userdata', token);

      const announceDataResponse = await fetchData('/announcedata', token);
      const sortedAnnouncements = announceDataResponse.data.announcements.sort(
        (post1, post2) => new Date(post2.createdAt) - new Date(post1.createdAt),
      );
      setAnnounceData(sortedAnnouncements);
      setDisplayedAnnouncements(sortedAnnouncements.slice(0, 3));
      setRemainingAnnouncements(sortedAnnouncements.slice(3));

      const updatedLikeCounts = {};
      const updatedDislikeCounts = {};

      const updatedUserReacted = {};
      const response = await fetchData('/getreactsdata', token);
      const {data: fetchedUserReactions} = response;

      for (const announcement of sortedAnnouncements) {
        updatedLikeCounts[announcement._id] = announcement.likes || 0;
        updatedDislikeCounts[announcement._id] = announcement.dislikes || 0;

        const userReaction = fetchedUserReactions.events.find(
          reaction =>
            reaction.announcementId === announcement._id &&
            reaction.userId === userDataResponse.data.data._id,
        );
        if (userReaction) {
          updatedUserReacted[announcement._id] = userReaction.reaction;
        }
      }

      setLikeCounts(updatedLikeCounts);
      setDislikeCounts(updatedDislikeCounts);
      setUserReacted(updatedUserReacted);
    } catch (error) {
      console.error('Error fetching announcements or user reactions:', error);

      Toast.show({
        type: 'error',
        text1: 'Internet Connection Error',
        text2: 'Please check your internet connection and try again.',
        position: 'top',
        topOffset: 50,
        visibilityTime: 10000,
        onPress: () => Toast.hide(),
      });
    }
  };

  const handleMediaClick = imageUrl => {
    setSelectedMediaUrl(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const loadMoreAnnouncements = () => {
    const nextAnnouncements = remainingAnnouncements.slice(0, 5);
    const newDisplayedAnnouncements = [
      ...displayedAnnouncements,
      ...nextAnnouncements,
    ];
    setDisplayedAnnouncements(newDisplayedAnnouncements);
    setRemainingAnnouncements(remainingAnnouncements.slice(5));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Exit',
        onPress: () => BackHandler.exitApp(),
      },
    ]);
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, []),
  );

  const handleReaction = async (announcementId, reaction) => {
    try {
      const token = await getToken();
      const userDataResponse = await fetchData('/userdata', token);
      const userID = userDataResponse.data.data._id;

      const response = await fetchData('/reactsdata', token, 'POST', {
        announcementId,
        reaction,
        userId: userID,
      });

      const updatedAnnouncement = response.data.announcement;
      const updatedLikeCounts = {...likeCounts};
      const updatedDislikeCounts = {...dislikeCounts};

      updatedLikeCounts[announcementId] = updatedAnnouncement.likes || 0;
      updatedDislikeCounts[announcementId] = updatedAnnouncement.dislikes || 0;

      setLikeCounts(updatedLikeCounts);
      setDislikeCounts(updatedDislikeCounts);

      // Only update user reaction after successful backend update
      setUserReacted(prev => ({
        ...prev,
        [announcementId]: reaction,
      }));
    } catch (error) {
      console.error(
        'Error handling reaction:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({x: 0, y: 0, animated: true});
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <NavigationBar navigation={navigation} />

        <View style={styles.container}>
          {displayedAnnouncements.length === 0 ? (
            <View>
              <Text
                style={{
                  fontSize: 25,
                  color: 'grey',
                  padding: 20,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  marginTop: 100,
                }}>
                No announcements
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  color: 'grey',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                Please check your internet connection
              </Text>
            </View>
          ) : (
            <>
              {displayedAnnouncements.map((item, i) => (
                <AnnouncementCard
                  key={i}
                  item={item}
                  handleMediaClick={handleMediaClick}
                  handleReaction={handleReaction}
                  userReacted={userReacted}
                  likeCounts={likeCounts}
                  dislikeCounts={dislikeCounts}
                  screen="home"
                />
              ))}

              <SeeMoreButton
                onPress={loadMoreAnnouncements}
                remainingItems={remainingAnnouncements}
              />
            </>
          )}

          <LargeMediaModal
            visible={modalVisible}
            mediaUrl={selectedMediaUrl}
            onClose={closeModal}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1,
          backgroundColor: 'rgba(0, 128, 0, 0.6)',
          width: 50,
          height: 50,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={scrollToTop}>
        <Icon name="angle-double-up" color="white" size={25}></Icon>
      </TouchableOpacity>
    </>
  );
}

export default HomeScreen;

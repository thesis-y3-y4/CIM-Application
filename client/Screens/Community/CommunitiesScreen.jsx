import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
  ImageBackground,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import NavigationBar from '../components/NavigationBar';
import {getToken} from '../api/tokenStorage';
import {fetchData} from '../api/api';
import styles from '../styles';
import AnnouncementCard from '../components/AnnouncementCard';
import LargeMediaModal from '../components/LargeMediaModal';
import SeeMoreButton from '../components/SeeMoreButton';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CommunitiesScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('myCommunity');
  const [userReacted, setUserReacted] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [dislikeCounts, setDislikeCounts] = useState({});
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [remainingCommunityAnnouncements, setRemainingCommunityAnnouncements] =
    useState([]);
  const [displayedCommunityAnnouncements, setDisplayedCommunityAnnouncements] =
    useState([]);
  const [hasCommunity, setHasCommunity] = useState(true);

  async function getData() {
    const token = await getToken();
    try {
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);
      // Check if user has any community
      const userCommunities = response.data.data.communities;
      if (!userCommunities || userCommunities.length === 0) {
        setHasCommunity(false);
      } else {
        setHasCommunity(true);
      }
      console.log(hasCommunity);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async function fetchAnnouncements() {
    const token = await getToken();
    try {
      const announcementResponse = await fetchData(
        '/usercommunityposts',
        token,
      );
      const fetchedAnnouncements = announcementResponse.data.announcements;
      console.log(fetchedAnnouncements);

      const sortedAnnouncements = fetchedAnnouncements.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const communityResponse = await fetchData('/getcommunities', token);
      let communityData = communityResponse.data.communities;

      communityData = communityData.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      const updatedAnnouncements = sortedAnnouncements.map(announcement => {
        const community = communityData.find(
          c => c._id === announcement.communityId,
        );
        return {...announcement, communityName: community?.name || ''};
      });

      setAnnouncements(updatedAnnouncements);
      setDisplayedCommunityAnnouncements(updatedAnnouncements.slice(0, 3));
      setRemainingCommunityAnnouncements(updatedAnnouncements.slice(3));

      // Set the sorted communities
      setCommunities(communityData);
      setFilteredCommunities(communityData);

      const updatedLikeCounts = {};
      const updatedDislikeCounts = {};
      const updatedUserReacted = {};

      const reactionResponse = await fetchData('/getreactsdata', token);
      const {data: fetchedUserReactions} = reactionResponse;

      for (const announcement of sortedAnnouncements) {
        updatedLikeCounts[announcement._id] = announcement.likes || 0;
        updatedDislikeCounts[announcement._id] = announcement.dislikes || 0;

        const userReaction = fetchedUserReactions.events.find(
          reaction =>
            reaction.announcementId === announcement._id &&
            reaction.userId === userData._id,
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
    }
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchAnnouncements();
    }
  }, [userData]);

  const handleMediaClick = imageUrl => {
    setSelectedMediaUrl(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleReaction = async (announcementId, reaction) => {
    const token = await getToken();
    const updatedLikeCounts = {...likeCounts};
    const updatedDislikeCounts = {...dislikeCounts};
    const updatedUserReacted = {...userReacted};

    if (reaction === 'like') {
      if (updatedUserReacted[announcementId] === 'like') {
        updatedLikeCounts[announcementId]--;
        updatedUserReacted[announcementId] = null;
      } else {
        updatedLikeCounts[announcementId]++;
        if (updatedUserReacted[announcementId] === 'dislike') {
          updatedDislikeCounts[announcementId]--;
        }
        updatedUserReacted[announcementId] = 'like';
      }
    } else if (reaction === 'dislike') {
      if (updatedUserReacted[announcementId] === 'dislike') {
        updatedDislikeCounts[announcementId]--;
        updatedUserReacted[announcementId] = null;
      } else {
        updatedDislikeCounts[announcementId]++;
        if (updatedUserReacted[announcementId] === 'like') {
          updatedLikeCounts[announcementId]--;
        }
        updatedUserReacted[announcementId] = 'dislike';
      }
    }

    setLikeCounts(updatedLikeCounts);
    setDislikeCounts(updatedDislikeCounts);
    setUserReacted(updatedUserReacted);

    try {
      await fetchData('/reactsdata', token, 'POST', {
        announcementId,
        reaction,
        userId: userData._id,
      });
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const renderAnnouncementItem = ({item}) => (
    <AnnouncementCard
      key={item._id}
      item={item}
      handleMediaClick={handleMediaClick}
      handleReaction={handleReaction}
      userReacted={userReacted}
      likeCounts={likeCounts}
      dislikeCounts={dislikeCounts}
      screen="communities"
      communityName={item.communityName}
    />
  );

  const renderCommunityItem = ({item, index}) => (
    <TouchableOpacity
      style={[
        styles.communityCard,
        {
          backgroundColor: index % 2 === 0 ? '#f8ec2c' : '#40ac44',
        },
      ]}
      onPress={() =>
        navigation.navigate('CommunityDetails', {
          communityId: item._id,
          userData: userData,
        })
      }>
      <View style={styles.logoContainer}>
        <ImageBackground
          source={
            item.logo
              ? {uri: item.logo}
              : require('../../assets/default-logo.png')
          }
          style={styles.imageBackground}
          imageStyle={{resizeMode: 'cover'}}></ImageBackground>
      </View>
      <View>
        <Text
          style={styles.comName}
          numberOfLines={2} // Limits the text to one line
          ellipsizeMode="tail" // Adds ellipsis at the end if the text overflows
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleSearchChange = text => {
    setSearchText(text);
    if (text === '') {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(community =>
        community.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredCommunities(filtered);
    }
  };

  const handleTabChange = tab => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const loadMoreCommunityAnnouncements = () => {
    const nextAnnouncements = remainingCommunityAnnouncements.slice(0, 5);
    const newDisplayedAnnouncements = [
      ...displayedCommunityAnnouncements,
      ...nextAnnouncements,
    ];
    setDisplayedCommunityAnnouncements(newDisplayedAnnouncements);
    setRemainingCommunityAnnouncements(
      remainingCommunityAnnouncements.slice(5),
    );
  };

  const hasMoreAnnouncements = remainingCommunityAnnouncements.length > 0;

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 0}}>
        <NavigationBar navigation={navigation} />
      </View>
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: '#fff',
            borderBottomWidth: 2,
            borderBottomColor: 'darkgreen',
          }}>
          <TouchableOpacity
            onPress={() => handleTabChange('myCommunity')}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeTab === 'myCommunity' ? '#306434' : '#fff',
              },
            ]}>
            <Text
              style={[
                styles.navigationText,
                {
                  color: activeTab === 'myCommunity' ? '#fff' : 'grey',
                },
              ]}>
              My Community
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabChange('allCommunities')}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeTab === 'allCommunities' ? '#306434' : '#fff',
              },
            ]}>
            <Text
              style={[
                styles.navigationText,
                {
                  color: activeTab === 'allCommunities' ? '#fff' : 'grey',
                },
              ]}>
              All Communities
            </Text>
          </TouchableOpacity>
        </View>

        {hasCommunity ? (
          activeTab === 'myCommunity' ? (
            <FlatList
              data={displayedCommunityAnnouncements}
              renderItem={renderAnnouncementItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.scrollViewContent}
              ListHeaderComponent={
                <Text
                  style={{
                    color: 'darkgreen',
                    fontSize: 18,
                    padding: 10,
                    paddingTop: 15,
                    paddingLeft: 20,
                    paddingBottom: 10,
                  }}>
                  Recent Posts
                </Text>
              }
              ListFooterComponent={
                hasMoreAnnouncements && (
                  <SeeMoreButton
                    onPress={loadMoreCommunityAnnouncements}
                    remainingItems={remainingCommunityAnnouncements.length}
                  />
                )
              }
            />
          ) : (
            <View style={{backgroundColor: '#306434', flex: 1}}>
              <TextInput
                style={styles.communitySearchBar}
                placeholder="Search Community..."
                placeholderTextColor="grey"
                onChangeText={handleSearchChange}
                value={searchText}
              />
              <FlatList
                data={filteredCommunities}
                renderItem={renderCommunityItem}
                keyExtractor={item => item._id}
                numColumns={3}
                columnWrapperStyle={{justifyContent: 'space-between'}}
                contentContainerStyle={styles.scrollViewContent}
              />
            </View>
          )
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{color: 'darkgreen', fontSize: 18, fontWeight: 'bold'}}>
              You are not part of any community
            </Text>
          </View>
        )}
      </View>
      <LargeMediaModal
        visible={modalVisible}
        mediaUrl={selectedMediaUrl}
        onClose={closeModal}
      />
    </View>
  );
}

export default CommunitiesScreen;

import React, {useEffect, useState} from 'react';
import {Text, View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import axios from 'axios';
import {getToken} from '../api/tokenStorage';
import {fetchData} from '../api/api';
import AnnouncementCard from '../components/AnnouncementCard';
import LargeMediaModal from '../components/LargeMediaModal';
import NavigationBar from '../components/NavigationBar';
import SeeMoreButton from '../components/SeeMoreButton';
import ForumPostCard from '../components/ForumPostCard';
import {Avatar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Foundation';
import styles from '../styles';

function CommunityDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {communityId, userData} = route.params;

  const [activeTab, setActiveTab] = useState('allPost');
  const [community, setCommunity] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);

  const [isMember, setIsMember] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [dislikeCounts, setDislikeCounts] = useState({});
  const [userReacted, setUserReacted] = useState({});

  useEffect(() => {
    async function fetchCommunityDetails() {
      const token = await getToken();
      try {
        const communityResponse = await fetchData(
          `/getcommunity/${communityId}`,
          token,
        );
        setCommunity(communityResponse.data.community);

        const postsResponse = await fetchData(
          `/communityposts/${communityId}`,
          token,
        );
        const fetchedPosts = postsResponse.data.posts;
        setCommunityPosts(fetchedPosts);

        const reactionResponse = await fetchData('/getreactsdata', token);
        const {data: fetchedUserReactions} = reactionResponse;

        updateAnnouncementReactionStates(
          fetchedPosts,
          fetchedUserReactions?.events,
        );
      } catch (error) {
        console.error('Error fetching community details or posts:', error);
      }
    }

    async function fetchForumPosts() {
      const token = await getToken();
      try {
        const forumPostsResponse = await fetchData(
          `/communityforumposts/${communityId}`,
          token,
          'GET',
        );
        setForumPosts(forumPostsResponse.data.forumPosts);

        const reactionResponse = await fetchData(
          `/getforumreactsdata/${communityId}`,
          token,
          'GET',
        );
        const fetchedUserReactions = reactionResponse.data.reactions;

        updateForumReactionStates(
          forumPostsResponse.data.forumPosts,
          fetchedUserReactions,
        );
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      }
    }

    async function checkMembershipStatus() {
      const token = await getToken();
      try {
        const response = await fetchData(
          `/ismembercommunity/${communityId}/${userData._id}`,
          token,
          'GET',
        );
        setIsMember(response.data.isMember);
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }

    checkMembershipStatus();

    if (activeTab === 'forum') {
      fetchForumPosts();
    } else {
      fetchCommunityDetails();
    }
  }, [communityId, activeTab]);

  const updateAnnouncementReactionStates = (posts, userReactions) => {
    const updatedLikeCounts = {};
    const updatedDislikeCounts = {};
    const updatedUserReacted = {};

    posts.forEach(post => {
      updatedLikeCounts[post._id] = post.likes || 0;
      updatedDislikeCounts[post._id] = post.dislikes || 0;

      const userReaction = userReactions?.find(
        reaction =>
          reaction.announcementId === post._id &&
          reaction.userId === userData._id,
      );

      updatedUserReacted[post._id] = userReaction
        ? userReaction.reaction
        : null;
    });

    setLikeCounts(updatedLikeCounts);
    setDislikeCounts(updatedDislikeCounts);
    setUserReacted(updatedUserReacted);
  };

  const updateForumReactionStates = (posts, userReactions) => {
    const updatedLikeCounts = {};
    const updatedDislikeCounts = {};
    const updatedUserReacted = {};

    posts.forEach(post => {
      updatedLikeCounts[post._id] = post.likes || 0;
      updatedDislikeCounts[post._id] = post.dislikes || 0;

      const userReaction = userReactions?.find(
        reaction =>
          reaction.forumPostId === post._id && reaction.userId === userData._id,
      );
      updatedUserReacted[post._id] = userReaction
        ? userReaction.reaction
        : null;
    });

    setLikeCounts(updatedLikeCounts);
    setDislikeCounts(updatedDislikeCounts);
    setUserReacted(updatedUserReacted);
  };

  const handlePostReaction = async (postId, reaction) => {
    const token = await getToken();
    const updatedLikeCounts = {...likeCounts};
    const updatedDislikeCounts = {...dislikeCounts};
    const updatedUserReacted = {...userReacted};

    if (reaction === 'like') {
      if (updatedUserReacted[postId] === 'like') {
        updatedLikeCounts[postId]--;
        updatedUserReacted[postId] = null; // Reset user reaction
      } else {
        updatedLikeCounts[postId]++;
        if (updatedUserReacted[postId] === 'dislike') {
          updatedDislikeCounts[postId]--; // Remove dislike if it exists
        }
        updatedUserReacted[postId] = 'like'; // Set user reaction to like
      }
    } else if (reaction === 'dislike') {
      if (updatedUserReacted[postId] === 'dislike') {
        updatedDislikeCounts[postId]--;
        updatedUserReacted[postId] = null; // Reset user reaction
      } else {
        updatedDislikeCounts[postId]++;
        if (updatedUserReacted[postId] === 'like') {
          updatedLikeCounts[postId]--; // Remove like if it exists
        }
        updatedUserReacted[postId] = 'dislike'; // Set user reaction to dislike
      }
    }

    setLikeCounts(updatedLikeCounts);
    setDislikeCounts(updatedDislikeCounts);
    setUserReacted(updatedUserReacted);

    try {
      const reactionData = {
        announcementId: postId,
        reaction,
        userId: userData._id,
      };

      await fetchData('/reactsdata', token, 'POST', reactionData);
    } catch (error) {
      console.error('Error handling post reaction:', error);
    }
  };

  const handleForumReaction = async (forumPostId, reaction) => {
    const token = await getToken();
    const updatedLikeCounts = {...likeCounts};
    const updatedDislikeCounts = {...dislikeCounts};
    const updatedUserReacted = {...userReacted};

    // Adjust reaction logic
    if (reaction === 'like') {
      if (updatedUserReacted[forumPostId] === 'like') {
        updatedLikeCounts[forumPostId]--;
        updatedUserReacted[forumPostId] = null;
      } else {
        updatedLikeCounts[forumPostId]++;
        if (updatedUserReacted[forumPostId] === 'dislike') {
          updatedDislikeCounts[forumPostId]--;
        }
        updatedUserReacted[forumPostId] = 'like';
      }
    } else if (reaction === 'dislike') {
      if (updatedUserReacted[forumPostId] === 'dislike') {
        updatedDislikeCounts[forumPostId]--;
        updatedUserReacted[forumPostId] = null;
      } else {
        updatedDislikeCounts[forumPostId]++;
        if (updatedUserReacted[forumPostId] === 'like') {
          updatedLikeCounts[forumPostId]--;
        }
        updatedUserReacted[forumPostId] = 'dislike';
      }
    }

    setLikeCounts(updatedLikeCounts);
    setDislikeCounts(updatedDislikeCounts);
    setUserReacted(updatedUserReacted);

    // Send reaction data to backend
    try {
      const reactionData = {
        forumPostId,
        reaction,
        userId: userData._id,
      };
      await fetchData('/forumreactsdata', token, 'POST', reactionData);
    } catch (error) {
      console.error('Error handling forum reaction:', error);
    }
  };

  const handleMediaClick = imageUrl => {
    setSelectedMediaUrl(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderPostItem = ({item}) => (
    <AnnouncementCard
      key={item._id}
      item={item}
      handleMediaClick={handleMediaClick}
      handleReaction={handlePostReaction}
      userReacted={userReacted}
      likeCounts={likeCounts}
      dislikeCounts={dislikeCounts}
      screen="communityDetails"
    />
  );

  const renderForumItem = ({item}) => (
    <ForumPostCard
      key={item._id}
      post={item}
      userReacted={userReacted}
      likeCounts={likeCounts}
      dislikeCounts={dislikeCounts}
      handleMediaClick={handleMediaClick}
      handleReaction={handleForumReaction}
    />
  );

  const refreshForumPosts = async () => {
    const token = await getToken();
    try {
      const forumPostsResponse = await fetchData(
        `/communityforumposts/${communityId}`,
        token,
        'GET',
      );
      setForumPosts(forumPostsResponse.data.forumPosts);
    } catch (error) {
      console.error('Error refreshing forum posts:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      <NavigationBar navigation={navigation} />

      <View style={{backgroundColor: 'white', flex: 1}}>
        {community ? (
          <>
            <View style={styles.containerCommunityName}>
              <Avatar.Image
                size={50}
                style={styles.avatar}
                source={{
                  uri: community.profilePicture
                    ? community.profilePicture
                    : 'https://www.kindpng.com/picc/m/75-753798_community-examples-icon-green-community-icon-hd-png.png',
                }}
              />
              <Text style={styles.communityName}>{community.name}</Text>
            </View>

            <View style={styles.communityProfile}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'allPost' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('allPost')}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'allPost' && {color: 'white'},
                    ]}>
                    All Post
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'forum' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('forum')}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'forum' && {color: 'white'},
                    ]}>
                    Forum
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{flex: 1}}>
                {activeTab === 'allPost' ? (
                  <FlatList
                    data={communityPosts}
                    renderItem={renderPostItem}
                    keyExtractor={item => item._id}
                  />
                ) : (
                  <>
                    <FlatList
                      data={forumPosts}
                      renderItem={renderForumItem}
                      keyExtractor={item => item._id}
                    />
                    {isMember && activeTab === 'forum' && (
                      <TouchableOpacity
                        onPress={() => {
                          console.log(
                            'Navigating to CreatePost with communityId:',
                            community._id,
                          );
                          navigation.navigate('CreatePost', {
                            communityId: community._id,
                            refreshForumPosts: refreshForumPosts,
                          });
                        }}
                        style={styles.createPostButton}>
                        <Icon name="plus" size={25} color={'white'} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </>
        ) : (
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              marginTop: 20,
            }}>
            Loading...
          </Text>
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

export default CommunityDetailsScreen;

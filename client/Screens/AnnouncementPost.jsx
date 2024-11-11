import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';
import NavigationBar from './components/CompactNavigationBar';
import TimeDisplay from './components/TimeDisplay';
import VideoControls from './components/VideoControls';
import LargeMediaModal from './components/LargeMediaModal';

const AnnouncementPost = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {announcementId} = route.params;

  const [announcementData, setAnnouncementData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [seeMore, setSeeMore] = useState(false);
  const [mediaStyle, setMediaStyle] = useState(styles.mediaImageLandscape);
  const [isCommentsVisible, setCommentsVisible] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const token = await getToken();
      try {
        const response = await fetchData(
          `/announcedata/${announcementId}`,
          token,
        );
        setAnnouncementData(response.data);
        setUserReaction(response.data.userReaction);

        if (
          response.data.announcement.mediaUrl &&
          ['image/jpeg', 'image/png', 'image/gif'].includes(
            response.data.announcement.contentType,
          )
        ) {
          Image.getSize(
            response.data.announcement.mediaUrl,
            (width, height) => {
              setMediaStyle(
                width > height
                  ? styles.mediaImageLandscape
                  : styles.mediaImagePortrait,
              );
            },
          );
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    const fetchComments = async () => {
      const token = await getToken();
      try {
        const response = await fetchData(
          `/fetchcomments/${announcementId}/announcement`,
          token,
          'GET',
        );
        const sortedComments = response.data.comments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
        setComments(sortedComments);
        // console.log('Comments:', response.data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    const fetchUserReaction = async () => {
      const token = await getToken();
      try {
        const response = await fetchData('/getreactsdata', token);
        const userDataResponse = await fetchData('/userdata', token);
        const userId = userDataResponse.data.data._id;

        const userReactionEvent = response.data.events.find(
          reaction =>
            reaction.announcementId === announcementId &&
            reaction.userId === userId,
        );

        setUserReaction(userReactionEvent ? userReactionEvent.reaction : null);
      } catch (error) {
        console.error('Error fetching user reaction:', error);
      }
    };

    fetchAnnouncement();
    fetchUserReaction();
    fetchComments();
  }, [announcementId]);

  const handleReaction = async type => {
    const token = await getToken();
    const userDataResponse = await fetchData('/userdata', token);
    const userId = userDataResponse.data.data._id;

    try {
      const response = await fetchData('/reactsdata', token, 'POST', {
        announcementId,
        reaction: type,
        userId: userId,
      });

      const updatedAnnouncement = response.data.announcement;

      setAnnouncementData(prev => ({
        ...prev,
        announcement: {
          ...prev.announcement,
          likes: updatedAnnouncement.likes || 0,
          dislikes: updatedAnnouncement.dislikes || 0,
        },
      }));

      setUserReaction(prevReaction => (prevReaction === type ? null : type));
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const renderMediaElement = () => {
    if (
      announcementData?.announcement?.mediaUrl &&
      ['image/jpeg', 'image/png', 'image/gif'].includes(
        announcementData.announcement.contentType,
      )
    ) {
      return (
        <TouchableOpacity
          onPress={() =>
            handleMediaClick(announcementData.announcement.mediaUrl)
          }>
          <Image
            source={{uri: announcementData.announcement.mediaUrl}}
            style={mediaStyle}
          />
        </TouchableOpacity>
      );
    } else if (
      announcementData?.announcement?.mediaUrl &&
      ['video/mp4', 'audio/mpeg'].includes(
        announcementData.announcement.contentType,
      )
    ) {
      return (
        <VideoControls mediaUrl={announcementData.announcement.mediaUrl} />
      );
    }
    return null;
  };

  const handleMediaClick = imageUrl => {
    setSelectedMediaUrl(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const addComment = async () => {
    const token = await getToken();
    if (newComment.trim()) {
      try {
        const response = await fetchData('/addcomment', token, 'POST', {
          postId: announcementId,
          postType: 'announcement',
          text: newComment,
        });
        setComments(prevComments => [...prevComments, response.data.comment]);
        setNewComment('');
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const announcement = announcementData ? announcementData.announcement : null;

  const handleBackPress = () => {
    navigation.navigate('MainHome');
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <NavigationBar backAction={() => navigation.navigate('MainHome')} />
      <ScrollView
        contentContainerStyle={(styles.scrollViewContent, {paddingBottom: 80})}
        keyboardShouldPersistTaps="handled">
        <View style={styles.postContainer}>
          {announcement ? (
            <>
              <View style={styles.userInfoContainer}>
                <Image
                  source={{
                    uri: 'https://www.iconpacks.net/icons/2/free-user-icon-3297-thumb.png',
                  }}
                  style={styles.userAvatar}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.userName}>
                    {announcement.postedBy || 'Anonymous'}
                  </Text>
                  <TimeDisplay time={announcement.createdAt} />
                </View>
              </View>
              <View style={styles.postBodyContainer}>
                <Text style={styles.postHeader}>{announcement.header}</Text>
                <Text style={styles.postBody}>
                  {seeMore
                    ? announcement.body
                    : `${announcement.body.slice(0, 150)}...`}
                  {announcement.body.length > 150 && (
                    <Text
                      style={styles.seeMoreText}
                      onPress={() => setSeeMore(!seeMore)}>
                      {seeMore ? 'See Less' : 'See More'}
                    </Text>
                  )}
                </Text>
                {renderMediaElement()}
              </View>
              <View style={styles.reactionContainer}>
                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReaction('like')}>
                  <Icon
                    name="like1"
                    size={24}
                    color={userReaction === 'like' ? 'green' : 'gray'} // Change color based on reaction
                  />
                  <Text style={styles.reactionCountText}>
                    {announcementData?.announcement?.likes || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReaction('dislike')}>
                  <Icon
                    name="dislike1"
                    size={24}
                    color={userReaction === 'dislike' ? 'green' : 'gray'}
                  />
                  <Text style={styles.reactionCountText}>
                    {announcementData?.announcement?.dislikes || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  ...styles.postHeader,
                  marginTop: 20,
                  marginBottom: 10,
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: 'black',
                }}>
                Comments
              </Text>
              {comments.map(comment => (
                <View key={comment._id} style={styles.commentItem}>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text>Loading...</Text>
          )}

          <LargeMediaModal
            visible={modalVisible}
            mediaUrl={selectedMediaUrl}
            onClose={closeModal}
          />
        </View>
      </ScrollView>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="gray"
          value={newComment}
          onChangeText={setNewComment}
          onSubmitEditing={addComment}
        />
        <TouchableOpacity onPress={addComment}>
          <Icon name="doubleright" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollViewContent: {flexGrow: 1},
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  textContainer: {flex: 1},
  userName: {fontSize: 16, fontWeight: 'bold', color: 'black'},
  postBodyContainer: {paddingHorizontal: 10},
  postHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'darkgreen',
  },
  postBody: {fontSize: 16, color: '#333'},
  mediaImageLandscape: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 10,
  },
  mediaImagePortrait: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 10,
  },
  seeMoreText: {color: 'black', fontWeight: 'bold'},
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,

    borderColor: '#ddd',
  },
  reactionButton: {flexDirection: 'row', alignItems: 'center'},
  reactionCountText: {marginLeft: 5, color: 'black'},
  commentItem: {paddingVertical: 10, borderTopWidth: 1, borderColor: '#ddd'},
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    color: 'black',
  },
  sendButton: {padding: 5},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default AnnouncementPost;

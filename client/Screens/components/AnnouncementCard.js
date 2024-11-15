import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import VideoControls from './VideoControls';
import styles from '../styles';
import {getToken} from '../api/tokenStorage';
import {fetchData} from '../api/api';
import {useNavigation} from '@react-navigation/native';
import TimeDisplay from './TimeDisplay';

const AnnouncementCard = ({
  item,
  handleMediaClick,
  handleReaction,
  userReacted,
  likeCounts,
  dislikeCounts,
  screen,
  communityName,
}) => {
  const navigation = useNavigation();
  const [mediaStyle, setMediaStyle] = useState(styles.mediaImageLandscape);
  const [seeMore, setSeeMore] = useState(false);
  const [isCommentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [hasPlayedGame, setHasPlayedGame] = useState(false);
  const [refreshCheck, setRefreshCheck] = useState(false);

  useEffect(() => {
    checkIfUserPlayed();
    if (
      item.mediaUrl &&
      (item.contentType === 'image/jpeg' ||
        item.contentType === 'image/png' ||
        item.contentType === 'image/gif')
    ) {
      Image.getSize(item.mediaUrl, (width, height) => {
        setMediaStyle(
          width > height
            ? styles.mediaImageLandscape
            : styles.mediaImagePortrait,
        );
      });
    }
  }, [item._id, refreshCheck]);

  const checkIfUserPlayed = async () => {
    const token = await getToken();
    try {
      const response = await fetchData(
        `/hasPlayedGame/${item._id}`,
        token,
        'GET',
      );
      setHasPlayedGame(response.data.hasPlayed);
    } catch (error) {
      console.error('Error checking game status:', error);
    }
  };

  const handleGameStart = () => {
    if (item.minigame === 'CIM Wordle') {
      // Navigate to 'Cimdle'
      navigation.navigate('Cimdle', {announcementId: item._id});
    } else if (item.minigame === 'Flappy CIM') {
      // Navigate to 'FlappyCim'
      navigation.navigate('FlappyCim', {announcementId: item._id});
    }

    setRefreshCheck(prev => !prev);
  };

  let mediaElement = null;
  const showStartButton = item.minigame && !hasPlayedGame && !item.gameOver;

  if (
    item.mediaUrl &&
    ['image/jpeg', 'image/png', 'image/gif'].includes(item.contentType)
  ) {
    mediaElement = (
      <View>
        <TouchableOpacity onPress={() => handleMediaClick(item.mediaUrl)}>
          <Image source={{uri: item.mediaUrl}} style={mediaStyle} />
        </TouchableOpacity>
        {showStartButton && (
          <View style={styles.overlayContainer}>
            <View style={styles.overlay} />
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleGameStart()}>
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  } else if (
    item.mediaUrl &&
    ['video/mp4', 'audio/mpeg'].includes(item.contentType)
  ) {
    mediaElement = <VideoControls mediaUrl={item.mediaUrl} />;
  }

  const renderDetails = () => {
    const maxLength = 150;
    if (item.body.length > maxLength) {
      return (
        <Text style={styles.details}>
          {seeMore ? item.body : `${item.body.substring(0, maxLength)}...`}{' '}
          <Text style={styles.seeMoreText} onPress={() => setSeeMore(!seeMore)}>
            {seeMore ? 'See Less' : 'See More'}
          </Text>
        </Text>
      );
    }
    return <Text style={styles.details}>{item.body}</Text>;
  };

  const fetchComments = async () => {
    const token = await getToken();
    try {
      const response = await fetchData(
        `/fetchcomments/${item._id}/announcement`,
        token,
        'GET',
      );
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async () => {
    const token = await getToken();
    if (newComment.trim()) {
      try {
        const response = await fetchData('/addcomment', token, 'POST', {
          postId: item._id,
          postType: 'announcement',
          text: newComment,
        });
        setComments([...comments, response.data.comment]);
        setNewComment('');
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const renderComments = () => (
    <Modal visible={isCommentsVisible} transparent={true} animationType="slide">
      <TouchableOpacity
        onPress={() => setCommentsVisible(false)}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <View style={styles.modalContent}>
            <FlatList
              data={comments}
              keyExtractor={comment => comment._id}
              renderItem={({item}) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
            />
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="gray"
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={addComment}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={addComment}>
                <Icon name="doubleright" size={30} color="green" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setCommentsVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.card}>
      {/* User and Media Section */}
      <Image
        source={{uri: 'https://cscqcph.com/images/cscqcph.png'}}
        style={styles.image}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.name}>
          {item.postedBy}{' '}
          {screen === 'communities' && <Text>- {communityName}</Text>}
        </Text>
        <TimeDisplay time={item.createdAt} />
        <Text style={styles.title}>{item.header}</Text>
      </View>

      {renderDetails()}
      {mediaElement}

      {/* Reactions Section */}
      <View style={styles.reactionContainer}>
        <View style={styles.reactionButtonGroup}>
          <TouchableOpacity
            onPress={() => handleReaction(item._id, 'like')}
            disabled={userReacted[item._id] === 'like'}
            style={styles.reactionButton}>
            <Icon
              name={userReacted[item._id] === 'like' ? 'like1' : 'like2'}
              size={24}
              color={userReacted[item._id] === 'like' ? 'green' : 'black'}
            />
            <Text style={styles.reactionCountText}>
              {likeCounts[item._id] || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleReaction(item._id, 'dislike')}
            disabled={userReacted[item._id] === 'dislike'}
            style={styles.reactionButton}>
            <Icon
              name={
                userReacted[item._id] === 'dislike' ? 'dislike1' : 'dislike2'
              }
              size={24}
              color={userReacted[item._id] === 'dislike' ? 'green' : 'black'}
            />
            {/* If dislikeCounts is undefined/null, default to 0 */}
            <Text style={styles.reactionCountText}>
              {dislikeCounts[item._id] || 0}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            onPress={() => {
              fetchComments();
              setCommentsVisible(true);
            }}
            style={styles.commentButton}>
            <Icon name="message1" size={24} color="black" />
            <Text style={styles.commentText}>Comments</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderComments()}
    </View>
  );
};

export default AnnouncementCard;

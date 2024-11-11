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
import styles from '../styles';
import TimeDisplay from './TimeDisplay';
import {getToken} from '../api/tokenStorage';
import {fetchData} from '../api/api';
import Toast from 'react-native-toast-message';

function extractFormattedNumbers(input) {
  const digits = input.match(/\d/g) || [];

  let output = '';
  for (let i = 0; i < digits.length; i += 2) {
    output += digits[i];
  }
  return output;
}

const ForumPostCard = ({
  post,
  userReacted,
  likeCounts,
  dislikeCounts,
  handleReaction,
  handleMediaClick,
}) => {
  const [mediaStyle, setMediaStyle] = useState(styles.mediaImageLandscape);
  const [seeMore, setSeeMore] = useState(false);
  const [isCommentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [friendStatus, setFriendStatus] = useState({
    areFriends: false,
    isPending: false,
  });

  useEffect(() => {
    const getData = async () => {
      const token = await getToken();
      try {
        const response = await fetchData('/userdata', token);
        setUserId(response.data.data._id);

        // Fetch friend status after getting the userId
        fetchFriendStatus(response.data.data._id, post.postedBy);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    getData();

    if (post.mediaURL) {
      Image.getSize(
        post.mediaURL,
        (width, height) => {
          const style =
            width > height
              ? styles.mediaImageLandscape
              : styles.mediaImagePortrait;
          setMediaStyle(style);
        },
        error => {
          console.error('Error getting image size:', error);
        },
      );
    }
  }, [post.mediaURL]);

  const mediaElement = post.mediaURL && (
    <TouchableOpacity onPress={() => handleMediaClick(post.mediaURL)}>
      <Image source={{uri: post.mediaURL}} style={mediaStyle} />
    </TouchableOpacity>
  );

  const fetchComments = async () => {
    const token = await getToken();
    try {
      const response = await fetchData(
        `/fetchcomments/${post._id}/forumPost`,
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
          postId: post._id,
          postType: 'forumPost',
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
          </View>
          <TouchableOpacity onPress={() => setCommentsVisible(false)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const formattedNumbers = extractFormattedNumbers(post.postedBy);

  const handleAddFriend = async recipientId => {
    const token = await getToken();
    try {
      const response = await fetchData('/sendfriendrequest', token, 'POST', {
        recipientId,
        requesterId: userId,
      });
      if (response) {
        Toast.show({
          text1: 'Success',
          text2: 'Friend request sent successfully!',
          type: 'success',
        });
        fetchFriendStatus(userId, recipientId);
      }
      console.log(response.data.message);
    } catch (error) {
      console.error('Error adding friend:', error);
      Toast.show({
        text1: 'Error',
        text2: 'Failed to send friend request.',
        type: 'error',
      });
    }
  };

  const fetchFriendStatus = async (userId, friendId) => {
    const token = await getToken();
    try {
      const response = await fetchData(
        `/friendstatus/${userId}/${friendId}`,
        token,
        'GET',
      );
      console.log(response.data);
      setFriendStatus(response.data);
    } catch (error) {
      console.error('Error fetching friend status:', error);
    }
  };

  return (
    <View style={styles.postForumContainer}>
      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Image
          source={{
            uri: 'https://www.iconpacks.net/icons/2/free-user-icon-3297-thumb.png',
          }}
          style={styles.userAvatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.userNameForum}>Wildcat #{formattedNumbers}</Text>
          <TimeDisplay time={post.datePosted} />
        </View>

        {/* Friend Button */}
        {userId !== post.postedBy &&
          !friendStatus.areFriends &&
          !friendStatus.isPending && (
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={() => handleAddFriend(post.postedBy)}>
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        {friendStatus.areFriends && (
          <Text style={styles.friendStatusText}>Already Friends</Text>
        )}
        {friendStatus.isPending && (
          <Text style={styles.friendStatusText}>Pending</Text>
        )}
      </View>

      {/* Post Body */}
      <View style={styles.postBodyContainer}>
        {post.body.length > 150 ? (
          <Text style={styles.postBody}>
            {seeMore ? post.body : `${post.body.substring(0, 150)}...`}{' '}
            <Text
              style={styles.seeMoreText}
              onPress={() => setSeeMore(!seeMore)}>
              {seeMore ? 'See Less' : 'See More'}
            </Text>
          </Text>
        ) : (
          <View>
            <Text style={styles.postHeader}>{post.header}</Text>
            <Text style={styles.postBody}>{post.body}</Text>

            {/* Media */}
            {mediaElement}
          </View>
        )}
      </View>

      {/* Reactions and Comments */}
      <View style={styles.reactionContainer}>
        <View style={styles.reactionButtonGroup}>
          {/* Like Button */}
          <TouchableOpacity
            onPress={() => handleReaction(post._id, 'like')}
            disabled={userReacted[post._id] === 'like'}
            style={styles.reactionButton}>
            <Icon
              name={userReacted[post._id] === 'like' ? 'like1' : 'like2'}
              size={24}
              color={userReacted[post._id] === 'like' ? 'green' : 'black'}
            />
            <Text style={styles.reactionCountText}>
              {likeCounts[post._id] || 0}
            </Text>
          </TouchableOpacity>

          {/* Dislike Button */}
          <TouchableOpacity
            onPress={() => handleReaction(post._id, 'dislike')}
            disabled={userReacted[post._id] === 'dislike'}
            style={styles.reactionButton}>
            <Icon
              name={
                userReacted[post._id] === 'dislike' ? 'dislike1' : 'dislike2'
              }
              size={24}
              color={userReacted[post._id] === 'dislike' ? 'green' : 'black'}
            />
            <Text style={styles.reactionCountText}>
              {dislikeCounts[post._id] || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={() => {
            fetchComments();
            setCommentsVisible(true);
          }}
          style={styles.commentButtonForum}>
          <Icon name="message1" size={24} color="black" />
          <Text style={styles.commentText}>Comments</Text>
        </TouchableOpacity>
      </View>

      {renderComments()}
    </View>
  );
};

export default ForumPostCard;

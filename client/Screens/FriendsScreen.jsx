import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import NavigationBar from './components/NavigationBar';
import styles from './styles';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';

function FriendsScreen(props) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input

  async function getData() {
    const token = await getToken();
    try {
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);

      if (response.data.data._id) {
        const requestsResponse = await fetchData(
          `/friendrequests/recipient/${response.data.data._id}`,
          token,
          'GET',
        );
        setFriendRequests(requestsResponse.data);
      }

      const friendsResponse = await fetchData(
        `/friendslist/${response.data.data._id}`,
        token,
        'GET',
      );
      setFriendList(friendsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getData();
    }, []),
  );

  const handleFriendRequest = async (requestId, action) => {
    const token = await getToken();
    try {
      const response = await fetchData('/respondfriendrequest', token, 'POST', {
        requestId,
        action,
      });

      if (response.status === 200) {
        console.log(`Friend request ${action}ed successfully:`, response.data);

        // Remove the request from friendRequests list
        setFriendRequests(prevRequests =>
          prevRequests.filter(request => request._id !== requestId),
        );

        // Refresh friend list after accepting the request
        if (action === 'accept') {
          await getData(); // Re-fetch data to ensure the friend list is up to date
        }
      }
    } catch (error) {
      console.error(
        `Error ${action}ing friend request of ID ${requestId}:`,
        error,
      );
    }
  };

  const formatId = id => {
    const digits = id.match(/\d/g) || [];
    return digits.filter((_, index) => index % 2 === 0).join('');
  };

  // Filter friends based on search query
  const filteredFriends = friendList.filter(friend => {
    const nameMatch = friend?.friend?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const idMatch = formatId(friend?.friend?._id || '').includes(searchQuery);
    return nameMatch || idMatch;
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}>
      <View>
        <NavigationBar navigation={navigation} />
        <View style={{backgroundColor: '#f4fcf4', height: '100%'}}>
          <Text style={styles.friendsHeaderText}>Friends</Text>
          <TextInput
            style={styles.searchFriendsInput}
            placeholder="Search for friends"
            placeholderTextColor="gray"
            onChangeText={text => setSearchQuery(text)}
          />

          <View
            style={{
              borderBottomWidth: 4,
              borderBottomColor: 'green',
              marginBottom: 20,
            }}
          />

          {friendRequests.length > 0 && (
            <Text style={styles.friendsSubHeaderText}>Friends Requests</Text>
          )}
          {friendRequests.map((friReq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.friendCardButton}
              onPress={() =>
                navigation.navigate('ProfileFriend', {
                  friendId: friReq.requester._id,
                })
              }>
              <Image
                source={{
                  uri:
                    friReq.requester.profilePicture ||
                    'https://cdn.vectorstock.com/i/500p/95/56/user-profile-icon-avatar-or-person-vector-45089556.jpg',
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 15,
                }}
              />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#333'}}>
                  {friReq.requester.name || 'Unknown User'}
                </Text>
                <Text style={{fontSize: 12, color: '#666'}}>
                  Wildcat #{formatId(friReq.requester._id)}
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginLeft: 'auto'}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'green',
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  onPress={() => handleFriendRequest(friReq._id, 'accept')}>
                  <Text style={{color: 'white'}}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'red',
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                  onPress={() => handleFriendRequest(friReq._id, 'reject')}>
                  <Text style={{color: 'white'}}>Reject</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {friendRequests.length > 0 && (
            <View
              style={{
                borderBottomWidth: 2,
                width: '90%',
                marginLeft: 20,
                borderBottomColor: 'green',
                marginBottom: 20,
                marginTop: 10,
              }}
            />
          )}
          <Text style={styles.friendsSubHeaderText}>My Friends</Text>
          {filteredFriends.map((friList, index) => (
            <TouchableOpacity
              key={index}
              style={styles.friendCardButton}
              onPress={() =>
                navigation.navigate('ProfileFriend', {
                  friendId: friList.friend._id,
                })
              }>
              <Image
                source={{
                  uri:
                    friList.friend.profilePicture ||
                    'https://cdn.vectorstock.com/i/500p/95/56/user-profile-icon-avatar-or-person-vector-45089556.jpg',
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 15,
                }}
              />
              <View>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#333'}}>
                  {friList.friend.name || 'Unknown User'}
                </Text>
                <Text style={{fontSize: 14, color: '#666'}}>
                  Wildcat #{formatId(friList.friend._id)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default FriendsScreen;

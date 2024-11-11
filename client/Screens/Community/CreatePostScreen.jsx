import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from '../components/CompactNavigationBar';
import Toast from 'react-native-toast-message';
import {getToken} from '../api/tokenStorage';
import axios from 'axios';
import {fetchData} from '../api/api';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

function CreatePostScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const communityId = route.params?.communityId || '';

  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(''); // Media state
  const [mediaUrl, setMediaUrl] = useState(''); // Media URL state

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setHeader('');
      setBody('');
      setMedia('');
      setMediaUrl('');

      if (!communityId) {
        Toast.show({
          type: 'error',
          text1: 'Community is missing.',
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Function to pick and upload media
  const handleMediaPick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true, // No cropping
      });

      Image.getSize(
        image.path,
        async (width, height) => {
          console.log(`Original dimensions: ${width}x${height}`);

          // You can log or perform actions based on the dimensions if needed
          if (width > height) {
            console.log('Image is landscape');
          } else {
            console.log('Image is portrait');
          }

          // Convert image path to a Blob and upload to Firebase
          const response = await fetch(image.path);
          const blob = await response.blob();
          const filename = image.path.split('/').pop();
          const reference = storage().ref(`/post_media/${filename}`);

          await reference.put(blob); // Upload media
          const downloadURL = await reference.getDownloadURL();

          setMediaUrl(downloadURL);
          console.log('Media uploaded successfully:', downloadURL);

          Toast.show({
            type: 'success',
            text1: 'Media uploaded successfully!',
          });
        },
        error => {
          console.error('Error getting image size:', error);
          Toast.show({
            type: 'error',
            text1: 'Error getting image size.',
          });
        },
      );
    } catch (error) {
      console.error('Error uploading media:', error);
      Toast.show({
        type: 'error',
        text1: 'Error uploading media.',
      });
    }
  };

  const handlePostSubmit = async () => {
    if (!header || !body) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      const postData = {
        communityId,
        header,
        body,
        mediaURL: mediaUrl,
      };
      console.log('POST DATA:', postData);

      const token = await getToken();
      const response = await fetchData(
        '/createforumpost',
        token,
        'POST',
        postData,
      );

      Toast.show({
        type: 'success',
        text1: 'Post created successfully.',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'There was an error creating your post.');
    }
  };

  return (
    <View style={styles.container}>
      <NavigationBar backAction={() => navigation.goBack()} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create a New Post</Text>

        <Text style={styles.label}>Header</Text>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#888"
          value={header}
          onChangeText={setHeader}
        />

        <Text style={styles.label}>Body</Text>
        <TextInput
          style={styles.input}
          placeholder="Details about your post..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={body}
          onChangeText={setBody}
        />

        <Text style={styles.label}>Upload Media (optional)</Text>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleMediaPick}>
          <Icon name="image" size={40} color="#fff" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePostSubmit}
          style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  iconContainer: {
    backgroundColor: 'green',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    alignSelf: 'center',
  },
  icon: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#28a745',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CreatePostScreen;

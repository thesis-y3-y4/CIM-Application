  import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Modal,
    FlatList,
  } from 'react-native';
  import React, {useEffect, useState, useCallback} from 'react';
  import Toast from 'react-native-toast-message';

  import {Avatar} from 'react-native-paper';
  import ImagePicker from 'react-native-image-crop-picker';
  import Icon from 'react-native-vector-icons/Foundation';
  import Icon2 from 'react-native-vector-icons/Entypo';
  import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
  import Icon4 from 'react-native-vector-icons/AntDesign';
  import Icon5 from 'react-native-vector-icons/FontAwesome5';
  import ProgressBar from 'react-native-progress/Bar';
  import {
    DrawerActions,
    useNavigation,
    useFocusEffect,
  } from '@react-navigation/native';
  import {fetchData, updateProfilePicture} from './api/api';
  import {getToken} from './api/tokenStorage';
  import storage from '@react-native-firebase/storage';
  import PurchasedItemsModal from './components/PurchasedItemsModal.js';

  const {width: screenWidth} = Dimensions.get('window');

  function ProfileScreen(props) {
    const navigation = useNavigation();
    const [userData, setUserData] = useState('');
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [selectedFrame, setSelectedFrame] = useState(null);

    async function getData() {
      const token = await getToken();

      if (token === '') {
        navigation.navigate('Login');
      } else {
        try {
          const response = await fetchData('/userdata', token);
          setUserData(response.data.data);
          setSelectedFrame(response.data.data.selectedFrame);
          console.log('Selected Frame:', selectedFrame);
          fetchPurchasedItems(response.data.data._id);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    // Function to fetch purchased minigame items
    const fetchPurchasedItems = async userId => {
      try {
        const token = await getToken();
        console.log('User ID:', userId);
        const response = await fetchData(
          `/purchased-minigameshopitems/${userId}`,
          token,
          'GET',
        );
        setPurchasedItems(response.data);
      } catch (error) {
        console.error('Error fetching purchased items:', error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        getData();
      }, [shouldRefresh]),
    );

    const handleImagePick = async () => {
      try {
        const image = await ImagePicker.openPicker({
          width: 300,
          height: 400,
          cropping: true,
        });

        const response = await fetch(image.path);
        const blob = await response.blob();
        const filename = image.path.split('/').pop();
        const reference = storage().ref(`/profile_pictures/${filename}`);

        await reference.put(blob);
        const downloadURL = await reference.getDownloadURL();

        const token = await getToken();
        await updateProfilePicture(downloadURL, token);

        setUserData(prevData => ({
          ...prevData,
          profilePicture: downloadURL,
        }));

        setTimeout(() => {
          Toast.show({
            type: 'updateProfilePictureSuccess',
            visibilityTime: 3000,
            onPress: () => Toast.hide(),
          });
        }, 1000);

        setShouldRefresh(prev => !prev);
      } catch (error) {
        if (error.message.includes('User cancelled image selection')) {
          console.log('User cancelled image selection');
          setTimeout(() => {
            Toast.show({
              type: 'updateProfilePictureFailed',
              visibilityTime: 3000,
              onPress: () => Toast.hide(),
            });
          }, 1000);
        } else {
          console.error('Error uploading image:', error);
        }
      }
    };

    const getTierInfo = clawMarks => {
      if (clawMarks >= 2000)
        return {
          tier: 'Wildcat Tier',
          minPoints: 2000,
          maxPoints: Infinity,
          emblem: require('../assets/tier_list/WILDCAT_TIER_EMBLEM.png'),
        };
      if (clawMarks >= 500)
        return {
          tier: 'Juvenile Tier',
          minPoints: 500,
          maxPoints: 2000,
          emblem: require('../assets/tier_list/JUVENILE_TIER_EMBLEM.png'),
        };
      return {
        tier: 'Cub Tier',
        minPoints: 0,
        maxPoints: 500,
        emblem: require('../assets/tier_list/CUB_TIER_EMBLEM.png'),
      };
    };

    const {clawMarks = 0} = userData;
    const {tier, minPoints, maxPoints, emblem} = getTierInfo(clawMarks);
    const progress = Math.min(
      (clawMarks - minPoints) / (maxPoints - minPoints),
      1,
    );

    const handleOpenModal = () => {
      fetchPurchasedItems(userData._id).then(() => {
        setModalVisible(true);
      });
    };

    const handleCloseModal = () => {
      setModalVisible(false);
    };

    const handleSelectFrame = async frameUri => {
      setSelectedFrame(frameUri);
      setModalVisible(false);
      console.log('Selected frame modal:', frameUri);
      // API call to update the selected frame in the database
      const token = await getToken();
      await fetchData(`/update-selectedframe/${userData._id}`, token, 'POST', {
        selectedFrame: frameUri,
      });
    };

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              style={{
                zIndex: 1,
                position: 'absolute',
                left: 0,
                margin: 15,
              }}
              onPress={() => navigation.goBack()}>
              <Icon5 name="arrow-left" size={30} color={'white'} />
            </TouchableOpacity>

            <Image
              width={100}
              height={60}
              resizeMode="contain"
              style={{marginTop: -105}}
              source={require('../assets/wave.png')}
            />

            <TouchableOpacity
              style={styles.framesButton}
              onPress={handleOpenModal}>
              <Icon5 name="images" size={30} color={'white'} />
            </TouchableOpacity>

            <PurchasedItemsModal
              visible={modalVisible}
              onClose={handleCloseModal}
              purchasedItems={purchasedItems}
              onSelect={handleSelectFrame}
            />
          </View>

          {/* <View style={{alignItems: 'center', position: 'relative'}}> */}
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity onPress={handleImagePick}>
              <Avatar.Image
                size={180}
                style={styles.avatar}
                source={
                  userData.profilePicture
                    ? {uri: userData.profilePicture}
                    : require('../assets/default-profile.jpg')
                }
              />
              {selectedFrame && (
                <Image source={{uri: selectedFrame}} style={styles.frameImage} />
              )}
            </TouchableOpacity>
          </View>

          <View style={{marginHorizontal: 25, marginTop: 10}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={[styles.nameText]}>{userData.name || ''}</Text>
              <Image source={emblem} style={{width: 40, height: 40}} />
            </View>

            {/* Tier and Progress Bar */}
            <View
              style={[
                styles.infoMain,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              <Image
                source={require('../assets/tier_list/CLAW_MARKS_POINTS.png')}
                style={{width: 50, height: 50}}
              />
              <View style={{flex: 1, marginLeft: 5}}>
                <ProgressBar
                  progress={progress}
                  width={screenWidth - 120}
                  height={10}
                  color={'green'}
                  unfilledColor={'lightgrey'}
                  borderRadius={5}
                />
              </View>
              <Text
                style={{
                  color: 'grey',
                  fontSize: 11,
                  fontWeight: '500',
                  marginRight: 20,
                }}>
                {clawMarks} / {maxPoints} Claw Marks
              </Text>
            </View>
          </View>

          <View style={{marginTop: 20, marginHorizontal: 25}}>
            <View styles={styles.infoMain}>
              <View style={styles.infoCont}>
                <View
                  style={[styles.infoIconCont, {backgroundColor: 'darkgreen'}]}>
                  <Icon3 name="email" size={24} style={{color: 'white'}} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoSmall_Text}>Email</Text>
                  <Text style={styles.infoLarge_Text} numberOfLines={1}>
                    {userData && userData.studentemail
                      ? userData.studentemail
                      : ''}
                  </Text>
                </View>
              </View>
            </View>
            {userData && userData.adminType ? (
              <View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon
                        name="torsos-male-female"
                        size={28}
                        color="blue"
                        style={{color: 'white'}}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>Admin Type</Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.adminType ? userData.adminType : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon
                        name="results-demographics"
                        size={24}
                        style={{color: 'white'}}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>
                        Organization / Community
                      </Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.organization
                          ? userData.organization
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon name="torso" size={24} style={{color: 'white'}} />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>
                        Organization position
                      </Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.position ? userData.position : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon4 name="profile" size={24} style={{color: 'white'}} />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>School Year</Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.schoolYear
                          ? userData.schoolYear
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon
                        name="torsos-male-female"
                        size={28}
                        color="blue"
                        style={{color: 'white'}}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>Section</Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.section ? userData.section : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon
                        name="results-demographics"
                        size={24}
                        style={{color: 'white'}}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>Education Level</Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.educationLevel
                          ? userData.educationLevel
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoMain}>
                  <View style={styles.infoCont}>
                    <View
                      style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                      <Icon4 name="profile" size={24} style={{color: 'white'}} />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoSmall_Text}>Subjects</Text>
                      <Text style={styles.infoLarge_Text}>
                        {userData && userData.subjects
                          ? userData.subjects.map(subject => (
                              <Text key={subject}>
                                {subject}
                                {'\n'}
                              </Text>
                            ))
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  const styles = StyleSheet.create({
    editIcon: {
      zIndex: 1,
      color: 'white',
      position: 'absolute',
      right: 2,
      margin: 15,
    },
    backIcon: {
      zIndex: 1,
      color: 'white',
      position: 'absolute',
      left: 2,
      margin: 15,
    },
    avatar: {
      borderRadius: 100,
      marginTop: -230,
      backgroundColor: 'white',
      height: 200,
      width: 200,
      padding: 10,
      borderColor: '#cccccc',
      elevation: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    frameImage: {
      width: 250,
      height: 250,
      position: 'absolute',
      top: -240,
      left: -25,
      zIndex: 0,
    },
    nameText: {
      fontSize: 20,
      textAlignVertical: 'center',
      color: 'black',

      fontStyle: 'normal',
      fontFamily: 'Open Sans',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    infoMain: {
      marginTop: 10,
    },
    infoCont: {
      width: '100%',
      flexDirection: 'row',
    },
    infoIconCont: {
      justifyContent: 'center',
      height: 40,
      width: 40,
      borderRadius: 20,

      alignItems: 'center',
      elevation: -5,
      borderColor: 'black',
      backgroundColor: 'black',
    },

    infoText: {
      width: '80%',
      flexDirection: 'column',
      marginLeft: 25,
      borderBottomWidth: 1,
      paddingBottom: 10,
      borderColor: '#e6e6e6',
    },
    infoSmall_Text: {
      color: '#b3b3b3',
      fontSize: 14,
      fontWeight: '500',
    },
    infoLarge_Text: {
      color: 'black',
      fontSize: 18,
      fontWeight: '500',
    },

    //Modal
    framesButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 1,
    },
  });

  export default ProfileScreen;

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
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
  useRoute,
} from '@react-navigation/native';
import {fetchData, updateProfilePicture} from './api/api';
import {getToken} from './api/tokenStorage';
import storage from '@react-native-firebase/storage';

const {width: screenWidth} = Dimensions.get('window');
function ProfileFriendScreen(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const {friendId} = route.params;

  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [friendData, setFriendData] = useState('');

  async function getData() {
    const token = await getToken();
    try {
      const friendResponse = await fetchData(
        `/frienddata/${friendId}`,
        token,
        'GET',
      );
      setFriendData(friendResponse.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [shouldRefresh]),
  );

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

  const {clawMarks = 0} = friendData;
  const {tier, minPoints, maxPoints, emblem} = getTierInfo(clawMarks);
  const progress = Math.min(
    (clawMarks - minPoints) / (maxPoints - minPoints),
    1,
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        {/* Back button and Background image */}
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
        </View>

        <View style={{alignItems: 'center', position: 'relative'}}>
          {/* <View style={{alignItems: 'center'}}> */}
          <Avatar.Image
            size={180}
            style={styles.avatar}
            source={
              friendData.profilePicture
                ? {uri: friendData.profilePicture}
                : require('../assets/default-profile.jpg')
            }
          />
          {friendData.selectedFrame && (
            <Image
              source={{uri: friendData.selectedFrame}}
              style={styles.frameImage}
            />
          )}
        </View>

        <View style={{marginHorizontal: 25, marginTop: 20}}>
          <View
            style={{
              marginTop: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.nameText, {textAlignVertical: 'center'}]}>
              {friendData.name || ''}
            </Text>
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
                width={screenWidth - 110}
                height={10}
                color={'green'}
                unfilledColor={'lightgrey'}
                borderRadius={5}
              />
            </View>
            <Text
              style={{
                color: 'grey',
                fontSize: 12,
                fontWeight: '500',
                marginRight: 10,
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
                  {friendData && friendData.studentemail
                    ? friendData.studentemail
                    : ''}
                </Text>
              </View>
            </View>
          </View>
          {friendData && friendData.adminType ? (
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
                      {friendData && friendData.adminType
                        ? friendData.adminType
                        : ''}
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
                      {friendData && friendData.organization
                        ? friendData.organization
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
                      {friendData && friendData.position
                        ? friendData.position
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
                    <Text style={styles.infoSmall_Text}>School Year</Text>
                    <Text style={styles.infoLarge_Text}>
                      {friendData && friendData.schoolYear
                        ? friendData.schoolYear
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
                      {friendData && friendData.section
                        ? friendData.section
                        : ''}
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
                      {friendData && friendData.educationLevel
                        ? friendData.educationLevel
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
                      {friendData && friendData.subjects
                        ? friendData.subjects.map(subject => (
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
    marginTop: -220,
    backgroundColor: 'white',
    height: 200,
    width: 200,
    padding: 10,
    borderColor: '#cccccc',
    borderWidth: 1,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  frameImage: {
    width: 250,
    height: 250,
    position: 'absolute',
    top: -240,
    zIndex: 0,
  },
});

export default ProfileFriendScreen;

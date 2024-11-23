import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  largeMedia: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 30,
  },

  buttonContainer: {
    position: 'absolute',
    top: 70,
    right: 10,
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userInfo: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  //NavigationBar
  backIcon: {
    zIndex: 1,
    color: 'white',
    position: 'absolute',
    left: 2,
    margin: 15,
  },
  calendarIcon: {
    zIndex: 1,
    position: 'absolute',
    right: 40,
    margin: 15,
  },
  notifIcon: {
    zIndex: 1,
    position: 'absolute',
    right: 0,
    margin: 15,
  },
  notificationContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 10,
  },
  notificationIndicator: {
    position: 'absolute',
    top: -9,
    left: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'darkgreen',
  },
  notificationIndicatorText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  //CalendarScreen
  modalCalendarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCalendarContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'darkgreen',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },

  //NotificationScreen
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
    padding: 10,
    paddingTop: 15,
    paddingBottom: 0,
  },
  deleteNotificationsButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#4c8c4a',
    padding: 6,
    paddingLeft: 10,
    borderRadius: 5,
  },
  detailsNotification: {
    fontSize: 13,
    color: 'darkgreen',
  },
  endCard: {
    backgroundColor: '#f8f8f8',
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },

  //Posts in HomeScreen
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexWrap: 'wrap',
  },
  cardDetails: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#013220',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.2,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'darkgreen',
  },
  title: {
    fontSize: 12,
    color: '#777',
  },
  details: {
    marginTop: 5,
    color: '#333',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 5,
    width: '100%',
  },
  seeMoreText: {
    color: 'black',
    fontWeight: 'bold',
    marginTop: 5,
  },

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
  mediaImage: {
    aspectRatio: 1.5,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 10,
    width: '100%',
  },
  seeOlderPostsButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#086808',
    margin: 16,
  },
  seeOlderPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  reactionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  reactionCountText: {
    marginLeft: 5,
    fontSize: 16,
    color: 'black',
  },
  //Comments
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '40%',
  },
  commentButtonForum: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  commentText: {marginLeft: 8, fontSize: 16, color: 'black'},
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    overflow: 'scroll',
    borderWidth: 1,
    borderColor: 'grey',
    width: '100%',
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    marginRight: 10,
    color: 'black',
  },
  closeButton: {
    textAlign: 'center',
    color: 'darkgreen',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  //toTopButton
  toTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  audioButton: {
    marginRight: 10,
  },
  audioText: {
    fontSize: 16,
    color: '#333',
  },

  //Minigames
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#FFF',
    borderRadius: 10,
    zIndex: 2,
  },
  startButtonText: {
    color: '#000', // Button text color
    fontSize: 18,
    fontWeight: 'bold',
  },

  //CommunitiesScreen
  navigationItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 5,
  },
  navigationText: {
    fontSize: 18,
    color: 'black',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'darkgreen',
  },
  myCommunities: {
    width: '50%',
  },
  communityCard: {
    width: '31%',
    height: 155,
    borderRadius: 10,
    margin: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  logoContainer: {
    padding: 8,
    minWidth: '100%',
    minHeight: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    flex: 1,
    minWidth: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 75,
    overflow: 'hidden',
  },
  comName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#063d08',
    padding: 4,
    textAlign: 'center',
    marginTop: -2,
    lineHeight: 14.2,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  communitySearchBar: {
    height: 55,
    margin: 12,
    backgroundColor: 'white',
    padding: 10,
    color: 'black',
    marginBottom: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  //CommunityDetailsScreen
  containerCommunityName: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  communityName: {
    color: 'green',
    fontSize: 20,
  },
  communityProfile: {
    flex: 1,
    backgroundColor: '#c8dcc5',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 10,
  },
  avatar: {
    alignSelf: 'left',
    margin: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 60,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#306434',
    borderRadius: 50,
  },
  tabButtonText: {
    color: 'black',
    fontSize: 16,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  //ForumScreen
  postForumContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: 'grey',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  forumItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  forumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userNameForum: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'green',
  },
  dateText: {
    fontSize: 12,
    color: 'grey',
    marginTop: 4,
  },
  postBodyContainer: {
    marginBottom: 10,
  },
  postHeader: {
    color: 'darkgreen',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  postBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 5,
    width: '100%',
    paddingHorizontal: 10,
  },
  addFriendButton: {
    position: 'absolute',
    right: 5,
    top: 10,
    backgroundColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  friendStatusText: {
    backgroundColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    position: 'absolute',
    right: 5,
    top: 10,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  friendsHeaderText: {
    fontSize: 20,
    color: 'darkgreen',
    marginTop: 20,
    marginLeft: 20,
  },
  friendsSubHeaderText: {
    fontSize: 20,
    color: 'darkgreen',
    marginLeft: 20,
  },
  searchFriendsInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    margin: 20,
    backgroundColor: 'white',
    color: 'black',
    marginBottom: 20,
    marginTop: 10,
  },
  friendCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 5,
  },
});

export default styles;

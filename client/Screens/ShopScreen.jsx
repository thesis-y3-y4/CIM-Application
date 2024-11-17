import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import NavigationBar from './components/NavigationBar';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage.js';

function ShopScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [allFrames, setAllFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null); // State for selected frame
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [purchasedItems, setPurchasedItems] = useState([]);

  async function getData() {
    const token = await getToken();
    try {
      // Fetch user data
      const response = await fetchData('/userdata', token);
      setUserData(response.data.data);

      // Fetch minigame shop items
      const framesResponse = await fetchData(
        '/minigameshopitems',
        token,
        'GET',
      );

      // Filter out items that have already been purchased
      const purchasedItemIds = response.data.data.purchasedShopItems || [];
      const availableFrames = framesResponse.data.filter(
        frame => !purchasedItemIds.includes(frame._id),
      );

      setAllFrames(availableFrames);
      setPurchasedItems(purchasedItemIds);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const openPurchaseModal = frame => {
    setSelectedFrame(frame);
    setModalVisible(true);
  };

  const confirmPurchase = () => {
    handlePurchase(selectedFrame._id);
    setModalVisible(false);
  };

  const renderFrame = ({item}) => (
    <View style={styles.frameCard}>
      <Image source={{uri: item.picture}} style={styles.frameImage} />
      <Text style={styles.frameName}>{item.name}</Text>
      <Text style={styles.frameCost}>{item.price} Claw Marks</Text>
      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => openPurchaseModal(item)}>
        <Text style={styles.purchaseButtonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({item}) => {
    const isPurchased = purchasedItems.some(
      purchased => purchased.id === item.id,
    );
    return (
      <View style={[styles.itemContainer, isPurchased && styles.grayedOut]}>
        <Text>{item.name}</Text>
        <TouchableOpacity
          style={[styles.button, isPurchased && styles.disabledButton]}
          disabled={isPurchased}
          onPress={() => frchase(item.id)}>
          <Text style={styles.buttonText}>
            {isPurchased ? 'Purchased' : 'Buy'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handlePurchase = async itemId => {
    const token = await getToken();

    try {
      const response = await fetchData(
        `/purchaseminigameshopitem/${userData._id}`,
        token,
        'POST',
        {shopItemId: itemId},
      );

      if (response.status === 200) {
        // Update purchased items and remove the purchased item from available items
        setPurchasedItems(prevItems => [...prevItems, itemId]);
        setAllFrames(prevFrames =>
          prevFrames.filter(frame => frame._id !== itemId),
        );

        Alert.alert('Success', 'Item purchased successfully');
      } else if (response.status === 400) {
        Alert.alert(
          'Insufficient Claw Marks',
          'You do not have enough claw marks to purchase this item.',
        );
      }
    } catch (error) {
      console.error('SHOP: Error purchasing item:', error);
      Alert.alert(
        'Error',
        'An error occurred while attempting to purchase the item.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <NavigationBar navigation={navigation} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Shop</Text>
        <FlatList
          data={allFrames}
          keyExtractor={item => item._id}
          renderItem={renderFrame}
          contentContainerStyle={styles.flatListContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>

      {/* Purchase Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
            {userData.profilePicture && (
              <View style={styles.previewContainer}>
                <Image
                  source={{uri: userData.profilePicture}}
                  style={styles.profileImage}
                />
                <Image
                  source={{uri: selectedFrame?.picture}}
                  style={styles.frameOverlay}
                />
              </View>
            )}
            <Text style={styles.modalText}>
              Unlock "{selectedFrame?.name}" for {selectedFrame?.price} Claw
              Marks?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmPurchase}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e7d32',
    marginVertical: 10,
    textAlign: 'center',
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  frameCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 5,
  },
  frameImage: {
    width: 90,
    height: 90,
    marginBottom: 10,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  frameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  frameCost: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  purchaseButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    justifyContent: 'center',
    height: 320,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2e7d32',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#555',
  },
  frameOverlay: {
    width: 150,
    height: 150,
    position: 'absolute',
    borderRadius: 60,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ShopScreen;

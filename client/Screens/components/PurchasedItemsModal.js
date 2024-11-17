import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';

function PurchasedItemsModal({visible, onClose, purchasedItems, onSelect}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Unlocked Minigame Items</Text>
          <ScrollView contentContainerStyle={styles.purchasedItemsContainer}>
            {purchasedItems.map(item => (
              <TouchableOpacity
                key={item.id} // Unique key for each item
                onPress={() => {
                  onSelect(item.picture);
                }}>
                <View style={styles.frameCard}>
                  <Image
                    source={{uri: item.picture}}
                    style={styles.frameImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.frameName}>{item.name}</Text>
                  <Text style={styles.frameCost}>{item.price} Claw Marks</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'darkgreen',
  },
  purchasedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  frameCard: {
    width: 120,
    height: 150,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  frameImage: {
    width: '90%',
    height: '70%',
    borderRadius: 5,
    marginBottom: 5,
  },
  frameName: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frameCost: {
    fontSize: 12,
    color: 'grey',
    textAlign: 'center',
  },
  closeModal: {
    marginTop: 15,
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
});

export default PurchasedItemsModal;

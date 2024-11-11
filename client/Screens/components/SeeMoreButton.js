import React from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import styles from '../styles';

const SeeMoreButton = ({onPress, remainingItems}) => {
  return remainingItems.length === 0 ? (
    <View style={styles.endCard}>
      <Text style={styles.name}>You're All Caught Up!</Text>
    </View>
  ) : (
    <TouchableOpacity onPress={onPress} style={styles.seeOlderPostsButton}>
      <Text style={styles.seeOlderPostsButtonText}>See More</Text>
    </TouchableOpacity>
  );
};

export default SeeMoreButton;

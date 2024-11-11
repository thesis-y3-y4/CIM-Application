import React from 'react';
import {Text, StyleSheet} from 'react-native';

const TimeDisplay = ({time}) => {
  const timeToString = time => {
    const date = new Date(time);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <Text style={styles.timeText}>
      {time ? timeToString(time) : 'Invalid time'}
    </Text>
  );
};

const styles = StyleSheet.create({
  timeText: {
    fontSize: 12,
    color: 'grey',
  },
});

export default TimeDisplay;

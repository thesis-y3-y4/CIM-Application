import React, {useRef} from 'react';
import {
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const LargeMediaModal = ({visible, mediaUrl, onClose}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dx !== 0 ||
        gestureState.dy !== 0 ||
        gestureState.numberActiveTouches === 2,

      onPanResponderGrant: () => {
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
      },

      onPanResponderMove: (e, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          let newScale = lastScale.current * gestureState.scale;
          newScale = Math.max(1, newScale); // Prevent zooming out beyond original size
          scale.setValue(newScale);
        } else if (gestureState.numberActiveTouches === 1) {
          const newTranslateX = lastTranslateX.current + gestureState.dx;
          const newTranslateY = lastTranslateY.current + gestureState.dy;
          translateX.setValue(newTranslateX);
          translateY.setValue(newTranslateY);
        }
      },

      onPanResponderRelease: () => {
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
      },
    }),
  ).current;

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}>
        {mediaUrl ? (
          <Animated.View
            style={{
              transform: [
                {scale: scale},
                {translateX: translateX},
                {translateY: translateY},
              ],
            }}
            {...panResponder.panHandlers}>
            <Image source={{uri: mediaUrl}} style={styles.largeMedia} />
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  largeMedia: {
    width,
    height,
    resizeMode: 'contain',
  },
});

export default LargeMediaModal;

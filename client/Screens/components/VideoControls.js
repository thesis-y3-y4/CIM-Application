import React, {useState, useRef, useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Orientation from 'react-native-orientation-locker';
import Slider from '@react-native-community/slider';

const screen = Dimensions.get('screen');
const screenWidth = Dimensions.get('window').width;

const VideoControls = ({mediaUrl}) => {
  const [vidPaused, setVidPaused] = useState(true);
  const [modalVidPaused, setModalVidPaused] = useState(true);
  const [vidProgress, setVidProgress] = useState({currentTime: 0});
  const [vidFullScreen, setVidFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const [videoHeight, setVideoHeight] = useState(
    Dimensions.get('window').width / 2.5,
  );
  const mainVideoRef = useRef(); // For the main video
  const modalVideoRef = useRef(); // For the modal video

  const format = seconds => {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.round(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    let timeout;
    if (!vidPaused && !showControls) {
      setShowControls(false);
    } else if (vidPaused) {
      setShowControls(true);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [vidPaused, showControls]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const onVideoLoad = ({naturalSize}) => {
    const aspectRatio = naturalSize.width / naturalSize.height;
    setVideoAspectRatio(aspectRatio);

    // Adjust height based on aspect ratio (for portrait or landscape)
    const height = screenWidth / aspectRatio;
    setVideoHeight(height);
  };

  const toggleFullScreen = () => {
    const isExiting = vidFullScreen;
    setVidFullScreen(!vidFullScreen);

    if (isExiting) {
      // Exiting fullscreen
      setModalVidPaused(true); // Pause the modal video
      setVidPaused(false); // Resume the main video
      if (mainVideoRef.current) {
        mainVideoRef.current.seek(vidProgress.currentTime); // Sync time
      }
      Orientation.unlockAllOrientations();
    } else {
      // Entering fullscreen
      setVidPaused(true); // Pause the main video
      setModalVidPaused(false); // Play the modal video
      if (modalVideoRef.current) {
        modalVideoRef.current.seek(vidProgress.currentTime); // Sync time
      }
      videoAspectRatio > 1
        ? Orientation.lockToLandscape()
        : Orientation.lockToPortrait();
    }
  };

  const seekVideo = time => {
    if (mainVideoRef.current) {
      mainVideoRef.current.seek(time);
    }
  };

  return (
    <View style={[styles.videoContainer, {height: videoHeight}]}>
      {/* Main Video */}
      <TouchableOpacity style={styles.touchableVideo} onPress={toggleControls}>
        <Video
          paused={vidPaused}
          source={{uri: mediaUrl}}
          ref={videoRef => {
            if (videoRef) {
              mainVideoRef.current = videoRef;
            }
          }}
          onProgress={x => setVidProgress(x)}
          style={[styles.video]}
          resizeMode="contain"
          onLoad={onVideoLoad}
          onEnd={() => {
            setVidPaused(true);
            seekVideo(0);
          }}
        />

        {showControls && (
          <TouchableOpacity style={styles.controlsOverlay}>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  seekVideo(parseInt(vidProgress.currentTime) - 10)
                }>
                <Icon name="rewind-outline" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setVidPaused(!vidPaused)}>
                <Icon
                  name={vidPaused ? 'play-circle' : 'pause-circle'}
                  size={35}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  seekVideo(parseInt(vidProgress.currentTime) + 10)
                }>
                <Icon name="fast-forward-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={toggleFullScreen}
              style={styles.fullScreenButton}>
              <Icon
                name={vidFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                size={30}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.sliderContainer}>
              <Text style={styles.timeText}>
                {format(vidProgress.currentTime)}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={vidProgress.seekableDuration || 0}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#fff"
                value={vidProgress.currentTime}
                onValueChange={x => seekVideo(x)}
              />
              <Text style={styles.timeDurationText}>
                {format(vidProgress.seekableDuration || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {/* Fullscreen Modal */}
      <Modal visible={vidFullScreen} transparent={true} animationType="slide">
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.touchableVideo}
            onPress={toggleControls}>
            <Video
              paused={modalVidPaused}
              source={{uri: mediaUrl}}
              ref={modalVideoRef}
              onProgress={x => setVidProgress(x)}
              style={[styles.video, {aspectRatio: videoAspectRatio}]}
              resizeMode="contain"
              onLoad={onVideoLoad}
              onEnd={() => {
                setModalVidPaused(true);
                seekVideo(0);
              }}
            />
            <TouchableOpacity
              onPress={toggleFullScreen}
              style={styles.fullScreenButton}>
              <Icon name="fullscreen-exit" size={30} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
  },
  touchableVideo: {
    width: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
  },
  controlButton: {
    marginRight: 50,
  },
  fullScreenButton: {
    position: 'absolute',
    zIndex: 100,
    top: 10,
    right: 10,
  },
  sliderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  timeText: {
    color: 'white',
  },
  timeDurationText: {
    color: 'white',
    right: 18,
  },
  slider: {
    width: '70%',
    height: 40,
    right: 10,
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
export default VideoControls;

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
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';

const screen = Dimensions.get('screen');
const screenWidth = Dimensions.get('window').width;

const VideoControls = ({mediaUrl}) => {
  const ref = useRef();
  const [vidPaused, setVidPaused] = useState(true);
  const [vidProgress, setVidProgress] = useState({currentTime: 0});
  const [vidFullScreen, setVidFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const [videoHeight, setVideoHeight] = useState(
    Dimensions.get('window').width / 2.5,
  );

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
    setVidFullScreen(!vidFullScreen);
    if (!vidFullScreen) {
      if (videoAspectRatio > 1) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    } else {
      Orientation.unlockAllOrientations();
    }
  };

  const seekVideo = time => {
    if (ref.current) {
      ref.current.seek(time);
    }
  };

  return (
    <View style={[styles.videoContainer, {height: videoHeight}]}>
      <TouchableOpacity style={styles.touchableVideo} onPress={toggleControls}>
        <Video
          paused={vidPaused}
          source={{uri: mediaUrl}}
          ref={ref}
          onProgress={x => setVidProgress(x)}
          style={styles.video}
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

      {/* Modal for fullscreen video */}
      <Modal visible={vidFullScreen} transparent={true} animationType="slide">
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.touchableVideo}
            onPress={toggleControls}>
            <Video
              paused={vidPaused}
              source={{uri: mediaUrl}}
              ref={ref}
              onProgress={x => setVidProgress(x)}
              style={styles.video}
              resizeMode="contain"
              onLoad={onVideoLoad}
              onEnd={() => {
                setVidPaused(true);
                seekVideo(0);
              }}
            />
            {showControls && (
              <View style={styles.controlsOverlay}>
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
                  <Icon name="fullscreen-exit" size={30} color="white" />
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
              </View>
            )}
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
    backgroundColor: 'black',
  },
});
export default VideoControls;

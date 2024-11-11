import React, {useState, useRef, useEffect} from 'react';
import {TouchableOpacity, View, Dimensions, Text} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
const screen = Dimensions.get('screen');

const VideoControls = ({mediaUrl}) => {
  const [vidPaused, setVidPaused] = useState(true);
  const ref = useRef();
  const [vidProgress, setVidProgress] = useState({currentTime: 0});
  const [vidFullScreen, setVidFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

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

  return (
    <View
      style={{
        width: '100%',
        height: vidFullScreen ? '100%' : screen.width / 2.5,
      }}>
      <TouchableOpacity
        style={{
          width: '100%',
          height: vidFullScreen ? '100%' : screen.width / 2.5,
        }}
        onPress={() => {
          toggleControls();
        }}>
        <Video
          paused={vidPaused}
          source={{
            uri: mediaUrl,
          }}
          ref={ref}
          onProgress={x => {
            setVidProgress(x);
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="contain"
          onEnd={() => {
            setVidPaused(true);
            ref.current.seek(0);
          }}
          onPress={() => toggleControls()}
        />

        {/* Controls */}
        {showControls && (
          <TouchableOpacity
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              backgroundColor: 'rgba(0,0,0,.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row'}}>
              {/*  Rewind, Pause/Play, Fastforward */}
              <TouchableOpacity
                style={{marginRight: 50}}
                onPress={() => {
                  ref.current.seek(parseInt(vidProgress.currentTime) - 10);
                }}>
                <Icon name="rewind-outline" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginRight: 50}}
                onPress={() => {
                  setVidPaused(!vidPaused);
                }}>
                {vidPaused ? (
                  <Icon name="play-circle" size={35} color="white" />
                ) : (
                  <Icon name="pause-circle" size={35} color="white" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  ref.current.seek(parseInt(vidProgress.currentTime) + 10);
                }}>
                <Icon name="fast-forward-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                position: 'absolute',
                bottom: 0,
                paddingLeft: 10,
                paddingRight: 35,
                alignItems: 'center',
              }}>
              <Text style={{color: 'white'}}>
                {format(vidProgress.currentTime)}
              </Text>

              <Slider
                style={{width: '80%', height: 40}}
                minimumValue={0}
                maximumValue={vidProgress.seekableDuration || 0}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#fff"
                value={vidProgress.currentTime}
                onValueChange={x => {
                  ref.current.seek(x);
                }}
              />
              <Text style={{color: 'white'}}>
                {format(vidProgress.seekableDuration || 0)}
              </Text>
            </View>

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                position: 'absolute',
                top: 8,
                paddingRight: 20,
                paddingLeft: 10,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (vidFullScreen) {
                    Orientation.lockToPortrait();
                  } else {
                    Orientation.lockToLandscape();
                  }
                  setVidFullScreen(!vidFullScreen);
                }}>
                <Icon
                  name={vidFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                  size={30}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VideoControls;

import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Swiper from 'react-native-swiper'
import { VideoView, useVideoPlayer } from 'expo-video';
import { useFocusEffect } from "expo-router";

const videos = [
  require("../../assets/videos/hawk.mp4"),
  require("../../assets/videos/water.mp4"),
];

const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focused, setFocused] = useState(true);

  // Create players at the top level - one for each video
  const player0 = useVideoPlayer(videos[0], (player) => {
    player.loop = true;
  });

  const player1 = useVideoPlayer(videos[1], (player) => {
    player.loop = true;
  });

  // Store players in an array for easy access
  const players = React.useMemo(() => [player0, player1], [player0, player1]);

  // Handle slide changes
  const handleIndexChanged = (index: number) => {
    setCurrentIndex(index);
  };

  // Control playback and restart from beginning
  useEffect(() => {
    players.forEach((player, index) => {
      if (index === currentIndex && focused) {
        player.currentTime = 0; // Restart from beginning
        player.play();
      } else {
        player.pause();
      }
    });
  }, [players, currentIndex, focused]);

  // Pause videos when navigating away from this tab
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused
      setFocused(true);
      return () => {
        // Screen is unfocused (navigated away)
        setFocused(false);
      };
    }, [])
  );

  return (
    <View style={{ backgroundColor: "#FFF4E9", flex: 1 }}>
      <Swiper
        style={styles.wrapper}
        horizontal={false}
        showsPagination={false}
        onIndexChanged={handleIndexChanged}
      >
        {videos.map((vid, idx) => (
          <View key={idx} style={styles.slide1}>
            <VideoView
              player={players[idx]}
              style={{ width: "100%", height: "100%", aspectRatio: 16 / 9 }}
              nativeControls={false}
            />
          </View>
        ))}
      </Swiper>
    </View>
  );
}
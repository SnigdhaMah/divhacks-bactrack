import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions } from "react-native";
import Swiper from "react-native-swiper";
import { VideoView, useVideoPlayer } from "expo-video";
import { useFocusEffect } from "expo-router";

const videos = [
  require("../../assets/videos/IMG_1709.mp4"),
  require("../../assets/videos/IMG_1711.mp4"),
  require("../../assets/videos/IMG_1712.mp4"),
  require("../../assets/videos/IMG_1712.mp4"),
  require("../../assets/videos/IMG_1714.mp4"),
  require("../../assets/videos/IMG_1715.mp4"),
];

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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

  const player0 = useVideoPlayer(videos[0], (p) => (p.loop = true));
const player1 = useVideoPlayer(videos[1], (p) => (p.loop = true));
const player2 = useVideoPlayer(videos[2], (p) => (p.loop = true));
const player3 = useVideoPlayer(videos[3], (p) => (p.loop = true));
const player4 = useVideoPlayer(videos[4], (p) => (p.loop = true));
const player5 = useVideoPlayer(videos[5], (p) => (p.loop = true));

const players = [player0, player1, player2, player3, player4, player5];})
  );

  // Play only the currently visible video
  useEffect(() => {
    players.forEach((player, idx) => {
      if (idx === currentIndex && focused) {
        player.currentTime = 0;
        player.play();
      } else {
        player.pause();
      }
    });
  }, [players, currentIndex, focused]);

  // Handle focus/unfocus to pause videos when navigating away
  useFocusEffect(
    React.useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  // Optional: loop infinitely by resetting index at the end
  const handleIndexChanged = (index: number) => {
    if (index >= videos.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Swiper
        style={styles.wrapper}
        horizontal={false}
        showsPagination={false}
        loop={true} // makes swiper loop
        onIndexChanged={handleIndexChanged}
        index={currentIndex}
      >
        {videos.map((video, idx) => (
          <View key={idx} style={styles.slide}>
            <VideoView
              player={players[idx]}
              style={{ width: "100%", height: "100%", aspectRatio: 9 / 16 }}
              nativeControls={false}
            />
          </View>
        ))}
      </Swiper>
    </View>
  );
}
// socials.tsx
import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Image,
  ImageBackground,
} from "react-native";
import FriendCard from "../../components/friendsCard";
import InviteCard from "../../components/inviteCard";

// const friendsData = [
//   {
//     id: "1",
//     name: "Katherine Brown",
//     username: "katty_bratty",
//     comment: "achieved perfect posture for 3 hours!",
//     postureRating: 92,
//   },
//   {
//     id: "2",
//     name: "James Lin",
//     username: "j_linsanity",
//     comment: "has been slouching all day",
//     postureRating: 65,
//   },
//   {
//     id: "3",
//     name: "Riya Patel",
//     username: "riyapatel",
//     comment: "kept great posture during her workout!",
//     postureRating: 88,
//   },
//   {
//     id: "4",
//     name: "Bob the builder",
//     username: "can_we_fix_it",
//     comment: "yes he can!",
//     postureRating: 12,
//   },
// ];
const images = [
  require("../../assets/images/crystal-card.png"),
  require("../../assets/images/snigdha-card.png"),
  require("../../assets/images/katharine-card.png"),
];

export default function Socials() {
  return (
    <ImageBackground
      source={require("../../assets/images/friends-background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ height: 40 }} />
        <Text style={styles.header}>Friends Activity</Text>
        <Text style={styles.subHeader}>
          Today, learn from Katharine, Ms.Perfect Posture
        </Text>
        <Image
          source={require("../../assets/images/friends-add.png")}
          style={{ left: -25 }}
        />
        <Image
          source={require("../../assets/images/crystal-card.png")}
          style={{
            width: 346,
            height: 150,
            borderWidth: 3, // thickness of the border
            borderColor: "black", // border colo
            borderRadius: 30, // rounded corners
            marginBottom: 10,
          }}
        />
        <Image
          source={require("../../assets/images/snigdha-card.png")}
          style={{
            width: 346,
            height: 150,
            borderWidth: 3, // thickness of the border
            borderColor: "black", // border colo
            borderRadius: 30, // rounded corners
            marginBottom: 10,
          }}
        />
        <Image
          source={require("../../assets/images/katharine-card.png")}
          style={{
            width: 346,
            height: 150,
            borderWidth: 3, // thickness of the border
            borderColor: "black", // border colo
            borderRadius: 30, // rounded corners
            marginBottom: 10,
          }}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
  },
  subHeader: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 16,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});


// socials.tsx
import React from "react";
import { Text, ScrollView, StyleSheet, View } from "react-native";
import FriendCard from "../../components/friendsCard";
import InviteCard from "../../components/inviteCard";

const friendsData = [
  {
    id: "1",
    name: "Katherine Brown",
    username: "katty_bratty",
    comment: "achieved perfect posture for 3 hours!",
    postureRating: 92,
  },
  {
    id: "2",
    name: "James Lin",
    username: "j_linsanity",
    comment: "has been slouching all day",
    postureRating: 65,
  },
  {
    id: "3",
    name: "Riya Patel",
    username: "riyapatel",
    comment: "kept great posture during her workout!",
    postureRating: 88,
  },
  {
    id: "4",
    name: "Bob the builder",
    username: "can_we_fix_it",
    comment: "yes he can!",
    postureRating: 12,
  },
];

export default function Socials() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={{height:40}}/>
      <Text style={styles.header}>Friends Activity</Text>
      <Text style={styles.subHeader}>See how your friends are doing</Text>

      {friendsData.map((friend, index) => (
          <FriendCard key={friend.id} friend={friend} colorIndex={index} />
      ))}

      <InviteCard />
    </ScrollView>
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
});


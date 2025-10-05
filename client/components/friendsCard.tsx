// components/FriendCard.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const colors = ["#fca5a5", "#86efac", "#93c5fd", "#f9a8d4", "#fcd34d"];

export default function FriendCard({ friend, colorIndex }: any) {
  const [cheered, setCheered] = useState(false);
  const [commented, setCommented] = useState(false);

  const color = colors[colorIndex % colors.length];
  const isGoodPosture = friend.postureRating >= 80;

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {/* Top Section */}
      <View style={styles.topSection}>
        
        <View>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.username}>@{friend.username}</Text>
        </View>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Text style={styles.comment}>{friend.comment}</Text>
        <View style={styles.ratingPill}>
          <MaterialCommunityIcons
            name={isGoodPosture ? "trending-up" : "trending-down"}
            size={18}
            color={isGoodPosture ? "#16a34a" : "#dc2626"}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.ratingText}>
            Posture Rating: {friend.postureRating}%
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCheered(!cheered)}
        >
          <FontAwesome
            name={cheered ? "heart" : "heart-o"}
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionText}>Cheer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCommented(!commented)}
        >
          <MaterialCommunityIcons
            name={commented ? "comment" : "comment-outline"}
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 50,
    padding: 2,
    marginRight: 10,
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "#e2e8f0",
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
  },
  username: {
    color: "#f1f5f9",
  },
  middleSection: {
    marginVertical: 8,
  },
  comment: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 6,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "600",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
});

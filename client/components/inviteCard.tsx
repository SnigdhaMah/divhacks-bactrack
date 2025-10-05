// components/InviteCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function InviteCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Invite Friends</Text>
      <Text style={styles.body}>
        Stay motivated together! Invite your friends to get on Bactrack!
      </Text>
      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteText}>Invite Friends</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    color: "#334155",
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  inviteText: {
    color: "#fff",
    fontWeight: "600",
  },
});

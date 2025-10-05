import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressDots({ currentStep, totalSteps }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#FF69B4",
  },
  inactiveDot: {
    backgroundColor: "#E0E0E0",
  },
});

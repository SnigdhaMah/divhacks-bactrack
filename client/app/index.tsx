
import { Redirect } from 'expo-router';
import { useState } from "react";
import { View, Text, Pressable, ImageBackground, Image } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";

export default function Index() {
  const IP_ADDRESS = "10.206.36.242";
  const ws = new WebSocket(`ws://${IP_ADDRESS}:8000/ws/`);
  const [redir, setRedir] = useState<boolean>(false);

  ws.onopen = () => {
    console.log("Connected to posture server");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
    if (
      "message" in data &&
      data.message === "Baseline calibrated successfully"
    ) {
      // Redirect
      setRedir(true);
    }
  };

  ws.onerror = (e) => {
    // an error occurred
    console.log(e);
  };

  ws.onclose = (e) => {
    // connection closed
    console.log(e.code, e.reason);
  };

  const calibrate = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "calibrate" }));
    } else {
      console.log("WebSocket not connected. Please refresh the page.");
    }
  };
  return redir ? (
    <Redirect href="/(tabs)/feed" />
  ) : (
    <ImageBackground
      source={require("../assets/images/bactrack-title-page.png")}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        backgroundColor: "#FFF4E9",
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",

          height: "100%",
        }}
      >
        <View style={{ height: 200 }} />
        <Image
          source={require("../assets/images/cat.png")}
          style={{ width: 150, height: 170, marginLeft: 20 }}
        />

        <Pressable
          style={{
            borderColor: "black",
            backgroundColor: "transparent",
            borderWidth: 2,
            width: "50%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            flexDirection: "row",
          }}
          onPress={() => calibrate()}
        >
          <Text style={{ color: "#F04C1A", fontSize: 20, fontWeight: "bold" }}>
            START
          </Text>
          <View style={{ width: 10 }} />
          <Fontisto name="play" color="#F04C1A" size={20} />
        </Pressable>
      </View>
    </ImageBackground>
  );
}


import { Redirect } from 'expo-router';
import { useState } from "react";
import { View, Text, Pressable } from "react-native";

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
    <Redirect href="/feed" />
  ) : (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Text>Hi</Text>
      <View style={{ height: 100 }} />
      <Pressable
        style={{
          borderColor: "red",
          borderWidth: 2,
          width: "100%",
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }}
        onPress={() => calibrate()}
      >
        <Text style={{ color: "red", fontSize: 16 }}>Calibrate</Text>
      </Pressable>
    </View>
  );
}

import * as React from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export default function MeTab() {
  const IP_ADDRESS = "10.206.36.242";
  const ws = new WebSocket(`ws://${IP_ADDRESS}:8000/ws/`);

  ws.onopen = () => {
    console.log("Connected to posture server");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
    if ("rating" in data) {
      handleRating(data);
    } else if ("data" in data) {
      handleGraph(data);
    } else if ("message" in data && data.message === "Baseline reset") {
      setRatingData({
        rating: 0,
        current_length: 0,
        baseline_length: 0,
        difference: 0,
        status: "poor",
      });
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

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const notifications = [
    "Crystal is killing it! Catch up!",
    "Damn, not even a downward dog?",
    "Are your cosplaying a shrimp?",
    "Fly higher with a butterfly stretch!",
    "OMGGG BODY GOALS (do the goal post move)",
    "Stand up straighter queen, your crown is slipping",
  ];
  async function sendPushNotification(expoPushToken: string) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Get Bac on Track",
      body: notifications[Math.floor(Math.random() * 6)],
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    setTimeSinceLastNotif(Date.now());
  }

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError(
        "Must use physical device for push notifications"
      );
    }
  }

  const [expoPushToken, setExpoPushToken] = useState("");
  const [timeSinceLastNotif, setTimeSinceLastNotif] = useState(0); // seconds
  const [, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const [ratingData, setRatingData] = React.useState({
    rating: 0,
    current_length: 0,
    baseline_length: 0,
    difference: 0,
    status: "poor",
  });

  useEffect(() => {
    setInterval(() => {
      // getRating();
      // updateGraph();
    }, 10000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // calls ws to get curent posture rating
  const getRating = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "rating" }));
    } else {
      console.log("WebSocket not connected. Please refresh the page.");
    }
  };

  const handleRating = (message: {
    rating: string;
    current_length: number;
    baseline_length: number;
    difference: number;
    status: "good" | "moderate" | "poor";
  }) => {
    console.log("here");
    setRatingData({
      ...message,
      rating: Number(message.rating),
    });
  };

  const handleGraph = (message: { data: [string, number][] }) => {
    // Convert timestamp → readable time and keep rating
    const processedData = message.data.map(([timestamp, rating]) => {
      const timeLabel = new Date(Number(timestamp) * 1000).toLocaleTimeString();
      return { timeLabel, rating };
    });
    console.log("Processed Data:", processedData);
    // Now, update your chartData dynamically (you should make this a state variable!)
    setChartData((prevData) => ({
      ...prevData,
      times: {
        labels: processedData.map((d) => d.timeLabel),
        datasets: [{ data: processedData.map((d) => d.rating) }],
      },
    }));
  };

  const updateGraph = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "graph" }));
    } else {
      console.log("WebSocket not connected. Please refresh the page.");
    }
  };

  const resetPosture = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "reset" }));
    } else {
      console.log("WebSocket not connected. Please refresh the page.");
    }
  };

  const [stretchesDone] = React.useState(12); // stubbed
  const [activeTime] = React.useState("1h 45m"); // stubbed
  const [postureAlerts] = React.useState(3); // stubbed

  // -------------------- Existing chart code (UNCHANGED) --------------------
  const [tooltipPos, setTooltipPos] = React.useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
    label: "",
    index: 0,
  });

  const [timeRange, setTimeRange] = React.useState<"times" | "dates" | "years">(
    "times"
  );

  type ChartDataType = {
    labels: string[];
    datasets: { data: number[] }[];
  };

  const [chartData, setChartData] = React.useState<{
    times: ChartDataType;
    dates: ChartDataType;
    years: ChartDataType;
  }>({
    times: {
      labels: ["Loading"],
      datasets: [{ data: [0] }],
    },
    dates: {
      labels: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5"],
      datasets: [{ data: [65, 85, 45, 90, 50] }],
    },
    years: {
      labels: ["Jan", "Feb", "March", "April", "May"],
      datasets: [{ data: [40, 55, 70, 85, 95] }],
    },
  });

  useEffect(() => {
    async function checkAndNotify() {
      if (
        chartData.times.datasets[0].data.length < 10 ||
        Date.now() - timeSinceLastNotif < 5 * 60 * 1000 // don't send notif if its been < 5 min
      ) {
        // no notifs if < 10 ratings
        return;
      }
      let max = 0;
      chartData.times.datasets[0].data.forEach((num) => {
        max = Math.max(max, num);
      });
      if (max < 60) {
        // send push notifications
        await sendPushNotification(expoPushToken);
      }
    }
    checkAndNotify();
  }, [chartData]);

  const data = chartData[timeRange];

  const handlePress = () => {
    setTooltipPos((prev) => ({ ...prev, visible: false }));
  };

  // -------------------- PAGE UI --------------------
  return (
    <ScrollView
      style={styles.pageContainer}
      contentContainerStyle={{ paddingVertical: 40 }}
    >
      <Image
        source={require("../../assets/images/profile-star.png")}
        style={{ alignSelf: "center", position: "absolute", top: -280 }}
      />
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        <Image source={require("../../assets/images/profile-pic.png")} />
        <Text style={styles.nameText}>Jane The Doer</Text>
        <Text style={styles.usernameText}>@Hip_and_Flex</Text>
      </View>

      {/* Stat Boxes */}
      <View style={{ marginTop: 10, height: 100 }}>
        <Image source={require("../../assets/images/profile-stats.png")} />
        <View
          style={{
            position: "absolute",
            top: 15,
            left: 20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "900",
              fontFamily: "Asap Condensed",
            }}
          >
            {ratingData.rating}%
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "light",
              letterSpacing: 0.1,
            }}
          >
            Posture Score
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 15,
            left: Dimensions.get("window").width * 0.35,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "900",
              fontFamily: "Asap Condensed",
            }}
          >
            #3
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "light",
              letterSpacing: 0.1,
            }}
          >
            Leaderboard
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 15,
            left: Dimensions.get("window").width * 0.65,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "900",
              fontFamily: "Asap Condensed",
            }}
          >
            200
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "light",
              letterSpacing: 0.1,
            }}
          >
            Stretches
          </Text>
        </View>
      </View>
      <View style={{ left: 20, paddingTop: 10, paddingBottom: 5 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Data</Text>
      </View>
      {/* Chart Section */}
      <TouchableWithoutFeedback onPress={handlePress}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          {/* Toggle Buttons */}
          <View style={[styles.toggleContainer, { zIndex: 2 }]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                timeRange === "times" && styles.toggleButtonActive,
              ]}
              onPress={() => setTimeRange("times")}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeRange === "times" && styles.toggleTextActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                timeRange === "dates" && styles.toggleButtonActive,
              ]}
              onPress={() => setTimeRange("dates")}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeRange === "dates" && styles.toggleTextActive,
                ]}
              >
                This week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                timeRange === "years" && styles.toggleButtonActive,
              ]}
              onPress={() => setTimeRange("years")}
            >
              <Text
                style={[
                  styles.toggleText,
                  timeRange === "years" && styles.toggleTextActive,
                ]}
              >
                This month
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              position: "absolute",
              top: 30,
              borderWidth: 4,
              borderColor: "#E8D6FF",
              borderRadius: 30,
              height: 320,
              width: Dimensions.get("screen").width * 0.93,
              zIndex: 1,
            }}
          />
          <LineChart
            data={data}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            fromZero={true}
            yAxisInterval={20}
            yLabelsOffset={10}
            segments={5}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            decorator={() => {
              return tooltipPos.visible ? (
                <View>
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: "pink",
                      padding: 10,
                      borderRadius: 10,
                      left: tooltipPos.x - 50,
                      top: tooltipPos.y - 60,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 16,
                        backgroundColor: "pink",
                      }}
                    >
                      {tooltipPos.value}%
                    </Text>
                    <Text style={{ color: "black", fontSize: 12 }}>
                      {data.labels[tooltipPos.index]}
                    </Text>
                  </View>
                </View>
              ) : null;
            }}
            onDataPointClick={(pointData) => {
              setTooltipPos({
                x: pointData.x,
                y: pointData.y,
                visible: true,
                value: pointData.value,
                index: pointData.index,
                label: String(pointData.value),
              });
            }}
          />

          <Text style={{ color: "#666", fontSize: 12 }}>
            Tap on any dot to see details.
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <Pressable style={{ paddingTop: 30 }}>
        <Image source={require("../../assets/images/profile-shopbutton.png")} />
      </Pressable>
    </ScrollView>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  profilePicWrapper: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 60,
    padding: 3,
    backgroundColor: "#f9a8d4",
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 60,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    color: "#1e293b",
  },
  usernameText: {
    fontSize: 14,
    color: "#64748b",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fce7f3",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
  },
  statLabel: {
    color: "#475569",
    fontSize: 13,
    marginTop: 4,
  },
  activitiesContainer: {
    marginTop: 30,
  },
  activitiesHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  activityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  activityLabel: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
  activityValue: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    backgroundColor: "white",
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#ECF098",
  },
  toggleText: {
    color: "black",
    fontWeight: "500",
    fontSize: 15,
  },
  toggleTextActive: {
    color: "black",
    fontWeight: "bold",
  },
});

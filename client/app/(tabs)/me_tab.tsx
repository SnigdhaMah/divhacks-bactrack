import * as React from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

// ✅ Added WebSocket + UI additions
export default function MeTab() {
  const [ratingData, setRatingData] = React.useState({
    rating: 0,
    current_length: 0,
    baseline_length: 0,
    difference: 0,
    status: "poor",
  });

  const [stretchesDone] = React.useState(12); // stubbed
  const [activeTime] = React.useState("1h 45m"); // stubbed
  const [postureAlerts] = React.useState(3); // stubbed

  // WebSocket connection (example route)
  React.useEffect(() => {
    const ws = new WebSocket("ws://YOUR_SERVER_URL/RATING"); // replace with your server endpoint
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRatingData(data);
      } catch (err) {
        console.error("Invalid WebSocket data:", err);
      }
    };
    return () => ws.close();
  }, []);

  // -------------------- Existing chart code (UNCHANGED) --------------------
  const [tooltipPos, setTooltipPos] = React.useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
    label: "",
    index: 0,
  });

  const [timeRange, setTimeRange] =
    React.useState<"times" | "dates" | "years">("times");

  const chartData = {
    times: {
      labels: ["8 AM", "10 AM", "12 PM", "2 PM", "6 PM"],
      datasets: [{ data: [80, 100, 30, 60, 10] }],
    },
    dates: {
      labels: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5"],
      datasets: [{ data: [65, 85, 45, 90, 50] }],
    },
    years: {
      labels: ["Jan", "Feb", "March", "April", "May"],
      datasets: [{ data: [40, 55, 70, 85, 95] }],
    },
  };

  const data = chartData[timeRange];

  const handlePress = () => {
    setTooltipPos((prev) => ({ ...prev, visible: false }));
  };

  // -------------------- PAGE UI --------------------
  return (
    <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        <View style={styles.profilePicWrapper}>
          <MaterialCommunityIcons name="account" size={80} color="#000000" />
        </View>
        <Text style={styles.nameText}>Jane Doe</Text>
        <Text style={styles.usernameText}>@janedoe</Text>
      </View>

      {/* Stat Boxes */}
      <View style={styles.statsRow}>
        {/* Posture Score Box */}
        <View style={styles.statBox}>
          {ratingData.rating >= 80 ? (
            <MaterialCommunityIcons
              name="trending-up"
              size={28}
              color="#16a34a"
            />
          ) : (
            <MaterialCommunityIcons
              name="trending-down"
              size={28}
              color="#dc2626"
            />
          )}
          <Text style={styles.statValue}>{ratingData.rating}%</Text>
          <Text style={styles.statLabel}>Posture Score</Text>
        </View>

        {/* Stretches Done Box */}
        <View style={styles.statBox}>
          <FontAwesome5 name="heartbeat" size={28} color="#ef4444" />
          <Text style={styles.statValue}>{stretchesDone}</Text>
          <Text style={styles.statLabel}>Stretches Done</Text>
        </View>
      </View>

      {/* Chart Section (UNCHANGED CODE BELOW) */}
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
          <View style={styles.toggleContainer}>
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

          <LineChart
            data={data}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
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
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {tooltipPos.value}%
                    </Text>
                    <Text style={{ color: "white", fontSize: 12 }}>
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

          <Text style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
            Tap on any dot to see details. Tap elsewhere to hide.
          </Text>
        </View>
      </TouchableWithoutFeedback>

      {/* Today's Activities */}
      <View style={styles.activitiesContainer}>
        <Text style={styles.activitiesHeader}>Todays Activities</Text>

        <View style={styles.activityBox}>
          <MaterialCommunityIcons name="timer-sand" size={22} color="#f97316" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.activityLabel}>Active Time</Text>
            <Text style={styles.activityValue}>{activeTime}</Text>
          </View>
        </View>

        <View style={styles.activityBox}>
          <MaterialCommunityIcons name="alert" size={22} color="#dc2626" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.activityLabel}>Posture Alerts</Text>
            <Text style={styles.activityValue}>{postureAlerts}</Text>
          </View>
        </View>
      </View>
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
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: "pink",
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "white",
    fontWeight: "bold",
  },
});

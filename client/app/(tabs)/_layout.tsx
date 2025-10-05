import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#007aff", // Blue when active
        tabBarInactiveTintColor: "gray", // Gray when inactive
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          paddingTop: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "me_tab":
              iconName = "person";
              break;
            case "feed":
              iconName = "list";
              break;
            case "socials":
              iconName = "people";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="me_tab" options={{ title: "Me" }} />
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="socials" options={{ title: "Socials" }} />
    </Tabs>
  );
}

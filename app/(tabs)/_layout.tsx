import { Tabs } from "expo-router";
import { Home, CreditCard, Shield, Bell, User } from "lucide-react-native";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#14ed9e",
        tabBarInactiveTintColor: "#7e828d",
        tabBarLabelStyle: { fontFamily: "Manrope_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <Home size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <CreditCard size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <Shield size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <Bell size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : styles.inactiveIcon}>
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#15161d",
    borderTopWidth: 1,
    borderTopColor: "#24252e",
    height: 80,
    elevation: 0,
    paddingTop: 8,
  },
  activeIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(20, 237, 158, 0.1)",
  },
  inactiveIcon: {
    padding: 8,
  }
});

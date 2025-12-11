import { StyleSheet, Pressable } from "react-native";
import React, { useEffect, memo } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";

// Custom Tab Bar Button Component (same as before)
const TabBarButtonComponent = ({ children, onPress, accessibilityState }) => {
  const isFocused = accessibilityState?.selected;

  const bgProgress = useSharedValue(isFocused ? 1 : 0);
  const iconScale = useSharedValue(isFocused ? 1.12 : 1);
  const pressScale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  useEffect(() => {
    bgProgress.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    iconScale.value = withTiming(isFocused ? 1.12 : 1, { duration: 300 });
  }, [isFocused]);

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: bgProgress.value,
    transform: [{ scale: interpolate(bgProgress.value, [0, 1], [0.8, 1]) }],
  }));

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value * pressScale.value }],
    opacity: pressOpacity.value,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.94, { damping: 15, stiffness: 250 });
    pressOpacity.value = withTiming(0.75, { duration: 90 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 250 });
    pressOpacity.value = withTiming(1, { duration: 120 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      android_ripple={{
        color: "#6200ee30",
        borderless: false,
        radius: 40,
        foreground: true,
      }}
    >
      <Animated.View style={[styles.tabContent, animatedWrapperStyle]}>
        {isFocused && (
          <Animated.View
            style={[styles.activeBackground, animatedBackgroundStyle]}
          />
        )}
        {children}
      </Animated.View>
    </Pressable>
  );
};

const TabBarButton = memo(TabBarButtonComponent);

const HRLayout = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          height: 65 + bottom,
          paddingBottom: bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "My Jobs",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "briefcase" : "briefcase-outline"}
              size={size}
              color={color}
            />
          ),
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="applicants"
        options={{
          title: "Applicants",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={size}
              color={color}
            />
          ),
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
          lazy: false,
        }}
      />
    </Tabs>
  );
};

export default HRLayout;

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeBackground: {
    position: "absolute",
    width: 55,
    height: 32,
    borderRadius: 25,
    backgroundColor: "#6200ee25",
  },
});

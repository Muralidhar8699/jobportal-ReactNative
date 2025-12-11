import React from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SimpleLoadingScreen = () => {
  // Simple animations only
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.7));
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <View style={[styles.container]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logo,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={64} color="#4b6bfb" />
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title]}>Job Portal</Text>

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: "#4b6bfb",
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [0.4, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle]}>Loading your app...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.5,
    color: "#000",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
});

export default SimpleLoadingScreen;

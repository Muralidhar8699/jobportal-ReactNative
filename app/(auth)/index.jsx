import {
  StyleSheet,
  View,
  Animated,
  Alert,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearLoginError } from "../../redux/slices/authslice";

const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const { isLoading, loginError } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Show error alert
  useEffect(() => {
    if (loginError) {
      Alert.alert("Login Failed", loginError);
      dispatch(clearLoginError());
    }
  }, [loginError]);

  const handleFocus = () => {
    setIsKeyboardFocused(true);
  };

  const handleBlur = () => {
    setIsKeyboardFocused(false);
  };

  // Handle login
  const handleLogin = () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    // Dispatch Redux action - navigation handled in Redux
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={isKeyboardFocused ? 80 : 0}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationPlaceholder}>
              <Ionicons name="person-circle" size={120} color="#6200ee" />
            </View>
            {/* Decorative shapes */}
            <View style={[styles.shape, styles.triangle]} />
            <View style={[styles.shape, styles.circle]} />
            <View style={[styles.shape, styles.square]} />
          </View>

          {/* Title */}
          <Text variant="headlineLarge" style={styles.title}>
            Login
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Welcome back to Recruitment Portal
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button - Shows in original position when keyboard closed */}
          {!isKeyboardFocused && (
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Login
            </Button>
          )}

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text variant="bodyMedium" style={styles.dividerText}>
              OR
            </Text>
            <View style={styles.divider} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text variant="bodyMedium" style={styles.registerText}>
              New to Recruitment Portal?{" "}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text variant="bodyMedium" style={styles.registerLink}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

      {/* Sticky Login Button - Only shows when keyboard is focused */}
      {isKeyboardFocused && (
        <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.loginButton, { width: "88%", alignSelf: "center" }]}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>
        </KeyboardStickyView>
      )}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginBottom: 20,
    position: "relative",
  },
  illustrationPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  shape: {
    position: "absolute",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 35,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF6B35",
    bottom: 40,
    left: 60,
    transform: [{ rotate: "15deg" }],
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#6200ee",
    bottom: 50,
    right: 50,
  },
  square: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: "#03dac6",
    top: 30,
    left: 40,
    transform: [{ rotate: "45deg" }],
  },
  title: {
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: "#6200ee",
    fontWeight: "600",
  },
});

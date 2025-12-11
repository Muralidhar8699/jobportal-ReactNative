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
import { registerUser, clearRegisterError } from "../../redux/slices/authslice";

const Register = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const { isLoading, registerError } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (registerError) {
      Alert.alert("Registration Failed", registerError);
      dispatch(clearRegisterError());
    }
  }, [registerError]);

  const handleFocus = () => {
    setIsKeyboardFocused(true);
  };

  const handleBlur = () => {
    setIsKeyboardFocused(false);
  };

  // Handle registration
  const handleRegister = () => {
    // Validation
    if (!name.trim() || name.length < 3) {
      Alert.alert("Error", "Name must be at least 3 characters");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (!phone.trim() || !/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Error", "Phone must be 10 digits");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Dispatch Redux action - navigation handled in Redux
    dispatch(
      registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      })
    );
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
              <Ionicons name="person-add" size={120} color="#6200ee" />
            </View>
            {/* Decorative shapes */}
            <View style={[styles.shape, styles.triangle]} />
            <View style={[styles.shape, styles.circle]} />
            <View style={[styles.shape, styles.square]} />
          </View>

          {/* Header */}
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Register as Job Applicant
          </Text>

          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>

          {/* Email Field */}
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

          {/* Phone Field */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Phone Number (10 digits)"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
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

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <RNTextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={18} color="#6200ee" />
            <Text variant="bodySmall" style={styles.infoText}>
              Only job seekers can register. HR/Admin accounts are created by
              administrators.
            </Text>
          </View>

          {/* Register Button - Shows in original position when keyboard closed */}
          {!isKeyboardFocused && (
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Register as Applicant
            </Button>
          )}

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text variant="bodyMedium" style={styles.loginText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text variant="bodyMedium" style={styles.link}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

      {/* Sticky Register Button - Only shows when keyboard is focused */}
      {isKeyboardFocused && (
        <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.button, { width: "88%", alignSelf: "center" }]}
            contentStyle={styles.buttonContent}
          >
            Register as Applicant
          </Button>
        </KeyboardStickyView>
      )}
    </View>
  );
};

export default Register;

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
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0e6ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 8,
    color: "#6200ee",
    flex: 1,
    fontSize: 12,
  },
  button: {
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666",
  },
  link: {
    color: "#6200ee",
    fontWeight: "600",
  },
});

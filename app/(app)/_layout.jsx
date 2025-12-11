import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useSelector } from "react-redux";
import { Provider } from "react-native-paper";

const HomeLayout = () => {
  const { isLoggedIn, isLoading, role } = useSelector((state) => state.auth);
  const getInitialRoute = () => {
    if (!isLoggedIn) {
      return "(auth)";
    }
    switch (role) {
      case "admin":
        return "(admin)";
      case "hr":
        return "(hr)";
      case "applicant":
        return "(applicant)";
      default:
        return "(auth)";
    }
  };
  return (
    <Provider>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(hr)" />
        <Stack.Screen name="(applicant)" />
      </Stack>
    </Provider>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({});

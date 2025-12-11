import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const JobLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="[jobId]" />
    </Stack>
  );
};

export default JobLayout;

const styles = StyleSheet.create({});

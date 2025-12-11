import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  Avatar,
  Card,
  List,
  Divider,
  IconButton,
  Button,
  Surface,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logoutUser } from "../../../redux/slices/authslice";

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { bottom } = useSafeAreaInsets();

  const { user, token } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);

  // Statistics state
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
  });

  useEffect(() => {
    // Calculate statistics from jobs data
    if (jobs && jobs.length > 0) {
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(
        (job) => job.status === "published"
      ).length;
      // You'll need to fetch these from your applications API
      const totalApplications = 0; // Replace with actual data
      const shortlisted = 0; // Replace with actual data

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
      });
    }
  }, [jobs]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          dispatch(logoutUser());
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Update Profile settings");
    // router.push("/(hr)/profile/edit");
  };

  const getInitials = (name) => {
    if (!name) return "HR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Statistics cards data
  const statisticsData = [
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: "briefcase-outline",
      color: "#6200ee",
      bgColor: "#f0e6ff",
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: "checkmark-circle-outline",
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: "people-outline",
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted,
      icon: "star-outline",
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
  ];

  // Settings options
  const settingsOptions = [
    {
      title: "My Jobs",
      description: "View and manage job postings",
      icon: "briefcase",
      onPress: () => router.push("/(hr)/jobs"),
    },
    {
      title: "Applications",
      description: "Review applicant submissions",
      icon: "file-document-multiple",
      onPress: () => router.push("/(hr)/applicants"),
    },
    {
      title: "Notifications",
      description: "Manage notification preferences",
      icon: "bell",
      onPress: () => Alert.alert("Coming Soon", "Notifications settings"),
    },
    {
      title: "Change Password",
      description: "Update your password",
      icon: "lock",
      onPress: () => Alert.alert("Coming Soon", "Update Profile settings"),
      // onPress: () => router.push("/(hr)/profile/change-password"),
    },
    {
      title: "Help & Support",
      description: "Get help or contact support",
      icon: "help-circle",
      onPress: () => Alert.alert("Help", "Contact support@recruitment.com"),
    },
    {
      title: "About",
      description: "App version and information",
      icon: "information",
      onPress: () => Alert.alert("About", "Recruitment Portal v1.0.0"),
    },
  ];

  return (
    <View style={[styles.container]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
          headerRight: () => (
            <IconButton
              icon="pencil"
              size={20}
              iconColor="#6200ee"
              onPress={handleEditProfile}
            />
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={getInitials(user?.name || user?.email)}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.userName}>
                  {user?.name || "HR Manager"}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email || "hr@company.com"}
                </Text>
                <View style={styles.roleChip}>
                  <MaterialCommunityIcons
                    name="account-tie"
                    size={14}
                    color="#6200ee"
                  />
                  <Text variant="bodySmall" style={styles.roleText}>
                    {user?.role || "HR Manager"}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            {statisticsData.map((stat, index) => (
              <Surface key={index} style={styles.statCard} elevation={1}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: stat.bgColor },
                  ]}
                >
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stat.value}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  {stat.label}
                </Text>
              </Surface>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Settings
          </Text>
          <Card style={styles.settingsCard}>
            {settingsOptions.map((option, index) => (
              <View key={index}>
                <List.Item
                  title={option.title}
                  description={option.description}
                  left={(props) => (
                    <List.Icon {...props} icon={option.icon} color="#6200ee" />
                  )}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-right" color="#999" />
                  )}
                  onPress={option.onPress}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                />
                {index < settingsOptions.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonLabel}
          buttonColor="#ef4444"
        >
          Logout
        </Button>

        {/* App Version */}
        <Text variant="bodySmall" style={styles.versionText}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#6200ee",
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: "700",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    color: "#6b7280",
    marginBottom: 12,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: "#6200ee",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    color: "#6b7280",
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  listDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
  divider: {
    marginHorizontal: 16,
  },
  logoutButton: {
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 6,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 20,
    marginBottom: 10,
  },
});

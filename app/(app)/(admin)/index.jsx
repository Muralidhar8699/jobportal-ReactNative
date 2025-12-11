import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  Divider,
} from "react-native-paper";
import { logoutUser } from "../../../redux/slices/authslice";
import {
  fetchDashboardStats,
  clearError,
} from "../../../redux/slices/adminslice";

const AdminDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  const {
    stats,
    quickStats,
    topJobs,
    topSkills,
    topHRs,
    recentActivities,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const { bottom } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchDashboardStats(token));
  }, [token]);

  useEffect(() => {
    if (error) setTimeout(() => dispatch(clearError()), 3000);
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardStats(token));
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  /** Convert stats object → array with dynamic icons */
  const statsArray = stats
    ? Object.entries(stats).map(([key, value]) => {
        const iconMap = {
          totalJobs: "briefcase-outline",
          totalUsers: "people-outline",
          totalHRs: "business-outline",
          totalApplications: "document-text-outline",
          interviews: "videocam-outline",
          hires: "checkmark-circle-outline",
        };
        return {
          key,
          number: value,
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          icon: iconMap[key] || "stats-chart-outline",
        };
      })
    : [];

  /** Quick Stats Row Data with icons */
  const quickStatsData = [
    {
      number: quickStats?.jobsThisMonth || 0,
      label: "Jobs This Month",
      icon: "briefcase-outline",
    },
    {
      number: quickStats?.applicationsThisWeek || 0,
      label: "Apps This Week",
      icon: "document-text-outline",
    },
    {
      number: quickStats?.shortlistedToday || 0,
      label: "Shortlisted Today",
      icon: "checkmark-circle-outline",
    },
    {
      number: quickStats?.interviewsScheduled || 0,
      label: "Interviews",
      icon: "videocam-outline",
    },
  ];

  // ================================
  // ⭐ LOADING SCREEN
  // ================================
  if (loading && !stats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Admin Dashboard",
            headerStyle: { backgroundColor: "#6200ee" },
            headerTintColor: "#fff",
            headerShadowVisible: false,
          }}
        />
        <Ionicons name="analytics-outline" size={64} color="#6200ee" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#6200ee" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <Text variant="headlineSmall" style={styles.headerGreeting}>
                Hi, {user?.name?.split(" ")[0] || "Admin"} 👋
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                Admin Dashboard
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerRight} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* -------------------------------- */}
      {/* MAIN SCROLL */}
      {/* -------------------------------- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6200ee"]}
          />
        }
      >
        {/* HERO */}
        <View style={styles.heroSection}>
          <Text variant="titleMedium" style={styles.heroTitle}>
            Platform Overview
          </Text>
          <Text variant="bodyMedium" style={styles.heroSubtitle}>
            Monitor hiring performance & insights
          </Text>
        </View>

        {/* -------------------------------- */}
        {/* KEY METRICS - 2x2 GRID WITH GAPS */}
        {/* -------------------------------- */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Key Metrics
          </Text>

          <View style={styles.statsGrid}>
            {statsArray.slice(0, 4).map((item, index) => (
              <Card key={index} style={styles.statCard} elevation={4}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.statIcon}>
                    <Ionicons name={item.icon} size={24} color="#6200ee" />
                  </View>
                  <Text style={styles.statValue}>{item.number}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <ProgressBar
                    progress={0.7 + index * 0.05}
                    color="#6200ee"
                    style={styles.progress}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* -------------------------------- */}
        {/* QUICK STATS - HORIZONTAL SCROLL */}
        {/* -------------------------------- */}
        {quickStats && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Activity
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickScrollContent}
            >
              {quickStatsData.map((item, index) => (
                <View key={index} style={styles.quickCard}>
                  <View style={styles.quickIcon}>
                    <Ionicons name={item.icon} size={24} color="#6200ee" />
                  </View>
                  <Text style={styles.quickNumber}>{item.number}</Text>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* -------------------------------- */}
        {/* TOP JOBS - IMPROVED LAYOUT */}
        {/* -------------------------------- */}
        {topJobs?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Top Jobs
              </Text>
              <Button compact mode="text" style={styles.seeAllBtn}>
                See All
              </Button>
            </View>

            <View style={styles.listContainer}>
              {topJobs.slice(0, 3).map((item, index) => (
                <Card key={index} style={styles.listCard}>
                  <Card.Content style={styles.listCardContent}>
                    <View style={styles.rankContainer}>
                      <Text style={styles.rank}>#{index + 1}</Text>
                    </View>
                    <View style={styles.listMainContent}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.listSubtitle}>
                        {item.applicationsCount || 0} Applications
                      </Text>
                    </View>
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color="#6200ee"
                    />
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* -------------------------------- */}
        {/* TOP SKILLS */}
        {/* -------------------------------- */}
        {topSkills?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Top Skills
              </Text>
              <Button compact mode="text" style={styles.seeAllBtn}>
                See All
              </Button>
            </View>

            <View style={styles.skillsWrap}>
              {topSkills.slice(0, 8).map((item, index) => (
                <Chip key={index} style={styles.skillChip} elevation={2}>
                  {item.skill}
                  <Text style={styles.chipCount}> ({item.count})</Text>
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* -------------------------------- */}
        {/* TOP HRS - COMPLETELY REDESIGNED */}
        {/* -------------------------------- */}
        {topHRs?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Top HRs
              </Text>
              <Button compact mode="text" style={styles.seeAllBtn}>
                See All
              </Button>
            </View>

            <View style={styles.hrContainer}>
              {topHRs.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.hrCard}>
                  <View style={styles.hrAvatar}>
                    <Avatar.Text
                      label={item.name.charAt(0).toUpperCase()}
                      size={48}
                      style={styles.hrAvatarStyle}
                    />
                  </View>
                  <View style={styles.hrContent}>
                    <Text style={styles.hrName}>{item.name}</Text>
                    <Text style={styles.hrJobs}>
                      {item.jobsPosted} Jobs Posted
                    </Text>
                  </View>
                  <View style={styles.hrRankContainer}>
                    <Text style={styles.hrRank}>#{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* -------------------------------- */}
        {/* RECENT ACTIVITIES */}
        {/* -------------------------------- */}
        {recentActivities?.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Activities
            </Text>

            {recentActivities.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.activityRow}>
                <Avatar.Text
                  label={item.applicantName.charAt(0)}
                  size={44}
                  style={styles.activityAvatar}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityName}>{item.applicantName}</Text>
                  <Text style={styles.activityJob}>{item.jobTitle}</Text>
                  <Text style={styles.activityStatus}>{item.status}</Text>
                </View>
                <View style={styles.activityDateContainer}>
                  <Text style={styles.activityDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={styles.actionsRow}>
          <Button
            mode="contained"
            icon="briefcase-outline"
            style={styles.actionBtn}
          >
            View Jobs
          </Button>
          <Button
            mode="outlined"
            icon="account-group-outline"
            style={styles.actionBtn}
          >
            Applications
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;

/* ===================================================
   IMPROVED STYLES
=================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9ff" },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6200ee",
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  headerLeft: { marginLeft: 16 },
  headerGreeting: { color: "#fff", fontWeight: "700" },
  headerSubtitle: { color: "#e8d9ff" },
  headerRight: { marginRight: 16, padding: 6 },

  // Hero
  heroSection: {
    backgroundColor: "#6200ee",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 24 },
  heroSubtitle: { color: "#e8d9ff", marginTop: 4 },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: 20,
    fontSize: 20,
    color: "#1a1a1a",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllBtn: {
    paddingHorizontal: 0,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // modern spacing
  },

  statCard: {
    flexBasis: "48%", // auto responsive width
    flexGrow: 1,
    borderRadius: 16,
    backgroundColor: "#fff",

    // soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardContent: {
    paddingVertical: 20,
    paddingHorizontal: 0,
    alignItems: "center",
  },
  statIcon: {
    backgroundColor: "#efe9ff",
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  progress: {
    height: 6,
    borderRadius: 4,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },

  // Quick Stats
  quickScrollContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  quickCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIcon: {
    backgroundColor: "#efe9ff",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickNumber: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  quickLabel: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  // List Items
  listContainer: {
    gap: 12,
  },
  listCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  listCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6200ee10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rank: {
    fontWeight: "900",
    color: "#6200ee",
    fontSize: 16,
  },
  listMainContent: {
    flex: 1,
  },
  listTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  listSubtitle: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },

  // Skills
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillChip: {
    borderWidth: 1,
    borderColor: "#6200ee",
    backgroundColor: "#fef7ff",
    height: 36,
  },
  chipCount: {
    color: "#6200ee",
    fontWeight: "700",
    fontSize: 12,
  },

  // Top HRs - NEW DESIGN
  hrContainer: {
    gap: 14,
  },
  hrCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  hrAvatar: {
    marginRight: 14,
  },
  hrAvatarStyle: {
    backgroundColor: "#6200ee",
  },
  hrContent: {
    flex: 1,
  },
  hrName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  hrJobs: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  hrRankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
  },
  hrRank: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  // Activities
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityAvatar: {
    marginRight: 14,
    backgroundColor: "#6200ee",
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  activityJob: {
    fontWeight: "700",
    color: "#6200ee",
    marginBottom: 2,
    fontSize: 15,
  },
  activityStatus: {
    color: "#0a8f48",
    fontWeight: "600",
    fontSize: 14,
  },
  activityDateContainer: {
    alignItems: "flex-end",
  },
  activityDate: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },

  // Action Buttons
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
    backgroundColor: "#fff",
  },
  actionBtn: {
    flex: 1,
    maxWidth: 160,
  },
});

import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, Card, Chip, ProgressBar, Button } from "react-native-paper";
import { fetchJobStats } from "../../../redux/slices/jobSlice";

const HrDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { stats, loading } = useSelector((state) => state.jobs);
  const { bottom } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    dispatch(fetchJobStats(token));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Statistics Cards Data
  const statsCards = [
    {
      id: 1,
      title: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: "briefcase-outline",
      color: "#6200ee",
      bgColor: "#f0e6ff",
      progress: 1,
    },
    {
      id: 2,
      title: "Published",
      value: stats?.publishedJobs || 0,
      icon: "checkmark-circle",
      color: "#00c853",
      bgColor: "#e8f5e9",
      progress: stats?.totalJobs ? stats.publishedJobs / stats.totalJobs : 0,
    },
    {
      id: 3,
      title: "Applications",
      value: stats?.totalApplications || 0,
      icon: "people",
      color: "#ff6f00",
      bgColor: "#fff3e0",
      progress: 0.85,
    },
    {
      id: 4,
      title: "Drafts",
      value: stats?.draftJobs || 0,
      icon: "document-text",
      color: "#0091ea",
      bgColor: "#e1f5fe",
      progress: stats?.totalJobs ? stats.draftJobs / stats.totalJobs : 0,
    },
  ];

  return (
    <View style={[styles.container]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#6200ee",
          },
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <Text variant="headlineSmall" style={styles.headerGreeting}>
                Hi, {user?.name?.split(" ")[0] || "Guest"} 👋
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                HR Manager Dashboard
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerRight}
              onPress={() => router.push("/hr/profile")}
            >
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={24} color="#6200ee" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

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
        {/* Hero Section with Gradient */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text variant="titleMedium" style={styles.heroTitle}>
              Welcome Back!
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              Here's what's happening with your recruitment
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat) => (
              <Card key={stat.id} style={styles.statCard} elevation={2}>
                <Card.Content style={styles.statCardContent}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: stat.bgColor },
                    ]}
                  >
                    <Ionicons name={stat.icon} size={28} color={stat.color} />
                  </View>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {loading ? "..." : stat.value}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statTitle}>
                    {stat.title}
                  </Text>
                  <ProgressBar
                    progress={stat.progress}
                    color={stat.color}
                    style={styles.progressBar}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              icon="plus-circle"
              onPress={() => router.push("/(hr)/jobs/create")}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Create Job
            </Button>
            <Button
              mode="outlined"
              icon="briefcase"
              onPress={() => router.push("/(hr)/jobs")}
              style={styles.outlinedButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.outlinedButtonLabel}
            >
              View Jobs
            </Button>
          </View>
          <View style={styles.actionsRow}>
            <Button
              mode="outlined"
              icon="email"
              onPress={() => router.push("/(hr)/applicants")}
              style={styles.outlinedButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.outlinedButtonLabel}
            >
              Applications
            </Button>
            <Button
              mode="outlined"
              icon="chart-bar"
              onPress={() => router.push("/(hr)/reports")}
              style={styles.outlinedButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.outlinedButtonLabel}
            >
              Reports
            </Button>
          </View>
        </View>

        {/* Top Skills */}
        {stats?.topSkills && stats.topSkills.length > 0 && (
          <View style={styles.section}>
            <Card style={styles.skillsCard} elevation={2}>
              <Card.Title
                title="Top Skills in Demand"
                titleVariant="titleMedium"
                right={(props) => (
                  <Button
                    mode="text"
                    compact
                    onPress={() => router.push("/(hr)/skills")}
                  >
                    See All
                  </Button>
                )}
              />
              <Card.Content>
                <View style={styles.skillsContainer}>
                  {stats.topSkills.slice(0, 10).map((item, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      style={styles.skillChip}
                      textStyle={styles.skillChipText}
                      icon={() => (
                        <View style={styles.skillBadge}>
                          <Text variant="labelSmall" style={styles.skillCount}>
                            {item.count}
                          </Text>
                        </View>
                      )}
                    >
                      {item.skill}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {stats?.topJobsByApplications &&
          stats.topJobsByApplications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Top Performing Jobs
                </Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.push("/(hr)/jobs")}
                >
                  View All
                </Button>
              </View>
              {stats.topJobsByApplications.map((job, index) => (
                <Card
                  key={index}
                  style={styles.jobStatCard}
                  elevation={1}
                  onPress={() =>
                    router.push(`/(hr)/jobs/${job.jobId}/applications`)
                  }
                >
                  <Card.Content style={styles.jobStatContent}>
                    <View style={styles.jobStatLeft}>
                      <View style={styles.jobStatIconContainer}>
                        <MaterialCommunityIcons
                          name="briefcase"
                          size={24}
                          color="#6200ee"
                        />
                      </View>
                      <View style={styles.jobStatInfo}>
                        <Text
                          variant="titleMedium"
                          style={styles.jobStatTitle}
                          numberOfLines={1}
                        >
                          {job.jobTitle}
                        </Text>
                        <View style={styles.jobStatMetrics}>
                          <Chip
                            mode="flat"
                            compact
                            style={styles.applicantChip}
                            textStyle={styles.applicantChipText}
                          >
                            {job.applicantCount} Applicant
                            {job.applicantCount !== 1 ? "s" : ""}
                          </Chip>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#999" />
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}

        {/* Activity Summary Card */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <Card style={styles.activityCard} elevation={2}>
            <Card.Title
              title="Recent Activity"
              titleVariant="titleMedium"
              left={(props) => (
                <View style={styles.activityIconContainer}>
                  <Ionicons name="time" size={24} color="#6200ee" />
                </View>
              )}
            />
            <Card.Content>
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="clipboard-text-clock-outline"
                  size={56}
                  color="#ccc"
                />
                <Text variant="bodyMedium" style={styles.emptyStateText}>
                  Activity tracking coming soon
                </Text>
                <Text variant="bodySmall" style={styles.emptyStateSubtext}>
                  Your recent actions will be displayed here
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(hr)/jobs/create")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HrDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerGreeting: {
    color: "#fff",
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#e1bee7",
    marginTop: 2,
  },
  headerRight: {
    marginRight: 16,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Hero Section
  heroSection: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  heroContent: {
    gap: 8,
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  heroSubtitle: {
    color: "#e1bee7",
  },

  // Section
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Statistics Cards
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  statCardContent: {
    alignItems: "flex-start",
    paddingVertical: 20,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statTitle: {
    color: "#666",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#f0f0f0",
  },

  // Quick Actions
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#6200ee",
  },
  outlinedButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: "#6200ee",
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  outlinedButtonLabel: {
    color: "#6200ee",
    fontSize: 15,
    fontWeight: "600",
  },

  // Skills Card
  skillsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#f0e6ff",
    borderColor: "#6200ee",
  },
  skillChipText: {
    color: "#6200ee",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },
  skillBadge: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  skillCount: {
    color: "#fff",
    fontWeight: "700",
  },

  // Job Stats
  jobStatCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
  },
  jobStatContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  jobStatLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  jobStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  jobStatInfo: {
    flex: 1,
    gap: 8,
  },
  jobStatTitle: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  jobStatMetrics: {
    flexDirection: "row",
    gap: 8,
  },
  applicantChip: {
    backgroundColor: "#e8f5e9",
    height: 28,
  },
  applicantChipText: {
    color: "#00c853",
    fontSize: 12,
    fontWeight: "600",
  },

  // Activity Card
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyStateText: {
    color: "#999",
    textAlign: "center",
    fontWeight: "500",
  },
  emptyStateSubtext: {
    color: "#bbb",
    textAlign: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});

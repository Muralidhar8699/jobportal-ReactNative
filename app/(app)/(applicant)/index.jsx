import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { Text, Button, Card, Chip, ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

const ApplicantDashboard = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { top, bottom } = useSafeAreaInsets();

  // Mock data - Replace with actual API data
  const stats = {
    totalApplications: 12,
    shortlisted: 3,
    rejected: 2,
    pending: 7,
    resumeScore: 85,
  };

  const recentApplications = [
    {
      id: 1,
      jobTitle: "React Native Developer",
      company: "Tech Corp",
      appliedDate: "2025-12-05",
      status: "shortlisted",
      score: 85,
      location: "Bangalore",
    },
    {
      id: 2,
      jobTitle: "Frontend Developer",
      company: "Web Solutions",
      appliedDate: "2025-12-03",
      status: "reviewed",
      score: 72,
      location: "Remote",
    },
    {
      id: 3,
      jobTitle: "Mobile App Developer",
      company: "StartupXYZ",
      appliedDate: "2025-12-01",
      status: "pending",
      score: 90,
      location: "Mumbai",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FF9800",
      reviewed: "#2196F3",
      shortlisted: "#4CAF50",
      interview: "#9C27B0",
      selected: "#4CAF50",
      rejected: "#F44336",
    };
    return colors[status] || "#999";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "time-outline",
      reviewed: "eye-outline",
      shortlisted: "checkmark-circle-outline",
      interview: "calendar-outline",
      selected: "trophy-outline",
      rejected: "close-circle-outline",
    };
    return icons[status] || "document-text-outline";
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <Text variant="titleLarge" style={styles.headerGreeting}>
                Hi, {user?.name?.split(" ")[0] || "Guest"}
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerRight}
              onPress={() => router.push("/applicant/profile")}
            >
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={24} color="#6200ee" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resume Score Card */}
        <Card style={styles.scoreCard}>
          <Card.Content>
            <View style={styles.scoreHeader}>
              <View>
                <Text variant="titleMedium" style={styles.scoreTitle}>
                  Resume Score
                </Text>
                <Text variant="bodySmall" style={styles.scoreSubtitle}>
                  Based on your profile completeness
                </Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text variant="headlineMedium" style={styles.scoreValue}>
                  {stats.resumeScore}
                </Text>
                <Text variant="bodySmall" style={styles.scoreMax}>
                  /100
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={stats.resumeScore / 100}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="briefcase-outline" size={28} color="#6200ee" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats.totalApplications}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Applied
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: "#F0FFF4" }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#4CAF50"
              />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats.shortlisted}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Shortlisted
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: "#FFFBEB" }]}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="time-outline" size={28} color="#FF9800" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats.pending}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="compass"
            onPress={() => router.push("/applicant/explore")}
            style={styles.quickButton}
            contentStyle={styles.buttonContent}
          >
            Browse Jobs
          </Button>
          <Button
            mode="outlined"
            icon="cloud-upload"
            onPress={() => console.log("Upload Resume")}
            style={styles.quickButton}
            contentStyle={styles.buttonContent}
          >
            Upload Resume
          </Button>
        </View>

        {/* Recent Applications */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Applications
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/applicant/applications")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentApplications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Applications Yet
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtitle}>
                Start browsing jobs and apply
              </Text>
            </Card.Content>
          </Card>
        ) : (
          recentApplications.map((application) => (
            <Card key={application.id} style={styles.applicationCard}>
              <Card.Content>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationInfo}>
                    <Text variant="titleMedium" style={styles.jobTitle}>
                      {application.jobTitle}
                    </Text>
                    <Text variant="bodyMedium" style={styles.company}>
                      {application.company}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#999"
                      />
                      <Text variant="bodySmall" style={styles.location}>
                        {application.location}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.appliedDate}>
                      Applied: {application.appliedDate}
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <View style={styles.scoreCircle}>
                      <Text variant="headlineSmall" style={styles.scoreNumber}>
                        {application.score}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.scoreLabel}>
                      Match Score
                    </Text>
                  </View>
                </View>
                <View style={styles.applicationFooter}>
                  <Chip
                    icon={() => (
                      <Ionicons
                        name={getStatusIcon(application.status)}
                        size={16}
                        color={getStatusColor(application.status)}
                      />
                    )}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: `${getStatusColor(
                          application.status
                        )}15`,
                      },
                    ]}
                    textStyle={[
                      styles.statusText,
                      { color: getStatusColor(application.status) },
                    ]}
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </Chip>
                  <TouchableOpacity
                    onPress={() => console.log("View Details", application.id)}
                  >
                    <Text style={styles.viewDetailsText}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ApplicantDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerGreeting: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerRight: {
    marginRight: 16,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scoreCard: {
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: "#fff",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreTitle: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  scoreSubtitle: {
    color: "#666",
    marginTop: 4,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreValue: {
    fontWeight: "700",
    color: "#4CAF50",
  },
  scoreMax: {
    color: "#999",
    marginLeft: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statNumber: {
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 8,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  viewAllText: {
    color: "#6200ee",
    fontWeight: "600",
  },
  emptyCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: "#fff",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#999",
    marginTop: 8,
  },
  applicationCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    paddingRight: 12,
  },
  jobTitle: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  company: {
    color: "#666",
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  location: {
    color: "#999",
    marginLeft: 4,
  },
  appliedDate: {
    color: "#999",
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontWeight: "700",
    color: "#6200ee",
  },
  scoreLabel: {
    color: "#666",
    marginTop: 4,
    fontSize: 10,
  },
  applicationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusChip: {
    height: 32,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  viewDetailsText: {
    color: "#6200ee",
    fontWeight: "600",
  },
});

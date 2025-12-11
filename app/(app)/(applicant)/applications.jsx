import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Text,
  Button,
  Card,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import {
  fetchMyApplications,
  withdrawApplication,
  clearError,
  clearSuccess,
} from "../../../redux/slices/applicationSlice";
import { Stack } from "expo-router";

const Applications = () => {
  const dispatch = useDispatch();
  const { myApplications, pagination, loading, error, success } = useSelector(
    (state) => state.applications
  );
  const { token } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const statusConfig = {
    pending: { label: "Applied", color: "#FFA726", textColor: "white" },
    reviewed: { label: "Reviewed", color: "#FF9800", textColor: "white" },
    shortlisted: { label: "Shortlisted", color: "#4CAF50", textColor: "white" },
    interview_scheduled: {
      label: "Interview Scheduled",
      color: "#1976D2",
      textColor: "white",
    },
    selected: { label: "Selected", color: "#2E7D32", textColor: "white" },
    rejected: { label: "Rejected", color: "#F44336", textColor: "white" },
    withdrawn: { label: "Withdrawn", color: "#9E9E9E", textColor: "white" },
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchMyApplications({ page: 1, limit: 10, token }));
    }
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch, token]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(clearError());
    await dispatch(fetchMyApplications({ page: 1, limit: 10, token }));
    setPage(1);
    setRefreshing(false);
  }, [dispatch, token]);

  const loadMore = () => {
    if (!loading && pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(fetchMyApplications({ page: nextPage, limit: 10, token }));
    }
  };

  const handleWithdraw = (applicationId) => {
    Alert.alert(
      "Withdraw Application",
      "Are you sure you want to withdraw this application?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () =>
            dispatch(withdrawApplication({ applicationId, token })),
        },
      ]
    );
  };

  const handleApplicationPress = (application) => {
    // TODO: build detailed view screen later (status timeline + resume link)
    // e.g. router.push(`/applications/${application._id}`);
  };

  const renderApplicationCard = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.pending;

    return (
      <Card
        style={styles.card}
        mode="contained"
        onPress={() => handleApplicationPress(item)}
      >
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.jobTitle}>
              {item.job?.title || "Job Title"}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: status.color }]}
              textStyle={{ color: status.textColor, fontSize: 12 }}
            >
              {status.label}
            </Chip>
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall">
              Applied:{" "}
              {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
            </Text>
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <Text variant="bodySmall" style={styles.updatedText}>
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall">
              Experience: {item.experience ?? 0} yrs
            </Text>
            {/* If you re-add scoring backend fields later, show them here */}
            {/* <Text variant="bodySmall">
              Resume Score: {item.resumeScore ?? "N/A"}/100
            </Text> */}
          </View>

          {item.notes && (
            <>
              <Divider style={styles.divider} />
              <Text
                variant="bodySmall"
                style={styles.notesText}
                numberOfLines={3}
              >
                Notes: {item.notes}
              </Text>
            </>
          )}
        </Card.Content>

        <Card.Actions>
          {item.status !== "withdrawn" &&
            item.status !== "rejected" &&
            item.status !== "selected" && (
              <IconButton
                icon="close-circle-outline"
                iconColor="#F44336"
                size={24}
                onPress={() => handleWithdraw(item._id)}
              />
            )}
        </Card.Actions>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Applications Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        You haven't applied to any jobs yet. Start applying to see your
        applications here.
      </Text>
      <Button
        mode="contained"
        onPress={handleRefresh}
        loading={loading}
        style={styles.emptyButton}
      >
        Refresh
      </Button>
    </View>
  );

  if (loading && myApplications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerShown: true, headerTitle: "My Applications" }}
      />

      <FlatList
        data={myApplications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && myApplications.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator />
              <Text style={styles.footerText}>
                Loading more applications...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {success && (
        <Card style={styles.successCard}>
          <Card.Content>
            <Text style={styles.successText}>{success}</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobTitle: { flex: 1, fontWeight: "bold", marginRight: 8 },
  statusChip: { alignSelf: "flex-start" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  updatedText: { color: "#4CAF50" },
  divider: { marginVertical: 8 },
  notesText: { color: "#1976D2", fontStyle: "italic" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { textAlign: "center", marginBottom: 16 },
  emptySubtitle: { textAlign: "center", color: "#666", marginBottom: 24 },
  emptyButton: { marginTop: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 16 },
  footer: { padding: 16, alignItems: "center" },
  footerText: { marginTop: 8 },
  errorCard: { margin: 16, backgroundColor: "#FFEBEE" },
  errorText: { color: "#D32F2F" },
  successCard: { margin: 16, backgroundColor: "#E8F5E8" },
  successText: { color: "#2E7D32" },
});

export default Applications;

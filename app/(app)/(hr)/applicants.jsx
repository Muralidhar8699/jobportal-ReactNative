// apps/(hr)/Applicants.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  Menu,
  Portal,
  Dialog,
} from "react-native-paper";
import {
  fetchAllApplications,
  updateApplicationStatus,
  downloadResume,
  clearError,
  clearSuccess,
  clearResumeUrl,
} from "../../../redux/slices/applicationSlice";
import { Stack } from "expo-router";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const statusConfig = {
  pending: { label: "Pending", color: "#FFA726", textColor: "white" },
  reviewed: { label: "Reviewed", color: "#FF9800", textColor: "white" },
  shortlisted: { label: "Shortlisted", color: "#4CAF50", textColor: "white" },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "#1976D2",
    textColor: "white",
  },
  selected: { label: "Selected", color: "#2E7D32", textColor: "white" },
  rejected: { label: "Rejected", color: "#F44336", textColor: "white" },
};

const Applicants = () => {
  const dispatch = useDispatch();
  const { applications, pagination, loading, error, success, resumeUrl } =
    useSelector((state) => state.applications);
  const { token } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState(null);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [statusFilterMenuVisible, setStatusFilterMenuVisible] = useState(false);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [notes, setNotes] = useState("");

  // Initial load
  useEffect(() => {
    if (token) {
      dispatch(
        fetchAllApplications({
          status: filterStatus || undefined,
          page: 1,
          limit: 10,
          token,
        })
      );
    }
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
      dispatch(clearResumeUrl());
    };
  }, [dispatch, token, filterStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(clearError());
    await dispatch(
      fetchAllApplications({
        status: filterStatus || undefined,
        page: 1,
        limit: 10,
        token,
      })
    );
    setPage(1);
    setRefreshing(false);
  }, [dispatch, token, filterStatus]);

  const loadMore = () => {
    if (!loading && pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(
        fetchAllApplications({
          status: filterStatus || undefined,
          page: nextPage,
          limit: 10,
          token,
        })
      );
    }
  };

  const openStatusDialog = (application) => {
    setSelectedAppForStatus(application);
    setSelectedStatus(application.status);
    setNotes(application.notes || "");
    setStatusMenuVisible(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedAppForStatus || !selectedStatus) {
      setStatusMenuVisible(false);
      return;
    }
    dispatch(
      updateApplicationStatus({
        applicationId: selectedAppForStatus._id,
        status: selectedStatus,
        notes,
        token,
      })
    );
    setStatusMenuVisible(false);
  };

  const handleViewResume = async (applicationId) => {
    const result = await dispatch(downloadResume({ applicationId, token }));
    if (result.meta.requestStatus === "fulfilled") {
      const url = result.payload.downloadUrl;
      if (url) Linking.openURL(url);
    }
  };

  const renderApplicationCard = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.pending;
    const applicantName =
      item.applicant?.name ||
      `${item.applicant?.firstName || ""} ${
        item.applicant?.lastName || ""
      }`.trim() ||
      "Applicant";

    return (
      <Card style={styles.card} mode="contained">
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.jobTitle}>
                {item.job?.title || "Job Title"}
              </Text>
              <Text variant="bodySmall" style={styles.companyText}>
                {item.job?.company?.name || "Company"}
              </Text>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: status.color }]}
              textStyle={{ color: status.textColor, fontSize: 12 }}
            >
              {status.label}
            </Chip>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          <View style={styles.metaRow}>
            <Text variant="bodySmall">Applicant: {applicantName}</Text>
            <Text variant="bodySmall">
              Experience: {item.experience ?? 0} yrs
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall">
              Applied: {new Date(item.appliedAt).toLocaleDateString()}
            </Text>
            {item.updatedAt && (
              <Text variant="bodySmall" style={styles.updatedText}>
                Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {item.notes && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.notesText}>
                Notes: {item.notes}
              </Text>
            </>
          )}
        </Card.Content>

        <Card.Actions style={styles.actionsRow}>
          <Button
            mode="outlined"
            onPress={() => handleViewResume(item._id)}
            icon="file-eye-outline"
          >
            View Resume
          </Button>
          <Button
            mode="contained"
            onPress={() => openStatusDialog(item)}
            icon="account-check-outline"
          >
            Update Status
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Applicants Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Once candidates start applying to your jobs, they will appear here with
        their latest status.
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

  if (loading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading applicants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerShown: true, headerTitle: "Applicants" }}
      />

      {/* Top filter bar */}
      <View style={styles.filterBar}>
        <Menu
          visible={statusFilterMenuVisible}
          onDismiss={() => setStatusFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusFilterMenuVisible(true)}
              icon="filter-variant"
            >
              {filterStatus
                ? `Status: ${
                    statusOptions.find((s) => s.value === filterStatus)?.label
                  }`
                : "Filter by Status"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setFilterStatus(null);
              setStatusFilterMenuVisible(false);
            }}
            title="All"
          />
          {statusOptions.map((opt) => (
            <Menu.Item
              key={opt.value}
              onPress={() => {
                setFilterStatus(opt.value);
                setStatusFilterMenuVisible(false);
              }}
              title={opt.label}
            />
          ))}
        </Menu>
        <IconButton icon="refresh" onPress={handleRefresh} />
      </View>

      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && applications.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator />
              <Text style={styles.footerText}>Loading more applicants...</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Error / success messages */}
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

      {/* Status update dialog */}
      <Portal>
        <Dialog
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
        >
          <Dialog.Title>Update Status</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              Choose new status for this applicant.
            </Text>
            <View style={styles.statusChipsRow}>
              {statusOptions.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                return (
                  <Chip
                    key={opt.value}
                    selected={isSelected}
                    onPress={() => setSelectedStatus(opt.value)}
                    style={[
                      styles.statusFilterChip,
                      isSelected && { backgroundColor: "#1976D2" },
                    ]}
                    textStyle={{ color: isSelected ? "white" : "#1976D2" }}
                  >
                    {opt.label}
                  </Chip>
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusMenuVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleUpdateStatus}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Applicants;

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobTitle: { fontWeight: "bold" },
  companyText: { color: "#666" },
  statusChip: { alignSelf: "flex-start" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  updatedText: { color: "#4CAF50" },
  divider: { marginVertical: 8 },
  notesText: { color: "#1976D2", fontStyle: "italic" },
  actionsRow: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: "space-between",
  },
  statusChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statusFilterChip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: "#1976D2",
    borderWidth: 1,
  },
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

import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Stack, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  Card,
  Chip,
  FAB,
  Button,
  IconButton,
  Divider,
  RadioButton,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  fetchAllJobs,
  deleteJobById,
  updateJobStatus,
  clearSuccess,
  clearError,
} from "../../../../redux/slices/jobSlice";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Skeleton Card Component
const SkeletonCard = () => (
  <Card style={styles.jobCard}>
    <Card.Content style={styles.cardContent}>
      <View style={styles.jobHeader}>
        <View style={[styles.skeleton, styles.skeletonTitle]} />
        <View style={[styles.skeleton, styles.skeletonChip]} />
      </View>
      <View style={[styles.skeleton, styles.skeletonDescription]} />
      <View style={[styles.skeleton, styles.skeletonDescription2]} />
      <View style={styles.jobMeta}>
        <View style={[styles.skeleton, styles.skeletonMeta]} />
        <View style={[styles.skeleton, styles.skeletonMeta]} />
        <View style={[styles.skeleton, styles.skeletonMeta]} />
      </View>
      <View style={styles.skillsContainer}>
        <View style={[styles.skeleton, styles.skeletonSkill]} />
        <View style={[styles.skeleton, styles.skeletonSkill]} />
        <View style={[styles.skeleton, styles.skeletonSkill]} />
      </View>
    </Card.Content>
  </Card>
);

const Jobs = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { bottom } = useSafeAreaInsets();

  const { jobs, loading, pagination, success, error } = useSelector(
    (state) => state.jobs
  );
  const { token } = useSelector((state) => state.auth);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [tempLocation, setTempLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Bottom Sheets
  const filterBottomSheetRef = useRef(null);
  const actionBottomSheetRef = useRef(null);
  const filterSnapPoints = useMemo(() => ["50%", "75%"], []);
  const actionSnapPoints = useMemo(() => ["35%", "50%"], []);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        enableTouchThrough={false}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        style={[
          { backgroundColor: "rgba(0, 0, 0, 1)" },
          StyleSheet.absoluteFillObject,
        ]}
      />
    ),
    []
  );

  // Filters
  const statusFilters = [
    { label: "All Jobs", value: "all" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
    { label: "Closed", value: "closed" },
  ];

  const locationFilters = [
    { label: "All Locations", value: "" },
    { label: "Remote", value: "remote" },
    { label: "Hyderabad", value: "hyderabad" },
    { label: "Bangalore", value: "bangalore" },
    { label: "Mumbai", value: "mumbai" },
    { label: "Delhi", value: "delhi" },
    { label: "Pune", value: "pune" },
  ];

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, [appliedStatus, appliedLocation, currentPage]);

  // Handle success/error
  useEffect(() => {
    if (success) {
      setTimeout(() => dispatch(clearSuccess()), 3000);
      loadJobs();
    }
    if (error) {
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [success, error]);

  const loadJobs = () => {
    const params = {
      page: currentPage,
      limit: 10,
      token,
    };

    if (appliedStatus !== "all") {
      params.status = appliedStatus;
    }

    if (appliedLocation) {
      params.location = appliedLocation;
    }

    dispatch(fetchAllJobs(params));
    setIsInitialLoad(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadJobs();
    setRefreshing(false);
  };

  // Open filter sheet
  const handleOpenFilters = () => {
    setTempStatus(appliedStatus);
    setTempLocation(appliedLocation);
    filterBottomSheetRef.current?.expand();
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedStatus(tempStatus);
    setAppliedLocation(tempLocation);
    setCurrentPage(1);
    filterBottomSheetRef.current?.close();
  };

  // Clear filters
  const handleClearFilters = () => {
    setTempStatus("all");
    setTempLocation("");
  };

  // Job Actions
  const handleJobMenuPress = useCallback((job) => {
    setSelectedJob(job);
    actionBottomSheetRef.current?.expand();
  }, []);

  const handleCreateJob = () => {
    router.push("/(hr)/jobs/create");
  };

  const handleEditJob = () => {
    actionBottomSheetRef.current?.close();
    router.push(`/(hr)/jobs/${selectedJob._id}`);
  };

  const handleViewApplications = () => {
    actionBottomSheetRef.current?.close();
    router.push(`/(hr)/applications?jobId=${selectedJob._id}`);
  };

  const handleToggleStatus = () => {
    const newStatus =
      selectedJob.status === "published" ? "draft" : "published";
    dispatch(
      updateJobStatus({
        id: selectedJob._id,
        status: newStatus,
        token,
      })
    );
    actionBottomSheetRef.current?.close();
  };

  const handleDeleteJob = () => {
    dispatch(
      deleteJobById({
        jobId: selectedJob._id,
        token,
      })
    );
    actionBottomSheetRef.current?.close();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "#10b981";
      case "draft":
        return "#f59e0b";
      case "closed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Check if filters are active
  const hasActiveFilters = appliedStatus !== "all" || appliedLocation !== "";

  // Render Job Card
  const renderJobCard = useCallback(
    ({ item }) => (
      <Card style={styles.jobCard}>
        <Card.Content style={styles.cardContent}>
          {/* Header with Title, Status, and Menu Icon */}
          <View style={styles.jobHeader}>
            <View style={styles.jobHeaderLeft}>
              <Text
                variant="titleMedium"
                style={styles.jobTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>
            <View style={styles.jobHeaderRight}>
              <Chip
                mode="flat"
                compact
                textStyle={styles.statusChipText}
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                {item.status.toUpperCase()}
              </Chip>
              <IconButton
                icon="dots-vertical"
                size={20}
                iconColor="#666"
                style={styles.menuIcon}
                onPress={() => handleJobMenuPress(item)}
              />
            </View>
          </View>

          {/* Description */}
          <Text
            variant="bodyMedium"
            numberOfLines={2}
            style={styles.description}
          >
            {item.description}
          </Text>

          {/* Meta Information */}
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#5f6368" />
              <Text variant="bodySmall" style={styles.metaText}>
                {item.location || "Remote"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color="#5f6368" />
              <Text variant="bodySmall" style={styles.metaText}>
                {item.experience?.min}-{item.experience?.max} yrs
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#5f6368" />
              <Text variant="bodySmall" style={styles.metaText}>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Skills */}
          {item.requiredSkills && item.requiredSkills.length > 0 && (
            <View style={styles.skillsContainer}>
              {item.requiredSkills.slice(0, 4).map((skill, index) => (
                <Chip
                  key={index}
                  mode="flat"
                  compact
                  style={styles.skillChip}
                  textStyle={styles.skillChipText}
                >
                  {skill}
                </Chip>
              ))}
              {item.requiredSkills.length > 4 && (
                <Chip
                  mode="flat"
                  compact
                  style={styles.skillChip}
                  textStyle={styles.skillChipText}
                >
                  +{item.requiredSkills.length - 4}
                </Chip>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    ),
    [handleJobMenuPress]
  );

  // Render skeleton loader
  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <SkeletonCard key={item} />
      ))}
    </>
  );

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "My Jobs",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <IconButton
                icon="filter-variant"
                size={24}
                iconColor={hasActiveFilters ? "#6200ee" : "#666"}
                onPress={handleOpenFilters}
                style={hasActiveFilters && styles.filterIconActive}
              />
            </View>
          ),
          headerSearchBarOptions: {
            placeholder: "Search jobs by title...",
            hideWhenScrolling: false,
            autoCapitalize: "none",
            barTintColor: "#fff",
            hintTextColor: "#888",
            onChangeText: setSearchQuery,
          },
        }}
      />

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersContent}>
            {appliedStatus !== "all" && (
              <Chip
                mode="flat"
                onClose={() => {
                  setAppliedStatus("all");
                  setCurrentPage(1);
                }}
                style={styles.activeFilterChip}
              >
                {statusFilters.find((f) => f.value === appliedStatus)?.label}
              </Chip>
            )}
            {appliedLocation && (
              <Chip
                mode="flat"
                onClose={() => {
                  setAppliedLocation("");
                  setCurrentPage(1);
                }}
                style={styles.activeFilterChip}
              >
                {
                  locationFilters.find((f) => f.value === appliedLocation)
                    ?.label
                }
              </Chip>
            )}
          </View>
          <Button
            mode="text"
            compact
            onPress={() => {
              setAppliedStatus("all");
              setAppliedLocation("");
              setCurrentPage(1);
            }}
            textColor="#f44336"
          >
            Clear All
          </Button>
        </View>
      )}

      {/* Jobs List with Loading State */}
      {loading && isInitialLoad ? (
        <View style={styles.listContent}>{renderSkeletons()}</View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="briefcase-off-outline"
            size={80}
            color="#ccc"
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No Jobs Found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Create your first job posting to get started
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={handleCreateJob}
            style={styles.emptyButton}
          >
            Create Job
          </Button>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6200ee"]}
            />
          }
          onEndReached={() => {
            if (pagination.page < pagination.pages && !loading) {
              setCurrentPage(currentPage + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !isInitialLoad ? (
              <View style={styles.loadingFooter}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateJob}
        color="#fff"
        label="Create"
      />

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterBottomSheetRef}
        index={-1}
        snapPoints={filterSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={styles.filterSheetContent}>
          <View style={styles.filterSheetHeader}>
            <Text variant="titleLarge" style={styles.filterSheetTitle}>
              Filter Jobs
            </Text>
            <View style={styles.filterHeaderActions}>
              <Button
                mode="contained"
                onPress={handleApplyFilters}
                compact
                style={styles.applyButton}
                labelStyle={styles.applyButtonLabel}
              >
                Apply
              </Button>
              <IconButton
                icon="close"
                size={24}
                onPress={() => filterBottomSheetRef.current?.close()}
                style={styles.closeButton}
              />
            </View>
          </View>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Job Status
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setTempStatus(value)}
              value={tempStatus}
            >
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={styles.radioItem}
                  onPress={() => setTempStatus(filter.value)}
                >
                  <RadioButton.Android value={filter.value} color="#6200ee" />
                  <Text variant="bodyLarge">{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Location Filter */}
          <View style={styles.filterSection}>
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Location
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setTempLocation(value)}
              value={tempLocation}
            >
              {locationFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={styles.radioItem}
                  onPress={() => setTempLocation(filter.value)}
                >
                  <RadioButton.Android value={filter.value} color="#6200ee" />
                  <Text variant="bodyLarge">{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </View>

          {/* Clear All Button at Bottom */}
          <View style={styles.filterBottomActions}>
            <Button
              mode="text"
              onPress={handleClearFilters}
              textColor="#f44336"
              icon="close-circle-outline"
            >
              Clear All Filters
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Action Bottom Sheet */}
      <BottomSheet
        ref={actionBottomSheetRef}
        index={-1}
        snapPoints={actionSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.actionSheetContent}>
          <View style={styles.actionSheetHeader}>
            <Text
              variant="titleLarge"
              style={styles.actionSheetTitle}
              numberOfLines={2}
            >
              {selectedJob?.title}
            </Text>
            <Chip
              mode="flat"
              compact
              textStyle={styles.statusChipText}
              style={[
                styles.statusChip,
                {
                  backgroundColor: getStatusColor(selectedJob?.status),
                },
              ]}
            >
              {selectedJob?.status?.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.actionSheetActions}>
            <Button
              mode="contained"
              icon="pencil"
              onPress={handleEditJob}
              style={styles.actionButton}
            >
              Edit Job
            </Button>

            <Button
              mode="outlined"
              icon="account-group"
              onPress={handleViewApplications}
              style={styles.actionButton}
            >
              View Applications
            </Button>

            <Button
              mode="outlined"
              icon={selectedJob?.status === "published" ? "eye-off" : "eye"}
              onPress={handleToggleStatus}
              style={styles.actionButton}
            >
              {selectedJob?.status === "published" ? "Unpublish" : "Publish"}
            </Button>

            <Button
              mode="outlined"
              icon="delete"
              textColor="#f44336"
              onPress={handleDeleteJob}
              style={styles.actionButton}
            >
              Delete Job
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  filterIconActive: {
    backgroundColor: "#f0e6ff",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  activeFiltersContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  activeFilterChip: {
    backgroundColor: "#f0e6ff",
  },
  listContent: {
    padding: 12,
  },
  jobCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    padding: 14,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  jobHeaderLeft: {
    flex: 1,
  },
  jobHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobTitle: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 16,
    lineHeight: 22,
  },
  statusChip: {
    height: 30,
    borderRadius: 6,
  },
  statusChipText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  menuIcon: {
    margin: 0,
    marginTop: -4,
  },
  description: {
    color: "#6b7280",
    marginBottom: 10,
    lineHeight: 20,
    fontSize: 14,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "500",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  skillChip: {
    height: 30,
    backgroundColor: "#ede9fe",
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 11,
    color: "#7c3aed",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  emptySubtitle: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 24,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#6200ee",
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  filterSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  filterSheetTitle: {
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  applyButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
  },
  applyButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    margin: 0,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  sectionDivider: {
    marginVertical: 16,
  },
  filterBottomActions: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 40,
  },
  actionSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  actionSheetTitle: {
    flex: 1,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionSheetActions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  // Skeleton Styles
  skeleton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonTitle: {
    width: "60%",
    height: 20,
  },
  skeletonChip: {
    width: 70,
    height: 30,
    borderRadius: 6,
  },
  skeletonDescription: {
    width: "100%",
    height: 16,
    marginBottom: 6,
  },
  skeletonDescription2: {
    width: "80%",
    height: 16,
    marginBottom: 10,
  },
  skeletonMeta: {
    width: 80,
    height: 14,
  },
  skeletonSkill: {
    width: 60,
    height: 30,
    borderRadius: 6,
  },
});

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Card,
  Chip,
  FAB,
  IconButton,
  Divider,
  Button,
  RadioButton,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import {
  setFilters,
  fetchApplicantJobs,
  clearError,
} from "../../../redux/slices/applicantJobSlice";
import {
  applyForJob,
  clearError as clearApplicationError,
  clearSuccess,
} from "../../../redux/slices/applicationSlice";

const Jobs = () => {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { jobs, loading, error, pagination, filters } = useSelector(
    (state) => state.applicantJobs
  );
  const {
    uploading,
    success: applicationSuccess,
    error: applicationError,
  } = useSelector((state) => state.applications);
  const { user, token } = useSelector((state) => state.auth);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // Application state
  const [resumeFile, setResumeFile] = useState(null);
  const [experience, setExperience] = useState("");

  // Filter states
  const [appliedLocation, setAppliedLocation] = useState("");
  const [appliedExperience, setAppliedExperience] = useState("");
  const [appliedJobType, setAppliedJobType] = useState("");
  const [appliedSkill, setAppliedSkill] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempExperience, setTempExperience] = useState("");
  const [tempJobType, setTempJobType] = useState("");
  const [tempSkill, setTempSkill] = useState("");

  // Sort state
  const [sortBy, setSortBy] = useState("latest");
  const [tempSortBy, setTempSortBy] = useState("latest");

  // Bottom Sheets
  const filterBottomSheetRef = useRef(null);
  const jobDetailsBottomSheetRef = useRef(null);
  const applyBottomSheetRef = useRef(null);
  const filterSnapPoints = useMemo(() => ["70%", "90%"], []);
  const jobDetailsSnapPoints = useMemo(() => ["75%", "90%"], []);
  const applySnapPoints = useMemo(() => ["50%", "70%"], []);

  // Extract dynamic filter options from jobs data
  const dynamicFilters = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        locations: [],
        experiences: [],
        jobTypes: [],
        skills: [],
      };
    }

    const locations = [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter((loc) => loc && loc.trim() !== "")
      ),
    ].sort();

    const jobTypes = [
      ...new Set(
        jobs
          .map((job) => job.jobType)
          .filter((type) => type && type.trim() !== "")
      ),
    ].sort();

    const experienceRanges = new Set();
    jobs.forEach((job) => {
      if (job.experience && job.experience.min !== undefined) {
        const min = job.experience.min;
        const max = job.experience.max;
        if (min <= 2) experienceRanges.add("0-2");
        if (min <= 5 && max >= 2) experienceRanges.add("2-5");
        if (min <= 10 && max >= 5) experienceRanges.add("5-10");
        if (max >= 10) experienceRanges.add("10+");
      }
    });
    const experiences = Array.from(experienceRanges).sort();

    const allSkills = jobs.reduce((acc, job) => {
      if (job.requiredSkills && Array.isArray(job.requiredSkills)) {
        return [...acc, ...job.requiredSkills];
      }
      return acc;
    }, []);
    const skills = [...new Set(allSkills)]
      .filter((skill) => skill && skill.trim() !== "")
      .sort();

    return {
      locations,
      experiences,
      jobTypes,
      skills,
    };
  }, [jobs]);

  // Filter options
  const locationFilters = useMemo(() => {
    return [
      { label: "All Locations", value: "" },
      ...dynamicFilters.locations.map((loc) => ({
        label: loc.charAt(0).toUpperCase() + loc.slice(1),
        value: loc,
      })),
    ];
  }, [dynamicFilters.locations]);

  const experienceFilters = useMemo(() => {
    const filterMap = {
      "0-2": "0-2 years",
      "2-5": "2-5 years",
      "5-10": "5-10 years",
      "10+": "10+ years",
    };
    return [
      { label: "All Experience", value: "" },
      ...dynamicFilters.experiences.map((exp) => ({
        label: filterMap[exp] || exp,
        value: exp,
      })),
    ];
  }, [dynamicFilters.experiences]);

  const jobTypeFilters = useMemo(() => {
    return [
      { label: "All Types", value: "" },
      ...dynamicFilters.jobTypes.map((type) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
      })),
    ];
  }, [dynamicFilters.jobTypes]);

  const skillFilters = useMemo(() => {
    return [
      { label: "All Skills", value: "" },
      ...dynamicFilters.skills.slice(0, 20).map((skill) => ({
        label: skill,
        value: skill,
      })),
    ];
  }, [dynamicFilters.skills]);

  const sortOptions = [
    { label: "Latest First", value: "latest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Salary: High to Low", value: "salary-high" },
    { label: "Salary: Low to High", value: "salary-low" },
    { label: "Experience: High to Low", value: "experience-high" },
    { label: "Experience: Low to High", value: "experience-low" },
  ];

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

  // Filter and sort jobs locally
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    if (appliedLocation) {
      filtered = filtered.filter(
        (job) =>
          job.location &&
          job.location.toLowerCase() === appliedLocation.toLowerCase()
      );
    }

    if (appliedExperience) {
      filtered = filtered.filter((job) => {
        if (!job.experience) return false;
        const min = job.experience.min;
        const max = job.experience.max;

        switch (appliedExperience) {
          case "0-2":
            return min <= 2;
          case "2-5":
            return min <= 5 && max >= 2;
          case "5-10":
            return min <= 10 && max >= 5;
          case "10+":
            return max >= 10;
          default:
            return true;
        }
      });
    }

    if (appliedJobType) {
      filtered = filtered.filter(
        (job) =>
          job.jobType &&
          job.jobType.toLowerCase() === appliedJobType.toLowerCase()
      );
    }

    if (appliedSkill) {
      filtered = filtered.filter(
        (job) =>
          job.requiredSkills &&
          Array.isArray(job.requiredSkills) &&
          job.requiredSkills.some(
            (skill) => skill.toLowerCase() === appliedSkill.toLowerCase()
          )
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "salary-high":
          const salaryA = a.salary?.max || a.salary?.min || 0;
          const salaryB = b.salary?.max || b.salary?.min || 0;
          return salaryB - salaryA;
        case "salary-low":
          const salaryAMin = a.salary?.min || a.salary?.max || 0;
          const salaryBMin = b.salary?.min || b.salary?.max || 0;
          return salaryAMin - salaryBMin;
        case "experience-high":
          const expAMax = a.experience?.max || 0;
          const expBMax = b.experience?.max || 0;
          return expBMax - expAMax;
        case "experience-low":
          const expAMin = a.experience?.min || 0;
          const expBMin = b.experience?.min || 0;
          return expAMin - expBMin;
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    jobs,
    appliedLocation,
    appliedExperience,
    appliedJobType,
    appliedSkill,
    sortBy,
  ]);

  const fetchJobs = useCallback(
    (page = 1) => {
      const filterParams = {
        page,
        token,
      };

      dispatch(fetchApplicantJobs(filterParams));
      setIsInitialLoad(false);
    },
    [dispatch, token]
  );

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  // Handle application success/error
  useEffect(() => {
    if (applicationSuccess) {
      Alert.alert("Success", applicationSuccess);
      dispatch(clearSuccess());
      applyBottomSheetRef.current?.close();
      jobDetailsBottomSheetRef.current?.close();
      setResumeFile(null);
      setExperience("");
      // Refresh jobs list
      fetchJobs(1);
    }
  }, [applicationSuccess]);

  useEffect(() => {
    if (applicationError) {
      Alert.alert("Error", applicationError);
      dispatch(clearApplicationError());
    }
  }, [applicationError]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchJobs(1);
    setTimeout(() => setRefreshing(false), 1000);
  }, [fetchJobs]);

  // Open filter sheet
  const handleOpenFilters = () => {
    setTempLocation(appliedLocation);
    setTempExperience(appliedExperience);
    setTempJobType(appliedJobType);
    setTempSkill(appliedSkill);
    setTempSortBy(sortBy);
    filterBottomSheetRef.current?.expand();
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedLocation(tempLocation);
    setAppliedExperience(tempExperience);
    setAppliedJobType(tempJobType);
    setAppliedSkill(tempSkill);
    setSortBy(tempSortBy);
    setCurrentPage(1);
    filterBottomSheetRef.current?.close();
  };

  // Clear filters
  const handleClearFilters = () => {
    setTempLocation("");
    setTempExperience("");
    setTempJobType("");
    setTempSkill("");
    setTempSortBy("latest");
  };

  // Check if filters are active
  const hasActiveFilters =
    appliedLocation !== "" ||
    appliedExperience !== "" ||
    appliedJobType !== "" ||
    appliedSkill !== "" ||
    sortBy !== "latest";

  // Handle job card press
  const handleJobPress = useCallback((job) => {
    setSelectedJob(job);
    jobDetailsBottomSheetRef.current?.expand();
  }, []);

  // Handle apply button press - open apply bottom sheet
  const handleApplyPress = () => {
    jobDetailsBottomSheetRef.current?.close();
    setTimeout(() => {
      applyBottomSheetRef.current?.expand();
    }, 300);
  };

  // Handle resume file pick
  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === "success" || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("Error", "File size must be less than 5MB");
          return;
        }

        setResumeFile(file);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  // Handle apply for job with resume
  const handleSubmitApplication = () => {
    // Validation
    if (!resumeFile) {
      Alert.alert("Error", "Please select your resume (PDF or DOCX)");
      return;
    }

    if (!experience || experience.trim() === "") {
      Alert.alert("Error", "Please enter your years of experience");
      return;
    }

    const expNum = parseFloat(experience);
    if (isNaN(expNum) || expNum < 0) {
      Alert.alert("Error", "Please enter a valid number for experience");
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("resume", {
      uri:
        Platform.OS === "ios"
          ? resumeFile.uri.replace("file://", "")
          : resumeFile.uri,
      type: resumeFile.mimeType || "application/pdf",
      name: resumeFile.name || "resume.pdf",
    });
    formData.append("experience", experience);
    console.log(formData, selectedJob);

    // Dispatch apply action
    dispatch(
      applyForJob({
        jobId: selectedJob._id,
        formData,
        token,
      })
    );
  };

  // Render skeleton loader
  const renderSkeleton = () => (
    <Card style={styles.jobCard}>
      <View style={styles.cardHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine2} />
      <View style={styles.locationExperience}>
        <View style={styles.skeletonMeta} />
        <View style={styles.skeletonMeta} />
      </View>
      <View style={styles.skillsContainer}>
        <View style={styles.skeletonSkill} />
        <View style={styles.skeletonSkill} />
        <View style={styles.skeletonSkill} />
      </View>
    </Card>
  );

  const renderJobCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => handleJobPress(item)}
      >
        <View style={styles.cardHeader}>
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
            <IconButton
              icon="chevron-right"
              size={20}
              iconColor="#666"
              style={styles.menuIcon}
              onPress={() => handleJobPress(item)}
            />
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.company}>
          {item.createdBy?.name || "HR Team"}
        </Text>

        <View style={styles.locationExperience}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text variant="bodySmall" style={styles.infoText}>
              {item.location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text variant="bodySmall" style={styles.infoText}>
              {item.experience?.min}-{item.experience?.max} years
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#6b7280" />
            <Text variant="bodySmall" style={styles.infoText}>
              {item.jobType || "Full Time"}
            </Text>
          </View>
        </View>

        <View style={styles.skillsContainer}>
          {item.requiredSkills?.slice(0, 3).map((skill, index) => (
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
          {item.requiredSkills?.length > 3 && (
            <Chip
              mode="flat"
              compact
              style={styles.skillChip}
              textStyle={styles.skillChipText}
            >
              +{item.requiredSkills.length - 3}
            </Chip>
          )}
        </View>

        {item.salary && (
          <Text variant="titleSmall" style={styles.salary}>
            ₹{item.salary.min?.toLocaleString()} - ₹
            {item.salary.max?.toLocaleString()}
          </Text>
        )}

        <View style={styles.jobCardFooter}>
          <Text variant="bodySmall" style={styles.postedDate}>
            Posted{" "}
            {Math.floor(
              (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
            )}{" "}
            days ago
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleJobPress]
  );

  if (error) {
    return (
      <View style={[styles.centerContainer, { paddingTop: top }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text variant="titleMedium" style={styles.errorText}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            dispatch(clearError());
            fetchJobs(1);
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Find Jobs",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
          headerSearchBarOptions: {
            placeholder: "Search jobs by title...",
            hideWhenScrolling: false,
            autoCapitalize: "none",
            barTintColor: "#fff",
            hintTextColor: "#888",
            onChangeText: setSearchQuery,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={handleOpenFilters}
              style={{ marginRight: 10, padding: 10 }}
            >
              <Ionicons name="filter" size={22} color={"black"} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersContent}>
            {sortBy !== "latest" && (
              <Chip
                mode="flat"
                icon="sort"
                onClose={() => setSortBy("latest")}
                style={styles.activeFilterChip}
              >
                {sortOptions.find((s) => s.value === sortBy)?.label}
              </Chip>
            )}
            {appliedLocation && (
              <Chip
                mode="flat"
                onClose={() => setAppliedLocation("")}
                style={styles.activeFilterChip}
              >
                {
                  locationFilters.find((f) => f.value === appliedLocation)
                    ?.label
                }
              </Chip>
            )}
            {appliedExperience && (
              <Chip
                mode="flat"
                onClose={() => setAppliedExperience("")}
                style={styles.activeFilterChip}
              >
                {
                  experienceFilters.find((f) => f.value === appliedExperience)
                    ?.label
                }
              </Chip>
            )}
            {appliedJobType && (
              <Chip
                mode="flat"
                onClose={() => setAppliedJobType("")}
                style={styles.activeFilterChip}
              >
                {jobTypeFilters.find((f) => f.value === appliedJobType)?.label}
              </Chip>
            )}
            {appliedSkill && (
              <Chip
                mode="flat"
                onClose={() => setAppliedSkill("")}
                style={styles.activeFilterChip}
              >
                {appliedSkill}
              </Chip>
            )}
          </View>
          <Button
            mode="text"
            compact
            onPress={() => {
              setAppliedLocation("");
              setAppliedExperience("");
              setAppliedJobType("");
              setAppliedSkill("");
              setSortBy("latest");
            }}
            textColor="#f44336"
          >
            Clear
          </Button>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text variant="bodyMedium" style={styles.resultsText}>
          {filteredAndSortedJobs.length}{" "}
          {filteredAndSortedJobs.length === 1 ? "job" : "jobs"} found
        </Text>
        {sortBy !== "latest" && (
          <Text variant="bodySmall" style={styles.sortedByText}>
            Sorted by: {sortOptions.find((s) => s.value === sortBy)?.label}
          </Text>
        )}
      </View>

      {/* Jobs List */}
      {loading && isInitialLoad ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item}>{renderSkeleton()}</View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedJobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6200ee"]}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No jobs found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Try adjusting your filters or search
              </Text>
            </View>
          }
          onEndReached={() => {
            if (pagination?.page < pagination?.pages && !loading) {
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
              Filter & Sort Jobs
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

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Sort By
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setTempSortBy(value)}
              value={tempSortBy}
            >
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => setTempSortBy(option.value)}
                >
                  <RadioButton.Android value={option.value} color="#6200ee" />
                  <Text variant="bodyLarge">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Location Filter */}
          {locationFilters.length > 1 && (
            <>
              <View style={styles.filterSection}>
                <Text variant="titleMedium" style={styles.filterSectionTitle}>
                  Location ({dynamicFilters.locations.length})
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
                      <RadioButton.Android
                        value={filter.value}
                        color="#6200ee"
                      />
                      <Text variant="bodyLarge">{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>
              <Divider style={styles.sectionDivider} />
            </>
          )}

          {/* Experience Filter */}
          {experienceFilters.length > 1 && (
            <>
              <View style={styles.filterSection}>
                <Text variant="titleMedium" style={styles.filterSectionTitle}>
                  Experience Level
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => setTempExperience(value)}
                  value={tempExperience}
                >
                  {experienceFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={styles.radioItem}
                      onPress={() => setTempExperience(filter.value)}
                    >
                      <RadioButton.Android
                        value={filter.value}
                        color="#6200ee"
                      />
                      <Text variant="bodyLarge">{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>
              <Divider style={styles.sectionDivider} />
            </>
          )}

          {/* Job Type Filter */}
          {jobTypeFilters.length > 1 && (
            <>
              <View style={styles.filterSection}>
                <Text variant="titleMedium" style={styles.filterSectionTitle}>
                  Job Type ({dynamicFilters.jobTypes.length})
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => setTempJobType(value)}
                  value={tempJobType}
                >
                  {jobTypeFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={styles.radioItem}
                      onPress={() => setTempJobType(filter.value)}
                    >
                      <RadioButton.Android
                        value={filter.value}
                        color="#6200ee"
                      />
                      <Text variant="bodyLarge">{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>
              <Divider style={styles.sectionDivider} />
            </>
          )}

          {/* Skills Filter */}
          {skillFilters.length > 1 && (
            <>
              <View style={styles.filterSection}>
                <Text variant="titleMedium" style={styles.filterSectionTitle}>
                  Skills (Top 20)
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => setTempSkill(value)}
                  value={tempSkill}
                >
                  {skillFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={styles.radioItem}
                      onPress={() => setTempSkill(filter.value)}
                    >
                      <RadioButton.Android
                        value={filter.value}
                        color="#6200ee"
                      />
                      <Text variant="bodyLarge">{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>
              <Divider style={styles.sectionDivider} />
            </>
          )}

          {/* Clear All Button */}
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

      {/* Job Details Bottom Sheet */}
      <BottomSheet
        ref={jobDetailsBottomSheetRef}
        index={-1}
        snapPoints={jobDetailsSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={styles.jobDetailsContent}>
          {selectedJob && (
            <>
              <View style={styles.jobDetailsHeader}>
                <View style={styles.jobDetailsHeaderContent}>
                  <Text variant="titleLarge" style={styles.jobDetailsTitle}>
                    {selectedJob.title}
                  </Text>
                  <Text variant="bodyLarge" style={styles.jobDetailsCompany}>
                    {selectedJob.createdBy?.name || "HR Team"}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => jobDetailsBottomSheetRef.current?.close()}
                  style={styles.closeButton}
                />
              </View>

              <View style={styles.jobDetailsMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={18} color="#6200ee" />
                  <Text variant="bodyMedium" style={styles.metaText}>
                    {selectedJob.location}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={18} color="#6200ee" />
                  <Text variant="bodyMedium" style={styles.metaText}>
                    {selectedJob.experience?.min}-{selectedJob.experience?.max}{" "}
                    years
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="briefcase" size={18} color="#6200ee" />
                  <Text variant="bodyMedium" style={styles.metaText}>
                    {selectedJob.jobType || "Full Time"}
                  </Text>
                </View>
              </View>

              {selectedJob.salary && (
                <View style={styles.salarySection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Salary Range
                  </Text>
                  <Text variant="titleLarge" style={styles.salaryText}>
                    ₹{selectedJob.salary.min?.toLocaleString()} - ₹
                    {selectedJob.salary.max?.toLocaleString()}
                  </Text>
                </View>
              )}

              <Divider style={styles.detailsDivider} />

              <View style={styles.descriptionSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Job Description
                </Text>
                <Text variant="bodyMedium" style={styles.descriptionText}>
                  {selectedJob.description}
                </Text>
              </View>

              <Divider style={styles.detailsDivider} />

              {selectedJob.requiredSkills &&
                selectedJob.requiredSkills.length > 0 && (
                  <>
                    <View style={styles.skillsSection}>
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Required Skills
                      </Text>
                      <View style={styles.skillsListContainer}>
                        {selectedJob.requiredSkills.map((skill, index) => (
                          <Chip
                            key={index}
                            mode="flat"
                            style={styles.skillChipLarge}
                            textStyle={styles.skillChipTextLarge}
                          >
                            {skill}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    <Divider style={styles.detailsDivider} />
                  </>
                )}

              {selectedJob.responsibilities &&
                selectedJob.responsibilities.length > 0 && (
                  <>
                    <View style={styles.responsibilitiesSection}>
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Responsibilities
                      </Text>
                      {selectedJob.responsibilities.map((item, index) => (
                        <View key={index} style={styles.bulletPoint}>
                          <Text style={styles.bullet}>•</Text>
                          <Text variant="bodyMedium" style={styles.bulletText}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Divider style={styles.detailsDivider} />
                  </>
                )}

              <View style={styles.postedSection}>
                <Text variant="bodySmall" style={styles.postedText}>
                  Posted on{" "}
                  {new Date(selectedJob.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {/* Apply Button */}
              <View style={styles.applyButtonContainer}>
                <Button
                  mode="contained"
                  icon="send"
                  onPress={handleApplyPress}
                  style={styles.applyJobButton}
                  labelStyle={styles.applyJobButtonLabel}
                >
                  Apply for this Job
                </Button>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* ✅ NEW: Apply Job Bottom Sheet with Resume Upload */}
      <BottomSheet
        ref={applyBottomSheetRef}
        index={-1}
        snapPoints={applySnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={styles.applySheetContent}>
          <View style={styles.applySheetHeader}>
            <Text variant="titleLarge" style={styles.applySheetTitle}>
              Apply for Job
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                applyBottomSheetRef.current?.close();
                setResumeFile(null);
                setExperience("");
              }}
              style={styles.closeButton}
            />
          </View>

          {selectedJob && (
            <>
              <View style={styles.applyJobInfo}>
                <Text variant="bodyMedium" style={styles.applyJobTitle}>
                  {selectedJob.title}
                </Text>
                <Text variant="bodySmall" style={styles.applyJobCompany}>
                  {selectedJob.createdBy?.name || "HR Team"}
                </Text>
              </View>

              <Divider style={styles.applyDivider} />

              {/* Experience Input */}
              <View style={styles.inputSection}>
                <Text variant="titleSmall" style={styles.inputLabel}>
                  Years of Experience *
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g., 3"
                  keyboardType="numeric"
                  value={experience}
                  onChangeText={setExperience}
                  style={styles.input}
                  outlineColor="#e0e0e0"
                  activeOutlineColor="#6200ee"
                />
              </View>

              {/* Resume Upload */}
              <View style={styles.inputSection}>
                <Text variant="titleSmall" style={styles.inputLabel}>
                  Upload Resume * (PDF or DOCX, Max 5MB)
                </Text>

                {resumeFile ? (
                  <View style={styles.fileSelectedContainer}>
                    <View style={styles.fileInfo}>
                      <Ionicons
                        name="document-text"
                        size={24}
                        color="#6200ee"
                      />
                      <View style={styles.fileDetails}>
                        <Text
                          variant="bodyMedium"
                          style={styles.fileName}
                          numberOfLines={1}
                        >
                          {resumeFile.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.fileSize}>
                          {(resumeFile.size / 1024).toFixed(2)} KB
                        </Text>
                      </View>
                    </View>
                    <IconButton
                      icon="close-circle"
                      size={24}
                      iconColor="#f44336"
                      onPress={() => setResumeFile(null)}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handlePickResume}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={32}
                      color="#6200ee"
                    />
                    <Text variant="bodyMedium" style={styles.uploadText}>
                      Tap to select resume
                    </Text>
                    <Text variant="bodySmall" style={styles.uploadSubtext}>
                      PDF or DOCX format only
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit Button */}
              <View style={styles.submitButtonContainer}>
                <Button
                  mode="contained"
                  icon="send"
                  onPress={handleSubmitApplication}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonLabel}
                  disabled={uploading}
                  loading={uploading}
                >
                  {uploading ? "Submitting..." : "Submit Application"}
                </Button>
              </View>

              <Text variant="bodySmall" style={styles.applyNote}>
                Note: Your resume will be analyzed and you'll receive a match
                score based on the job requirements.
              </Text>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultsText: {
    color: "#374151",
    fontWeight: "600",
  },
  sortedByText: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  listContainer: { padding: 16, paddingBottom: 80 },
  jobCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
  jobTitle: { fontWeight: "700", color: "#111827", lineHeight: 22 },
  menuIcon: {
    margin: 0,
    marginTop: -4,
  },
  company: {
    color: "#6200ee",
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 15,
  },
  locationExperience: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    color: "#6b7280",
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  skillChip: { backgroundColor: "#ede9fe", height: 30, borderRadius: 6 },
  skillChipText: {
    fontSize: 11,
    color: "#7c3aed",
    fontWeight: "600",
  },
  salary: {
    fontWeight: "700",
    color: "#059669",
    fontSize: 16,
    marginTop: 4,
  },
  jobCardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  postedDate: {
    color: "#9ca3af",
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: "#ef4444", textAlign: "center", marginVertical: 12 },
  retryButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: { color: "white", fontWeight: "600" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyTitle: { color: "#111827", marginTop: 16, fontWeight: "600" },
  emptySubtitle: { color: "#6b7280", textAlign: "center", marginTop: 4 },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },

  // Bottom Sheet Styles
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

  // Job Details Bottom Sheet
  jobDetailsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingTop: 8,
  },
  jobDetailsHeaderContent: {
    flex: 1,
    paddingRight: 10,
  },
  jobDetailsTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 28,
  },
  jobDetailsCompany: {
    color: "#6200ee",
    fontWeight: "600",
  },
  jobDetailsMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#374151",
    fontWeight: "500",
  },
  salarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  salaryText: {
    color: "#059669",
    fontWeight: "700",
  },
  detailsDivider: {
    marginVertical: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    color: "#4b5563",
    lineHeight: 22,
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChipLarge: {
    backgroundColor: "#ede9fe",
    height: 36,
  },
  skillChipTextLarge: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
  },
  responsibilitiesSection: {
    marginBottom: 20,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: "#6200ee",
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    color: "#4b5563",
    lineHeight: 22,
  },
  postedSection: {
    marginBottom: 20,
  },
  postedText: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  applyButtonContainer: {
    marginBottom: 40,
  },
  applyJobButton: {
    backgroundColor: "#6200ee",
    borderRadius: 12,
    paddingVertical: 6,
  },
  applyJobButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  // ✅ NEW: Apply Bottom Sheet Styles
  applySheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  applySheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  applySheetTitle: {
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  applyJobInfo: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  applyJobTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  applyJobCompany: {
    color: "#6200ee",
    fontWeight: "600",
  },
  applyDivider: {
    marginVertical: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#6200ee",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#f8f5ff",
  },
  uploadText: {
    color: "#6200ee",
    fontWeight: "600",
    marginTop: 8,
  },
  uploadSubtext: {
    color: "#9ca3af",
    marginTop: 4,
  },
  fileSelectedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0e6ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6200ee",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  fileSize: {
    color: "#6b7280",
  },
  submitButtonContainer: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#6200ee",
    borderRadius: 12,
    paddingVertical: 6,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  applyNote: {
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // Skeleton Styles
  skeletonTitle: {
    width: "60%",
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 70,
    height: 30,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  skeletonLine: {
    width: "100%",
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLine2: {
    width: "80%",
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonMeta: {
    width: 80,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonSkill: {
    width: 60,
    height: 30,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
});

export default Jobs;

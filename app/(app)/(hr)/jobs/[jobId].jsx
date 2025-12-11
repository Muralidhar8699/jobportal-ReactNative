import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  Text,
  HelperText,
  ActivityIndicator,
  Portal,
  Dialog,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  createNewJob,
  updateJobById,
  fetchJobById,
  clearSuccess,
  clearError,
} from "../../../../redux/slices/jobSlice";

const JobForm = () => {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { selectedJob, loading, success, error } = useSelector(
    (state) => state.jobs
  );

  // Determine if we're in CREATE or EDIT mode
  const isCreateMode = jobId === "create";
  const isEditMode = !isCreateMode;

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    experience: { min: 0, max: 5 },
    location: "",
    salary: { min: 0, max: 0, currency: "INR" },
    status: "draft",
  });

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [showDialog, setShowDialog] = useState(false);

  // Load existing job data in EDIT mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchJobById({ jobId, token }));
    }
  }, [jobId, isEditMode]);

  // Populate form when job data is loaded
  useEffect(() => {
    if (isEditMode && selectedJob && selectedJob._id === jobId) {
      setFormData({
        title: selectedJob.title || "",
        description: selectedJob.description || "",
        requiredSkills: selectedJob.requiredSkills || [],
        experience: selectedJob.experience || { min: 0, max: 5 },
        location: selectedJob.location || "",
        salary: selectedJob.salary || { min: 0, max: 0, currency: "INR" },
        status: selectedJob.status || "draft",
      });
    }
  }, [selectedJob, isEditMode]);

  // Handle success/error
  useEffect(() => {
    if (success) {
      Alert.alert(
        "Success",
        isCreateMode
          ? "Job created successfully!"
          : "Job updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              dispatch(clearSuccess());
              router.back();
            },
          },
        ]
      );
    }
    if (error && jobId != "create-job") {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [success, error]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = "At least one skill is required";
    }

    if (formData.experience.min < 0 || formData.experience.max < 0) {
      newErrors.experience = "Experience cannot be negative";
    }

    if (formData.experience.min > formData.experience.max) {
      newErrors.experience = "Minimum experience cannot exceed maximum";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Skill
  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim().toLowerCase();
    if (trimmedSkill && !formData.requiredSkills.includes(trimmedSkill)) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, trimmedSkill],
      });
      setSkillInput("");
      if (errors.requiredSkills) {
        setErrors({ ...errors, requiredSkills: null });
      }
    }
  };

  // Remove Skill
  const handleRemoveSkill = (index) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index),
    });
  };

  // Submit Form
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (isCreateMode) {
      dispatch(createNewJob({ jobData: formData, token }));
    } else {
      dispatch(updateJobById({ id: jobId, jobData: formData, token }));
    }
  };

  // Save as Draft
  const handleSaveAsDraft = () => {
    setFormData({ ...formData, status: "draft" });
    setTimeout(() => handleSubmit(), 100);
  };

  // Publish Directly
  const handlePublish = () => {
    setFormData({ ...formData, status: "published" });
    setTimeout(() => handleSubmit(), 100);
  };

  if (isEditMode && loading && !selectedJob) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isCreateMode ? "Create New Job" : "Edit Job",
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Title */}
        <View style={styles.inputGroup}>
          <TextInput
            label="Job Title *"
            value={formData.title}
            onChangeText={(text) => {
              setFormData({ ...formData, title: text });
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            mode="outlined"
            error={!!errors.title}
            left={<TextInput.Icon icon="briefcase" />}
          />
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <TextInput
            label="Job Description *"
            value={formData.description}
            onChangeText={(text) => {
              setFormData({ ...formData, description: text });
              if (errors.description)
                setErrors({ ...errors, description: null });
            }}
            mode="outlined"
            multiline
            numberOfLines={6}
            error={!!errors.description}
            left={<TextInput.Icon icon="text" />}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>
        </View>

        {/* Required Skills */}
        <View style={styles.inputGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Required Skills *
          </Text>
          <View style={styles.skillInputContainer}>
            <TextInput
              label="Add Skill"
              value={skillInput}
              onChangeText={setSkillInput}
              mode="outlined"
              style={styles.skillInput}
              onSubmitEditing={handleAddSkill}
              returnKeyType="done"
              right={
                <TextInput.Icon
                  icon="plus-circle"
                  onPress={handleAddSkill}
                  disabled={!skillInput.trim()}
                />
              }
            />
          </View>
          <HelperText type="info">
            Press + to add skill. Type and press enter.
          </HelperText>
          {errors.requiredSkills && (
            <HelperText type="error">{errors.requiredSkills}</HelperText>
          )}
          <View style={styles.skillsContainer}>
            {formData.requiredSkills.map((skill, index) => (
              <Chip
                key={index}
                onClose={() => handleRemoveSkill(index)}
                style={styles.skillChip}
                mode="flat"
              >
                {skill}
              </Chip>
            ))}
          </View>
        </View>

        {/* Experience Range */}
        <View style={styles.inputGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Experience Required
          </Text>
          <View style={styles.row}>
            <TextInput
              label="Min (years)"
              value={formData.experience.min.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  experience: {
                    ...formData.experience,
                    min: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.halfInput}
              left={<TextInput.Icon icon="clock-outline" />}
            />
            <TextInput
              label="Max (years)"
              value={formData.experience.max.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  experience: {
                    ...formData.experience,
                    max: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.halfInput}
            />
          </View>
          {errors.experience && (
            <HelperText type="error">{errors.experience}</HelperText>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <TextInput
            label="Job Location"
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
            mode="outlined"
            left={<TextInput.Icon icon="map-marker" />}
            placeholder="e.g., Remote, Hyderabad, Bangalore"
          />
        </View>

        {/* Salary Range (Optional) */}
        <View style={styles.inputGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Salary Range (Optional)
          </Text>
          <View style={styles.row}>
            <TextInput
              label="Min Salary"
              value={formData.salary.min.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  salary: {
                    ...formData.salary,
                    min: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.halfInput}
              left={<TextInput.Icon icon="currency-inr" />}
            />
            <TextInput
              label="Max Salary"
              value={formData.salary.max.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  salary: {
                    ...formData.salary,
                    max: parseInt(text) || 0,
                  },
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.halfInput}
            />
          </View>
          <HelperText type="info">
            Leave 0 if you don't want to specify
          </HelperText>
        </View>

        {/* Job Status */}
        <View style={styles.inputGroup}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Job Status
          </Text>
          <SegmentedButtons
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
            buttons={[
              {
                value: "draft",
                label: "Draft",
                icon: "file-document-outline",
              },
              {
                value: "published",
                label: "Published",
                icon: "eye",
              },
            ]}
          />
          <HelperText type="info">
            {formData.status === "draft"
              ? "Save as draft to edit later"
              : "Job will be visible to applicants"}
          </HelperText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {isCreateMode ? "Create Job" : "Update Job"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default JobForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  skillInputContainer: {
    marginBottom: 8,
  },
  skillInput: {
    flex: 1,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: "#f0e6ff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

import { StyleSheet, View, ScrollView, Modal } from "react-native";
import React, { useState } from "react";
import { Text, Button, Card, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { logoutUser } from "../../../redux/slices/authslice";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const { top } = useSafeAreaInsets();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleResumeUpload = () => {};
  const handleResumeView = () => {};
  const handleEditProfile = () => {};

  const userSkills = [
    "React Native",
    "JavaScript",
    "Node.js",
    "MongoDB",
    "Redux",
    "REST APIs",
    "Git",
  ];

  const resumeInfo = {
    fileName: "resume_2025.pdf",
    uploadedDate: "2025-12-01",
    size: "245 KB",
  };

  const LogoutConfirmModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <Text variant="titleMedium" style={styles.modalTitle}>
            Sign out?
          </Text>

          <Text variant="bodyMedium" style={styles.modalMessage}>
            Are you sure you want to logout from your account?
          </Text>

          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              buttonColor="#EF4444"
              style={styles.modalButton}
              onPress={() => {
                setShowLogoutModal(false);
                dispatch(logoutUser());
              }}
            >
              Sign Out
            </Button>

            <Button
              mode="outlined"
              style={styles.modalButton}
              onPress={() => setShowLogoutModal(false)}
            >
              Stay
            </Button>
          </View>
        </Card>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <LogoutConfirmModal />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.profileName}>
                  {user?.name || "Your Name"}
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {user?.email || "email@example.com"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {user?.phone || "+91 1234567890"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {user?.experience || "2"} years experience
                  </Text>
                </View>
              </View>
            </View>
            <Button
              mode="contained"
              icon="account-edit"
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color="#6200ee" />
              <Text variant="titleMedium" style={styles.cardTitle}>
                Skills
              </Text>
            </View>
            <View style={styles.skillsContainer}>
              {userSkills.map((skill, index) => (
                <Chip
                  key={index}
                  style={styles.skillChip}
                  textStyle={styles.skillText}
                >
                  {skill}
                </Chip>
              ))}
            </View>
            <Button mode="text" icon="plus" style={styles.addButton}>
              Add Skill
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="document-attach" size={24} color="#6200ee" />
              <Text variant="titleMedium" style={styles.cardTitle}>
                Resume
              </Text>
            </View>
            {resumeInfo ? (
              <>
                <View style={styles.resumeInfo}>
                  <Ionicons name="document" size={24} color="#6200ee" />
                  <View style={styles.resumeDetails}>
                    <Text variant="bodyMedium" style={styles.resumeFileName}>
                      {resumeInfo.fileName}
                    </Text>
                    <Text variant="bodySmall" style={styles.resumeMeta}>
                      Uploaded: {resumeInfo.uploadedDate} • {resumeInfo.size}
                    </Text>
                  </View>
                </View>
                <View style={styles.resumeActions}>
                  <Button
                    mode="outlined"
                    icon="cloud-upload"
                    style={styles.resumeButton}
                  >
                    Update
                  </Button>
                  <Button
                    mode="outlined"
                    icon="eye"
                    style={styles.resumeButton}
                  >
                    View
                  </Button>
                  <Button
                    mode="outlined"
                    icon="download"
                    style={styles.resumeButton}
                  >
                    Download
                  </Button>
                </View>
              </>
            ) : (
              <Button
                mode="contained"
                icon="cloud-upload"
                style={styles.uploadButton}
              >
                Upload Resume
              </Button>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          loading={isLoading}
          disabled={isLoading}
          style={styles.logoutButton}
          contentStyle={styles.buttonContent}
          buttonColor="#EF4444"
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  modalMessage: {
    color: "#555",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
  profileCard: {
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  infoText: {
    color: "#666",
    marginLeft: 8,
  },
  editButton: {
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: "#f0e6ff",
  },
  skillText: {
    color: "#6200ee",
    fontWeight: "600",
  },
  addButton: {
    marginTop: 8,
  },
  resumeInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 12,
  },
  resumeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  resumeFileName: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  resumeMeta: {
    color: "#999",
    marginTop: 4,
  },
  resumeActions: {
    flexDirection: "row",
    gap: 8,
  },
  resumeButton: {
    flex: 1,
    borderRadius: 8,
  },
  uploadButton: {
    borderRadius: 8,
  },
  logoutButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

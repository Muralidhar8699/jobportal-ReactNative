import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  fetchAllUsers,
  createNewUser,
  updateUserById,
  deleteUserById,
  clearError,
  clearSuccess,
} from "../../../redux/slices/userSlice";

const Users = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const searchQuery = searchParams.q || "";

  const { users, pagination, loading, error, success } = useSelector(
    (state) => state.users
  );
  const { token } = useSelector((state) => state.auth);

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["75%", "90%"], []);

  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "hr",
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  }, [users, searchQuery]);

  const roleCounts = useMemo(() => {
    const counts = {
      all: searchQuery ? filteredUsers.length : pagination.totalUsers || 0,
      hr: 0,
      admin: 0,
    };

    filteredUsers.forEach((user) => {
      if (user.role === "hr") counts.hr++;
      if (user.role === "admin") counts.admin++;
    });

    return counts;
  }, [filteredUsers, pagination.totalUsers, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (success) {
      Alert.alert("Success", success);
      dispatch(clearSuccess());
      bottomSheetModalRef.current?.dismiss();
      resetForm();
      handleRefresh();
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error]);

  const loadUsers = () => {
    dispatch(
      fetchAllUsers({
        role: roleFilter,
        page: currentPage,
        limit: 10,
        token,
      })
    );
  };

  const handleSearchChange = useCallback(
    (event) => {
      const text = event.nativeEvent.text;
      router.setParams({ q: text });
    },
    [router]
  );

  const handleLoadMore = () => {
    if (
      !loadingMore &&
      !loading &&
      !searchQuery &&
      pagination.currentPage < pagination.totalPages
    ) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      dispatch(
        fetchAllUsers({
          role: roleFilter,
          page: nextPage,
          limit: 10,
          token,
        })
      ).finally(() => {
        setLoadingMore(false);
      });
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    dispatch(
      fetchAllUsers({
        role: roleFilter,
        page: 1,
        limit: 10,
        token,
      })
    ).finally(() => {
      setRefreshing(false);
    });
  }, [roleFilter, token]);

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    dispatch(createNewUser({ formData, token }));
  };

  const handleUpdateUser = () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    dispatch(
      updateUserById({
        id: selectedUser._id,
        userData: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        },
        token,
      })
    );
  };

  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteUserById({ userId: userToDelete.id, token }));
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const openCreateModal = useCallback(() => {
    setEditMode(false);
    resetForm();
    bottomSheetModalRef.current?.present();
  }, []);

  const openEditModal = useCallback((user) => {
    setEditMode(true);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    bottomSheetModalRef.current?.present();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "hr" });
    setSelectedUser(null);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: item.role === "admin" ? "#ff6b6b" : "#4ecdc4",
              },
            ]}
          >
            <Text style={styles.roleBadgeText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.createdAt && (
          <Text style={styles.userDate}>
            Joined: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Feather name="edit" size={20} color="#6200ee" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item._id, item.name)}
        >
          <MaterialIcons name="delete" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (label, value, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        roleFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => {
        setRoleFilter(value);
        setCurrentPage(1);
      }}
    >
      <Text
        style={[
          styles.filterButtonText,
          roleFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.countBadge,
          roleFilter === value && styles.countBadgeActive,
        ]}
      >
        <Text
          style={[
            styles.countBadgeText,
            roleFilter === value && styles.countBadgeTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6200ee" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "User Management",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={openCreateModal}
            >
              <Ionicons name="add-circle" size={28} color="#6200ee" />
            </TouchableOpacity>
          ),
          headerSearchBarOptions: {
            placeholder: "Search users by name or email...",
            hideWhenScrolling: false,
            autoCapitalize: "none",
            barTintColor: "#f0f0f0",
            hintTextColor: "#888",
            onChangeText: handleSearchChange,
          },
        }}
      />

      <View style={styles.filterSection}>
        {renderFilterButton("All", "", roleCounts.all)}
        {renderFilterButton("HR", "hr", roleCounts.hr)}
        {renderFilterButton("Admin", "admin", roleCounts.admin)}
      </View>

      {loading && !loadingMore && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading && !refreshing ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No users found matching your search"
                    : "No users found"}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning-outline" size={50} color="#ff6b6b" />
            </View>

            <Text style={styles.deleteModalTitle}>Delete User</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{" "}
              <Text style={styles.deleteModalUserName}>
                {userToDelete?.name}
              </Text>
              ?
            </Text>
            <Text style={styles.deleteModalSubtext}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={({ style }) => (
          <View style={[style, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]} />
        )}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableDynamicSizing={true}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {editMode ? "Edit User" : "Create New User"}
            </Text>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.dismiss()}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Enter email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {!editMode && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password *</Text>
              <BottomSheetTextInput
                style={styles.input}
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role *</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === "hr" && styles.roleOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, role: "hr" })}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    formData.role === "hr" && styles.roleOptionTextActive,
                  ]}
                >
                  HR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === "admin" && styles.roleOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, role: "admin" })}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    formData.role === "admin" && styles.roleOptionTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={editMode ? handleUpdateUser : handleCreateUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? "Update User" : "Create User"}
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerButton: {
    marginRight: 10,
  },
  filterSection: {
    flexDirection: "row",
    paddingBottom: 10,
    paddingHorizontal: 15,
    gap: 10,
    backgroundColor: "#fff",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6200ee",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#6200ee",
  },
  filterButtonText: {
    color: "#6200ee",
    fontWeight: "600",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  countBadge: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeActive: {
    backgroundColor: "#fff",
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  countBadgeTextActive: {
    color: "#6200ee",
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  userDate: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    borderWidth: 0.1,
    borderRadius: 20,
  },
  deleteButton: {
    padding: 8,
    borderWidth: 0.1,
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  deleteIconContainer: {
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  deleteModalUserName: {
    fontWeight: "bold",
    color: "#333",
  },
  deleteModalSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  bottomSheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  roleSelector: {
    flexDirection: "row",
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6200ee",
    alignItems: "center",
  },
  roleOptionActive: {
    backgroundColor: "#6200ee",
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6200ee",
  },
  roleOptionTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

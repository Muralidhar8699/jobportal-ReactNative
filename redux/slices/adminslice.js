import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "./authslice";

const API_URL = BASE_URL;

// ==================== Async Thunks ====================

// Get Admin Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

// ==================== Initial State ====================
const initialState = {
  stats: null,
  quickStats: null,
  topJobs: [],
  topSkills: [],
  topHRs: [],
  recentActivities: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// ==================== Slice ====================
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.stats = null;
      state.quickStats = null;
      state.topJobs = [];
      state.topSkills = [];
      state.topHRs = [];
      state.recentActivities = [];
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch Dashboard Stats ============
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.quickStats = action.payload.quickStats;
        state.topJobs = action.payload.topJobs;
        state.topSkills = action.payload.topSkills;
        state.topHRs = action.payload.topHRs;
        state.recentActivities = action.payload.recentActivities;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;

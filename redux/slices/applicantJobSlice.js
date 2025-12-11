import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "./authslice";

const API_URL = BASE_URL;

export const fetchApplicantJobs = createAsyncThunk(
  "applicantJobs/fetchJobs",
  async (
    { status, location, skills, page = 1, limit = 10, token },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      if (location) params.append("location", location);
      if (skills) params.append("skills", skills);

      const response = await axios.get(`${API_URL}/jobs/published`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch jobs"
      );
    }
  }
);

const applicantJobsSlice = createSlice({
  name: "applicantJobs",
  initialState: {
    jobs: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    filters: { status: "", location: "", skills: "" },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: "", location: "", skills: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicantJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicantJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchApplicantJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters } =
  applicantJobsSlice.actions;
export default applicantJobsSlice.reducer;

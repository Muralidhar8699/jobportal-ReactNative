import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "./authslice";

const API_URL = BASE_URL;

// ==================== Async Thunks ====================

// Get all jobs (for HR/Admin) with filters
export const fetchAllJobs = createAsyncThunk(
  "jobs/fetchAll",
  async (
    { status, location, skills, page = 1, limit = 10, token },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (location) params.append("location", location);
      if (skills) params.append("skills", skills);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(`${API_URL}/jobs?${params.toString()}`, {
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

// Get published jobs (for applicants) - Public
export const fetchPublishedJobs = createAsyncThunk(
  "jobs/fetchPublished",
  async (
    { location, skills, experience, page = 1, limit = 10 },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (location) params.append("location", location);
      if (skills) params.append("skills", skills);
      if (experience) params.append("experience", experience);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(
        `${API_URL}/jobs/published?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch published jobs"
      );
    }
  }
);

// Get single job by ID
export const fetchJobById = createAsyncThunk(
  "jobs/fetchById",
  async ({ jobId, token }, { rejectWithValue }) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(`${API_URL}/jobs/${jobId}`, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job"
      );
    }
  }
);

// Create new job
export const createNewJob = createAsyncThunk(
  "jobs/create",
  async ({ jobData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create job"
      );
    }
  }
);

// Update job
export const updateJobById = createAsyncThunk(
  "jobs/update",
  async ({ id, jobData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id, data: response.data.data, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update job"
      );
    }
  }
);

// Delete job
export const deleteJobById = createAsyncThunk(
  "jobs/delete",
  async ({ jobId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id: jobId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete job"
      );
    }
  }
);

// Publish/Unpublish/Close job
export const updateJobStatus = createAsyncThunk(
  "jobs/updateStatus",
  async ({ id, status, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/jobs/${id}/publish`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return {
        id,
        status,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update job status"
      );
    }
  }
);

// Get job statistics (for dashboard)
export const fetchJobStats = createAsyncThunk(
  "jobs/fetchStats",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job statistics"
      );
    }
  }
);

// ==================== Initial State ====================
const initialState = {
  jobs: [],
  publishedJobs: [],
  selectedJob: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  loading: false,
  error: null,
  success: null,
};

// ==================== Slice ====================
const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch All Jobs (HR/Admin) ============
      .addCase(fetchAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Fetch Published Jobs (Public) ============
      .addCase(fetchPublishedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedJobs = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchPublishedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Fetch Job By ID ============
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Create Job ============
      .addCase(createNewJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createNewJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Optionally add the new job to the list
        if (action.payload.data) {
          state.jobs.unshift(action.payload.data);
        }
      })
      .addCase(createNewJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Update Job ============
      .addCase(updateJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update job in the list if it exists
        const index = state.jobs.findIndex(
          (job) => job._id === action.payload.id
        );
        if (index !== -1) {
          state.jobs[index] = action.payload.data;
        }
        // Update selected job if it's the same
        if (state.selectedJob?._id === action.payload.id) {
          state.selectedJob = action.payload.data;
        }
      })
      .addCase(updateJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Delete Job ============
      .addCase(deleteJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Remove job from the list
        state.jobs = state.jobs.filter((job) => job._id !== action.payload.id);
        state.pagination.total -= 1;
      })
      .addCase(deleteJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Update Job Status ============
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update status in the list
        const index = state.jobs.findIndex(
          (job) => job._id === action.payload.id
        );
        if (index !== -1) {
          state.jobs[index].status = action.payload.status;
          state.jobs[index].updatedAt = new Date().toISOString();
        }
        // Update selected job if it's the same
        if (state.selectedJob?._id === action.payload.id) {
          state.selectedJob.status = action.payload.status;
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============ Fetch Job Stats ============
      .addCase(fetchJobStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchJobStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedJob, clearStats } =
  jobsSlice.actions;

export default jobsSlice.reducer;

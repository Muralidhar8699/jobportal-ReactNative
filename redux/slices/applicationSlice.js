import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "./authslice";

const API_URL = BASE_URL;

// ==================== Async Thunks ====================

// Apply for a job (Applicant)
export const applyForJob = createAsyncThunk(
  "applications/apply",
  async ({ jobId, formData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/applications/apply/${jobId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          transformRequest: (data) => data,
        }
      );
      return response.data; // { success, message, data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit application"
      );
    }
  }
);

// Get applicant's own applications
export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMy",
  async ({ status, page = 1, limit = 10, token }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(
        `${API_URL}/applications/my-applications?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // { success, data, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your applications"
      );
    }
  }
);

// Get all applications (HR/Admin)
export const fetchAllApplications = createAsyncThunk(
  "applications/fetchAll",
  async (
    { status, jobId, page = 1, limit = 10, token },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (jobId) params.append("jobId", jobId);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(
        `${API_URL}/applications?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // { success, data, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch applications"
      );
    }
  }
);

// Get applications by job (HR/Admin)
export const fetchApplicationsByJob = createAsyncThunk(
  "applications/fetchByJob",
  async (
    { jobId, status, page = 1, limit = 10, token },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(
        `${API_URL}/applications/job/${jobId}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // { success, data, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job applications"
      );
    }
  }
);

// Get single application by ID
export const fetchApplicationById = createAsyncThunk(
  "applications/fetchById",
  async ({ applicationId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/applications/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data; // application object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch application"
      );
    }
  }
);

// Update application status (HR/Admin)
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ applicationId, status, notes, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/applications/${applicationId}/status`,
        { status, notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return {
        id: applicationId,
        status,
        notes,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update application status"
      );
    }
  }
);

// Withdraw application (Applicant)
export const withdrawApplication = createAsyncThunk(
  "applications/withdraw",
  async ({ applicationId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/applications/${applicationId}/withdraw`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { id: applicationId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to withdraw application"
      );
    }
  }
);

// Delete application (Admin)
export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async ({ applicationId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/applications/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { id: applicationId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete application"
      );
    }
  }
);

// Download/Get resume URL (HR/Admin)
export const downloadResume = createAsyncThunk(
  "applications/downloadResume",
  async ({ applicationId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/applications/${applicationId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      return response.data; // { success, resumeUrl, cloudinaryPublicId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get resume URL"
      );
    }
  }
);

// Get application statistics (HR/Admin)
export const fetchApplicationStats = createAsyncThunk(
  "applications/fetchStats",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/applications/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data; // stats object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch application statistics"
      );
    }
  }
);

// ==================== Initial State ====================
const initialState = {
  applications: [],
  myApplications: [],
  jobApplications: [],
  selectedApplication: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  loading: false,
  uploading: false,
  error: null,
  success: null,
  resumeUrl: null,
};

// ==================== Slice ====================
const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearResumeUrl: (state) => {
      state.resumeUrl = null;
    },
    resetApplications: (state) => {
      state.applications = [];
      state.myApplications = [];
      state.jobApplications = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply for Job
      .addCase(applyForJob.pending, (state) => {
        state.uploading = true;
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.uploading = false;
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.data) {
          state.myApplications.unshift(action.payload.data);
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.uploading = false;
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch My Applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Applications
      .addCase(fetchAllApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Applications By Job
      .addCase(fetchApplicationsByJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsByJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobApplications = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchApplicationsByJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Application By ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Application Status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;

        const updateLists = (list) => {
          const idx = list.findIndex((app) => app._id === action.payload.id);
          if (idx !== -1) {
            list[idx].status = action.payload.status;
            if (action.payload.notes) list[idx].notes = action.payload.notes;
            list[idx].updatedAt = new Date().toISOString();
          }
        };

        updateLists(state.applications);
        updateLists(state.jobApplications);
        updateLists(state.myApplications);

        if (state.selectedApplication?._id === action.payload.id) {
          state.selectedApplication.status = action.payload.status;
          if (action.payload.notes) {
            state.selectedApplication.notes = action.payload.notes;
          }
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Withdraw Application
      .addCase(withdrawApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.myApplications = state.myApplications.filter(
          (app) => app._id !== action.payload.id
        );
        if (state.pagination.total > 0) state.pagination.total -= 1;
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Application
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.applications = state.applications.filter(
          (app) => app._id !== action.payload.id
        );
        state.jobApplications = state.jobApplications.filter(
          (app) => app._id !== action.payload.id
        );
        if (state.pagination.total > 0) state.pagination.total -= 1;
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Download Resume
      .addCase(downloadResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadResume.fulfilled, (state, action) => {
        state.loading = false;
        state.resumeUrl = action.payload.resumeUrl;
      })
      .addCase(downloadResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Application Stats
      .addCase(fetchApplicationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchApplicationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearSelectedApplication,
  clearStats,
  clearResumeUrl,
  resetApplications,
} = applicationSlice.actions;

export default applicationSlice.reducer;

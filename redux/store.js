import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";
import usersReducer from "./slices/userSlice";
import jobReducer from "./slices/jobSlice";
import dashboardReducer from "./slices/adminslice";
import ApplicantjobReducer from "./slices/applicantJobSlice";
import applicationReducer from "./slices/applicationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    jobs: jobReducer,
    dashboard: dashboardReducer,
    applicantJobs: ApplicantjobReducer,
    applications: applicationReducer,
  },
});

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export const BASE_URL =
  "https://distributed-phillips-insulin-diy.trycloudflare.com";

const TOKEN_KEY = "token";
const ROLE_KEY = "role";

/* =====================================================
   BOOTSTRAP AUTH
===================================================== */
export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrapAuth",
  async (_, { dispatch }) => {
    const [token, role] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(ROLE_KEY),
    ]);

    if (token) {
      await dispatch(getMe(token));
    }

    return { token, role };
  }
);

/* =====================================================
   REGISTER
===================================================== */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, phone, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
      });

      await AsyncStorage.setItem(TOKEN_KEY, res.data.token);
      await AsyncStorage.setItem(ROLE_KEY, res.data.role);

      await dispatch(getMe(res?.data?.token));

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

/* =====================================================
   LOGIN
===================================================== */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem(TOKEN_KEY, res.data.token);
      await AsyncStorage.setItem(ROLE_KEY, res.data.role);

      await dispatch(getMe(res?.data?.token));

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* =====================================================
   GET CURRENT USER
===================================================== */
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "If-None-Match": "",
          "If-Modified-Since": "0",
        },
      });

      // FIXED — backend sometimes returns user OR plain object
      return res.data.user ?? res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to get user"
      );
    }
  }
);

/* =====================================================
   LOGOUT
===================================================== */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(ROLE_KEY);

  setTimeout(() => {
    router.replace("/(auth)");
  }, 100);

  return null;
});

/* =====================================================
   AUTH SLICE
===================================================== */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    token: null,
    role: null,
    user: null,
    isLoading: false,
    error: null,
    registerError: null,
    loginError: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.registerError = null;
      state.loginError = null;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // BOOTSTRAP
      .addCase(bootstrapAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.isLoggedIn = !!action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Bootstrap failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;

        // FIXED
        state.user = action.payload.user ?? action.payload;

        state.isLoggedIn = true;
        state.isLoading = false;
        state.registerError = null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.registerError = action.payload;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;

        // FIXED
        state.user = action.payload.user ?? action.payload;

        state.isLoggedIn = true;
        state.isLoading = false;
        state.loginError = null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.payload;
        state.error = action.payload;
      })

      // GET ME
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        // FIXED
        state.user = action.payload;

        state.isLoading = false;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.user = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.error = null;
        state.registerError = null;
        state.loginError = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearAuthError, clearRegisterError, clearLoginError } =
  authSlice.actions;

export default authSlice.reducer;

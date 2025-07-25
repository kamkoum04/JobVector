import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authApi } from "@/lib/api"

interface User {
  id: number
  email: string
  nom: string
  prenom: string
  cin: number
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN"
  enabled: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials: { email: string; password: string }) => {
  const response = await authApi.login(credentials)
  const { token, refreshToken, utilisateurs } = response.data

  localStorage.setItem("token", token)
  localStorage.setItem("refreshToken", refreshToken)
  localStorage.setItem("user", JSON.stringify(utilisateurs))

  return { token, refreshToken, user: utilisateurs }
})

export const register = createAsyncThunk(
  "auth/register",
  async (userData: {
    email: string
    password: string
    nom: string
    prenom: string
    cin: string
    role: "CANDIDATE" | "EMPLOYER"
  }) => {
    const response = await authApi.register(userData)
    return response.data
  },
)

export const refreshToken = createAsyncThunk("auth/refreshToken", async (refreshToken: string) => {
  const response = await authApi.refresh(refreshToken)
  const { token: newToken, refreshToken: newRefreshToken } = response.data

  localStorage.setItem("token", newToken)
  localStorage.setItem("refreshToken", newRefreshToken)

  return { token: newToken, refreshToken: newRefreshToken }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem("token")
      const refreshToken = localStorage.getItem("refreshToken")
      const userStr = localStorage.getItem("user")

      if (token && userStr) {
        state.token = token
        state.refreshToken = refreshToken
        state.user = JSON.parse(userStr)
        state.isAuthenticated = true
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Login failed"
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Registration failed"
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
      })
  },
})

export const { logout, loadUserFromStorage, clearError } = authSlice.actions
export default authSlice.reducer

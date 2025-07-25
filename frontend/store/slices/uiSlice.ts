import { createSlice } from "@reduxjs/toolkit"

interface UIState {
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  sidebarOpen: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const { toggleSidebar, setSidebarOpen, addNotification, removeNotification, clearNotifications } =
  uiSlice.actions

export default uiSlice.reducer

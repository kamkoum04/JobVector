import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { candidateApi, employerApi } from "@/lib/api"

interface Application {
  id: number
  candidatId: number
  candidatNom: string
  candidatPrenom: string
  candidatEmail: string
  jobOffreId: number
  jobOffreTitre: string
  jobOffreEntreprise: string
  jobOffreLocalisation: string
  statut: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE"
  dateCandidature: string
  dateModification: string
  lettreMotivation?: string
  cvFilePath?: string
  cvDataSnapshot?: string
  statutDescription: string
  scoreVisible: boolean
}

interface ApplicationsState {
  applications: Application[]
  totalElements: number
  totalPages: number
  currentPage: number
  loading: boolean
  error: string | null
}

const initialState: ApplicationsState = {
  applications: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  loading: false,
  error: null,
}

// Async thunks
export const fetchMyApplications = createAsyncThunk(
  "applications/fetchMyApplications",
  async (params?: { page?: number; size?: number }) => {
    const response = await candidateApi.getMyApplications(params)
    return response.data
  },
)

export const applyForJob = createAsyncThunk(
  "applications/applyForJob",
  async ({ jobId, data }: { jobId: number; data: { lettreMotivation?: string } }) => {
    const response = await candidateApi.applyForJob(jobId, data)
    return response.data
  },
)

export const withdrawApplication = createAsyncThunk(
  "applications/withdrawApplication",
  async (applicationId: number) => {
    await candidateApi.withdrawApplication(applicationId)
    return applicationId
  },
)

export const fetchEmployerApplications = createAsyncThunk(
  "applications/fetchEmployerApplications",
  async (params?: { page?: number; size?: number }) => {
    const response = await employerApi.getApplications(params)
    return response.data
  },
)

export const fetchJobApplications = createAsyncThunk(
  "applications/fetchJobApplications",
  async ({ jobId, params }: { jobId: number; params?: { page?: number; size?: number } }) => {
    const response = await employerApi.getJobApplications(jobId, params)
    return response.data
  },
)

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({
    applicationId,
    data,
  }: {
    applicationId: number
    data: {
      statut: "ACCEPTEE" | "REFUSEE" | "EN_ATTENTE"
      commentaireEmployeur?: string
      commentairePublic?: string
    }
  }) => {
    const response = await employerApi.updateApplicationStatus(applicationId, data)
    return { applicationId, ...data, ...response.data }
  },
)

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload.applications || []
        state.totalElements = action.payload.totalElements || 0
        state.totalPages = action.payload.totalPages || 0
        state.currentPage = action.payload.page || 0
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch applications"
      })
      // Apply for job
      .addCase(applyForJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.loading = false
        // Add the new application to the list
        if (action.payload) {
          state.applications.unshift(action.payload)
          state.totalElements += 1
        }
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to apply for job"
      })
      // Withdraw application
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter((app) => app.id !== action.payload)
      })
      // Fetch employer applications
      .addCase(fetchEmployerApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload.applications || []
        state.totalElements = action.payload.totalElements || 0
      })
      // Fetch job applications
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload.applications || []
        state.totalElements = action.payload.totalElements || 0
      })
      // Update application status
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex((app) => app.id === action.payload.applicationId)
        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            statut: action.payload.statut,
            commentaireEmployeur: action.payload.commentaireEmployeur,
            commentairePublic: action.payload.commentairePublic,
          }
        }
      })
  },
})

export const { clearError } = applicationsSlice.actions
export default applicationsSlice.reducer

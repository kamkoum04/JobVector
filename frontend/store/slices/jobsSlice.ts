import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { publicJobApi } from "@/lib/api"

interface Job {
  id: number
  titre: string
  description: string
  localisation: string
  datePublication: string
  statut: string
  competencesTechniques: string
  competencesTransversales: string
  outilsTechnologies: string
  experienceMinRequise: number
  niveauEtudeMin: string
  languesRequises: string
  secteurActivite: string
  missionPrincipale: string
  responsabilites: string
  typePoste: string
  modaliteTravail: string
  entreprise: string
  typeContrat: string
  salaire: number
  experience: number
  employeurId: number
  employeurNom: string
  employeurPrenom: string
  employeurEmail: string
}

interface JobsState {
  jobs: Job[]
  currentJob: Job | null
  loading: boolean
  error: string | null
  totalElements: number
  totalPages: number
  currentPage: number
  filters: {
    keyword: string
    titre: string
    localisation: string
    secteurActivite: string
    typePoste: string
    modaliteTravail: string
  }
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  filters: {
    keyword: "",
    titre: "",
    localisation: "",
    secteurActivite: "",
    typePoste: "",
    modaliteTravail: "",
  },
}

// Async thunks
export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async (params: { page?: number; size?: number }) => {
  const response = await publicJobApi.getAllJobs(params)
  return response.data
})

export const fetchJobById = createAsyncThunk("jobs/fetchJobById", async (id: number) => {
  const response = await publicJobApi.getJobById(id)
  return response.data
})

export const searchJobs = createAsyncThunk(
  "jobs/searchJobs",
  async (params: { keyword: string; page?: number; size?: number }) => {
    const response = await publicJobApi.searchJobs(params)
    return response.data
  },
)

export const searchJobsWithFilters = createAsyncThunk(
  "jobs/searchJobsWithFilters",
  async (params: {
    titre?: string
    localisation?: string
    secteurActivite?: string
    typePoste?: string
    modaliteTravail?: string
    page?: number
    size?: number
  }) => {
    const response = await publicJobApi.searchJobsWithFilters(params)
    return response.data
  },
)

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<JobsState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearCurrentJob: (state) => {
      state.currentJob = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = action.payload.jobOffers || action.payload.content || []
        state.totalElements = action.payload.totalElements || action.payload.length || 0
        state.totalPages = action.payload.totalPages || 1
        state.currentPage = action.payload.currentPage || 0
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch jobs"
      })
      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false
        state.currentJob = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch job"
      })
      // Search jobs
      .addCase(searchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = action.payload.jobOffers || action.payload.content || []
        state.totalElements = action.payload.totalElements || action.payload.length || 0
        state.totalPages = action.payload.totalPages || 1
        state.currentPage = action.payload.currentPage || 0
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to search jobs"
      })
      // Search jobs with filters
      .addCase(searchJobsWithFilters.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchJobsWithFilters.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = action.payload.jobOffers || action.payload.content || []
        state.totalElements = action.payload.totalElements || action.payload.length || 0
        state.totalPages = action.payload.totalPages || 1
        state.currentPage = action.payload.currentPage || 0
      })
      .addCase(searchJobsWithFilters.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to search jobs with filters"
      })
  },
})

export const { setFilters, clearFilters, clearCurrentJob } = jobsSlice.actions
export default jobsSlice.reducer

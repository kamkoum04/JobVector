import axios from "axios"

const API_BASE_URL = "http://localhost:8080"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Authentication API
export const authApi = {
  register: (data: {
    email: string
    password: string
    nom: string
    prenom: string
    cin: string
    role: "CANDIDATE" | "EMPLOYER"
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) => api.post("/auth/login", data),

  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/api/user/change-password", data),
}

// Public Job API
export const publicJobApi = {
  getAllJobs: (params?: { page?: number; size?: number }) => api.get("/api/public/job-offers", { params }),

  getJobById: (id: number) => api.get(`/api/public/job-offers/${id}`),

  searchJobs: (params: { keyword: string; page?: number; size?: number }) =>
    api.get("/api/public/job-offers/search", { params }),

  searchJobsWithFilters: (params: {
    titre?: string
    localisation?: string
    secteurActivite?: string
    typePoste?: string
    modaliteTravail?: string
    page?: number
    size?: number
  }) => api.get("/api/public/job-offers/search/filters", { params }),
}

// User Profile API
export const userApi = {
  getProfile: () => api.get("/api/user/profile"),
  updateProfile: (data: { nom?: string; prenom?: string; email?: string }) => api.put("/api/user/profile", data),
  deleteAccount: () => api.delete("/api/user/profile"),
}

// Candidate API
export const candidateApi = {
  // Profile Management
  getProfile: () => api.get("/api/candidate/profile"),
  updateProfile: (data: any) => api.put("/api/candidate/profile", data),

  // CV Management
  uploadCV: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/api/candidate/cv/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  getMyCV: () => api.get("/api/candidate/cv/my-cv"),
  getCVStatus: () => api.get("/api/candidate/cv/status"),
  deleteCV: () => api.delete("/api/candidate/cv"),
  downloadCV: () => api.get("/api/candidate/cv/download", { responseType: "blob" }),

  // Job Applications
  applyForJob: (jobId: number, data: { lettreMotivation?: string }) =>
    api.post(`/api/candidate/job-offers/${jobId}/apply`, data),

  getMyApplications: (params?: { page?: number; size?: number }) => api.get("/api/candidate/applications", { params }),

  getApplicationById: (applicationId: number) => api.get(`/api/candidate/applications/${applicationId}`),

  checkApplicationStatus: (jobId: number) => api.get(`/api/candidate/job-offers/${jobId}/application-status`),

  // Favorites
  addToFavorites: (jobId: number) => api.post(`/api/candidate/job-offers/${jobId}/favorite`),
}

// Employer API
export const employerApi = {
  // Profile Management
  getProfile: () => api.get("/api/employer/profile"),
  updateProfile: (data: any) => api.put("/api/employer/profile", data),

  // Job Management
  createJob: (data: {
    titre: string
    description: string
    localisation: string
    entreprise: string
    typeContrat: string
    salaire: number
    experience: number
    dateExpiration: string
    competencesTechniques: string
    competencesTransversales: string
    experienceMinRequise: number
    experienceMaxSouhaitee?: number
    niveauEtudeMin: string
    languesRequises: string
    secteurActivite: string
    missionPrincipale: string
    responsabilites: string
    outilsTechnologies: string
    typePoste: string
    modaliteTravail: string
    niveauSeniorite: string
    motsClesGeneres?: string
  }) => api.post("/api/employer/job-offers", data),

  getMyJobs: (params?: { page?: number; size?: number }) => api.get("/api/employer/job-offers/my-offers", { params }),

  updateJob: (jobId: number, data: any) => api.put(`/api/employer/job-offers/${jobId}`, data),

  deleteJob: (jobId: number) => api.delete(`/api/employer/job-offers/${jobId}`),

  // Application Management
  getApplications: (params?: { page?: number; size?: number }) => api.get("/api/employer/applications", { params }),

  getJobApplications: (jobId: number, params?: { page?: number; size?: number }) =>
    api.get(`/api/employer/job-offers/${jobId}/applications`, { params }),

  getApplicationById: (applicationId: number) => api.get(`/api/employer/applications/${applicationId}`),

  updateApplicationStatus: (
    applicationId: number,
    data: {
      statut: "ACCEPTE" | "REFUSE" | "EN_ATTENTE" | "PRESELECTIONNE" | "VUE" | "RETIREE" | "ENTRETIEN"
      commentaireEmployeur?: string
      commentairePublic?: string
    },
  ) => api.put(`/api/employer/applications/${applicationId}/status`, data),

  downloadApplicationCV: (applicationId: number) =>
    api.get(`/api/employer/applications/${applicationId}/cv`, {
      responseType: "blob",
    }),
}

// Admin API
export const adminApi = {
  // User Management
  getUsers: (params?: { page?: number; size?: number }) => api.get("/api/admin/users", { params }),

  getUserById: (userId: number) => api.get(`/api/admin/users/${userId}`),

  updateUser: (userId: number, data: any) => api.put(`/api/admin/users/${userId}`, data),

  deleteUser: (userId: number) => api.delete(`/api/admin/users/${userId}`),

  // Job Management
  getJobs: (params?: { page?: number; size?: number }) => api.get("/api/admin/job-offers", { params }),

  deleteJob: (jobId: number) => api.delete(`/api/admin/job-offers/${jobId}`),
}

export default api

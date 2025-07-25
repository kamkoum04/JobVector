# 🚀 JobVector Frontend Specification for v0

## 🎯 Project Overview

**JobVector** is a modern AI-powered job matching platform that uses advanced vector embeddings to match candidates with job offers. The platform provides intelligent matching scores, comprehensive filtering, and a seamless user experience for both job seekers and employers.

### 🔧 Required Technology Stack
- **Frontend Framework**: React/Next.js 
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Redux
- **Authentication**: JWT tokens
- **Backend**: Spring Boot API (localhost:8080)

## 🌟 Complete User Journey Scenarios

### 🌍 **Scenario 1: Visitor Journey**

**User Flow:**
1. **Landing Page** → Visitor arrives, sees hero section with search bar
2. **Browse Jobs** → Can view ALL job offers without login (public access)
3. **Search & Filter** → Advanced filtering by location, salary, experience, skills
4. **Job Details** → Click on any job to see full details, requirements, company info
5. **Apply Attempt** → When trying to apply, system blocks with "Please register to apply"
6. **Registration** → Smooth transition to registration form
7. **Account Creation** → User creates account with email, password, nom, prénom, cin
8. **Back to Job** → After registration, return to job page with apply button enabled

**Key Requirements:**
- Public job browsing without authentication
- Clear registration prompts when trying to apply
- Seamless transition from visitor to registered user
- No functionality loss during registration process

### 🔐 **Scenario 2: Candidate Registration & Setup**

**User Flow:**
1. **Registration Form** → Email, password, nom, prénom, cin, role selection
2. **Email Verification** → Verify email address (optional implementation)
3. **Profile Setup** → Basic profile information
4. **CV Upload Requirement** → System immediately prompts for CV upload
5. **CV Upload Process** → Drag & drop PDF file (max 10MB)
6. **AI Processing** → System processes CV, extracts skills, experience, education
7. **Data Verification** → User reviews and confirms extracted information
8. **Profile Complete** → Now can apply for jobs with matching scores

**Key Requirements:**
- CV upload is MANDATORY before applying
- Clear messaging when CV is missing
- Real-time processing feedback
- Data extraction verification step

### 🎯 **Scenario 3: Job Application Process**

**User Flow:**
1. **Browse Jobs** → See personalized matching scores on each job
2. **Job Details** → View detailed job info + personal matching breakdown
3. **Matching Score Display** → Overall score + technical/soft skills/experience/education scores
4. **Apply Button** → If no CV: "Upload CV first", If CV exists: "Apply Now"
5. **Application Form** → Motivation letter (optional)
6. **Submit Application** → Confirmation message
7. **Application Tracking** → View in dashboard with status updates

**Key Requirements:**
- Matching scores visible only to authenticated users
- CV requirement check before applying
- Application status tracking
- Email notifications for status changes

### 🏢 **Scenario 4: Employer Journey**

**User Flow:**
1. **Employer Registration** → Same form, select "Employer" role
2. **Company Setup** → Company details, logo, description
3. **Job Creation** → Comprehensive job posting form
4. **Application Management** → View received applications
5. **Candidate Review** → Review applications, download CVs, see matching scores
6. **Status Management** → Update application status (pending, accepted, rejected)
7. **Communication** → Send messages to candidates

**Key Requirements:**
- Rich job posting form with all required fields
- Application management dashboard
- CV download functionality
- Candidate communication tools

### 🔄 **Scenario 5: Application Status Updates**

**User Flow:**
1. **Employer Reviews** → Employer sees application with matching scores
2. **Decision Making** → Accept, reject, or keep pending
3. **Status Update** → Employer updates status with comments
4. **Candidate Notification** → Candidate sees updated status in dashboard
5. **Communication** → Optional messages between employer and candidate

**Key Requirements:**
- Real-time status updates
- Comment system for feedback
- Notification system
- Status history tracking

### 🔧 **Scenario 6: Admin Management System**

**User Flow:**
1. **Admin Login** → Special admin authentication
2. **Dashboard Overview** → System statistics, active users, job posts
3. **User Management** → View all users, manage accounts, suspend/activate
4. **Job Management** → Review job posts, approve/reject, moderate content
5. **Application Monitoring** → Track all applications, identify issues
6. **System Analytics** → Generate reports, monitor performance metrics
7. **Content Moderation** → Review flagged content, manage complaints

**Key Requirements:**
- Comprehensive admin dashboard
- User account management (activate/deactivate)
- Job post moderation and approval
- System monitoring and analytics
- Content moderation tools
- Report generation capabilities

## 📱 Required Pages & Components

### 🏠 **1. Homepage (Public)**
**Purpose**: Landing page for visitors
**Features**:
- Hero section with search bar
- Featured jobs grid (6 jobs)
- Job categories filter
- Search section with quick filters
- Company logos and testimonials
- Statistics section (total jobs, companies, successful matches)

### 🔍 **2. Job Listings Page (Public)**
**Purpose**: Browse and filter all job offers
**Features**:
- Advanced search filters sidebar
- Job cards grid with pagination
- Sort options (date, salary, relevance, match score for authenticated)
- Filter chips showing active filters
- Loading states and empty states
- Infinite scroll or pagination

### 📋 **3. Job Details Page (Public + Authenticated)**
**Purpose**: Detailed job information
**Features**:
- Job header (title, company, location, salary)
- Job overview (contract type, experience, work mode)
- Full job description with rich text
- Requirements section (technical + soft skills)
- Company information and culture
- **For Visitors**: Apply button redirects to registration
- **For Authenticated**: Matching score display + apply functionality

### 📝 **4. Registration Page**
**Purpose**: User account creation
**Features**:
- Multi-step form with progress indicator
- Personal information (nom, prénom, email, cin)
- Account details (password with strength meter)
- Role selection (Candidate/Employer)
- Terms and conditions acceptance
- Email verification step

### 🔐 **5. Login Page**
**Purpose**: User authentication
**Features**:
- Email/password login form
- Remember me checkbox
- Password reset functionality
- Social login options (optional)
- Registration redirect link

### 📄 **6. CV Upload Page (Candidates Only)**
**Purpose**: CV upload and processing
**Features**:
- Drag & drop file upload zone
- File validation (PDF only, max 10MB)
- Upload progress indicator
- AI processing status display
- Extracted data preview and verification
- Edit extracted information option

### 🎯 **7. Candidate Dashboard**
**Purpose**: Main candidate interface
**Features**:
- Welcome header with profile completion
- Quick stats (applications, pending, accepted)
- Recommended jobs based on CV
- Recent applications with status
- Profile management shortcuts
- CV status and re-upload option

### 🏢 **8. Employer Dashboard**
**Purpose**: Main employer interface
**Features**:
- Company overview and stats
- Active job postings management
- Applications received overview
- Quick actions (create job, view analytics)
- Recent activity feed
- Company profile management

### 📊 **9. Applications Management**
**Purpose**: Manage job applications (both roles)
**Features**:
- **For Candidates**: View submitted applications, status tracking, withdraw option
- **For Employers**: Review applications, update status, download CVs, communicate
- Filtering and sorting options
- Bulk actions for employers
- Application details modal

### 💼 **10. Job Creation/Edit Page (Employers)**
**Purpose**: Create and manage job posts
**Features**:
- Comprehensive job posting form
- Rich text editor for descriptions
- Skill tags input with suggestions
- Company information section
- Preview functionality
- Save as draft option
- Duplicate job functionality

### 👨‍💼 **11. Admin Dashboard**
**Purpose**: System administration and monitoring
**Features**:
- System overview with key metrics
- Real-time statistics (users, jobs, applications)
- Quick actions for common admin tasks
- Recent activity monitoring
- System health indicators

### 🔧 **12. User Management Page (Admin)**
**Purpose**: Manage all system users
**Features**:
- User search and filtering
- User details and profile management
- Account activation/deactivation
- Role management
- User activity tracking
- Bulk actions for user management

### 📋 **13. Job Moderation Page (Admin)**
**Purpose**: Review and moderate job posts
**Features**:
- Job approval/rejection system
- Content moderation tools
- Flagged content review
- Job post editing capabilities
- Approval workflow management

### 📊 **14. Analytics Dashboard (Admin)**
**Purpose**: System analytics and reporting
**Features**:
- User engagement metrics
- Job posting statistics
- Application success rates
- System performance metrics
- Export functionality for reports
- Date range filtering

## 🔌 Complete API Endpoints Documentation

### 🌐 **PUBLIC ENDPOINTS (No Authentication Required)**

#### **Job Browsing Endpoints**

**GET /api/public/job-offers**
- **Purpose**: Get all active job offers
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalPages: number, currentPage: number, totalElements: number }`

**GET /api/public/job-offers/search**
- **Purpose**: Search jobs by keyword
- **Parameters**:
  - `keyword` (required)
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalPages: number, totalElements: number }`

**GET /api/public/job-offers/search/filters**
- **Purpose**: Advanced job search with multiple filters
- **Parameters**:
  - `titre` (optional) - Job title search
  - `localisation` (optional) - Location filter
  - `secteurActivite` (optional) - Industry sector
  - `typePoste` (optional) - Job type (TECHNIQUE, COMMERCIAL, MANAGEMENT)
  - `modaliteTravail` (optional) - Work mode (REMOTE, HYBRIDE, PRESENTIEL)
  - `experienceMin` (optional) - Minimum experience in years
  - `salaireMin` (optional) - Minimum salary
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], filters: {}, totalElements: number }`

**GET /api/public/job-offers/{id}**
- **Purpose**: Get specific job offer details
- **Parameters**: `id` (path parameter)
- **Response**: `{ job: {}, company: {}, requirements: {} }`

**GET /api/public/job-offers/recent**
- **Purpose**: Get recent job offers (last 30 days)
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalElements: number }`

**GET /api/public/job-offers/enums**
- **Purpose**: Get all enum values for filters
- **Parameters**: None
- **Response**: 
```json
{
  "typePoste": ["TECHNIQUE", "COMMERCIAL", "MANAGEMENT"],
  "modaliteTravail": ["REMOTE", "HYBRIDE", "PRESENTIEL"],
  "niveauSeniorite": ["JUNIOR", "CONFIRME", "SENIOR", "EXPERT"],
  "niveauEtude": ["BAC", "BAC_PLUS_2", "BAC_PLUS_3", "BAC_PLUS_5", "DOCTORAT"]
}
```

#### **Authentication Endpoints**

**POST /auth/register**
- **Purpose**: Register new user
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Last Name",
  "prenom": "First Name",
  "cin": "12345678",
  "role": "CANDIDATE"
}
```
- **Response**: `{ message: "User registered successfully", user: {} }`

**POST /auth/login**
- **Purpose**: User login
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: `{ token: "jwt-token", user: {}, expiresIn: 3600 }`

**POST /auth/refresh**
- **Purpose**: Refresh JWT token
- **Body**: `{ refreshToken: "refresh-token" }`
- **Response**: `{ token: "new-jwt-token", expiresIn: 3600 }`

### 🔐 **AUTHENTICATED ENDPOINTS (JWT Token Required)**

#### **Candidate Endpoints**

**POST /api/candidate/cv/upload**
- **Purpose**: Upload CV file
- **Headers**: `Authorization: Bearer {token}`
- **Body**: FormData with PDF file
- **Response**: `{ message: "CV uploaded successfully", cvId: number }`

**GET /api/candidate/cv/my-cv**
- **Purpose**: Get candidate's CV data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
{
  "cv": {
    "id": 1,
    "nomFichier": "cv.pdf",
    "competencesTechniques": "Java, Spring Boot, React",
    "competencesTransversales": "Leadership, Communication",
    "experienceAnnees": 5,
    "formations": "Master Computer Science",
    "langues": "French, English, Arabic"
  }
}
```

**GET /api/candidate/cv/status**
- **Purpose**: Check if candidate has uploaded CV
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ hasCv: true }`

**DELETE /api/candidate/cv/delete**
- **Purpose**: Delete candidate's CV
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "CV deleted successfully" }`

**POST /api/candidate/job-offers/{id}/apply**
- **Purpose**: Apply for a job
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Body**: 
```json
{
  "lettreMotivation": "Dear hiring manager, I am very interested..."
}
```
- **Response**: `{ message: "Application submitted", applicationId: number }`

**GET /api/candidate/applications**
- **Purpose**: Get candidate's applications
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: 
```json
{
  "applications": [
    {
      "id": 1,
      "jobOffreId": 1,
      "jobOffreTitre": "Developer",
      "statut": "EN_ATTENTE",
      "dateCandidature": "2025-07-17T10:00:00",
      "scoreGlobal": 0.75,
      "scoreCompetencesTechniques": 0.80,
      "scoreCompetencesTransversales": 0.70,
      "scoreExperience": 0.65,
      "scoreFormation": 0.85
    }
  ],
  "totalElements": 5
}
```

**DELETE /api/candidate/applications/{id}**
- **Purpose**: Withdraw application
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Response**: `{ message: "Application withdrawn" }`

#### **Employer Endpoints**

**POST /api/employer/job-offers**
- **Purpose**: Create new job offer
- **Headers**: `Authorization: Bearer {token}`
- **Body**: 
```json
{
  "titre": "Senior Developer",
  "description": "We are looking for...",
  "localisation": "Tunis, Tunisia",
  "entreprise": "TechCorp",
  "typeContrat": "CDI",
  "salaire": 2500.0,
  "experience": 5,
  "competencesTechniques": "Java, Spring Boot, React",
  "competencesTransversales": "Leadership, Communication",
  "experienceMinRequise": 3,
  "experienceMaxSouhaitee": 8,
  "niveauEtudeMin": "BAC_PLUS_5",
  "languesRequises": "French, English",
  "secteurActivite": "Technology",
  "missionPrincipale": "Develop web applications",
  "responsabilites": "Code review, mentoring, architecture",
  "outilsTechnologies": "IntelliJ, Git, Docker",
  "typePoste": "TECHNIQUE",
  "modaliteTravail": "HYBRIDE",
  "niveauSeniorite": "SENIOR",
  "dateExpiration": "2025-12-31T23:59:59"
}
```
- **Response**: `{ message: "Job created successfully", jobId: number }`

**GET /api/employer/job-offers/my-offers**
- **Purpose**: Get employer's job offers
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalElements: number }`

**PUT /api/employer/job-offers/{id}**
- **Purpose**: Update job offer
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Body**: Same as create job offer
- **Response**: `{ message: "Job updated successfully" }`

**DELETE /api/employer/job-offers/{id}**
- **Purpose**: Delete job offer
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Response**: `{ message: "Job deleted successfully" }`

**GET /api/employer/applications**
- **Purpose**: Get all applications for employer's jobs
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ applications: [], totalElements: number }`

**GET /api/employer/job-offers/{jobOfferId}/applications**
- **Purpose**: Get applications for specific job
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `jobOfferId` (path parameter)
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ applications: [], totalElements: number }`

**PUT /api/employer/applications/{id}/status**
- **Purpose**: Update application status
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Body**: 
```json
{
  "statut": "ACCEPTEE",
  "commentaireEmployeur": "Great candidate!",
  "commentairePublic": "We'll contact you soon"
}
```
- **Response**: `{ message: "Status updated successfully" }`

**GET /api/employer/applications/{id}/cv**
- **Purpose**: Download candidate's CV
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Response**: PDF file download

#### **Common User Endpoints**

**GET /api/user/profile**
- **Purpose**: Get current user profile
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ user: {}, profile: {} }`

**PUT /api/user/profile**
- **Purpose**: Update user profile
- **Headers**: `Authorization: Bearer {token}`
- **Body**: 
```json
{
  "nom": "New Last Name",
  "prenom": "New First Name",
  "email": "new@email.com"
}
```
- **Response**: `{ message: "Profile updated successfully" }`

**GET /api/candidate/dashboard**
- **Purpose**: Get candidate dashboard data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "Dashboard data", stats: {} }`

**GET /api/employer/dashboard**
- **Purpose**: Get employer dashboard data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "Dashboard data", stats: {} }`

#### **Admin Endpoints**

**GET /api/admin/users**
- **Purpose**: Get all system users
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
  - `role` (optional) - Filter by role (CANDIDATE, EMPLOYER, ADMIN)
  - `active` (optional) - Filter by active status
- **Response**: `{ users: [], totalElements: number }`

**PUT /api/admin/users/{id}/status**
- **Purpose**: Activate/deactivate user account
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: `id` (user ID)
- **Body**: 
```json
{
  "active": true
}
```
- **Response**: `{ message: "User status updated successfully" }`

**GET /api/admin/job-offers**
- **Purpose**: Get all job offers for moderation
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
  - `status` (optional) - Filter by status (PENDING, APPROVED, REJECTED)
- **Response**: `{ jobs: [], totalElements: number }`

**PUT /api/admin/job-offers/{id}/approve**
- **Purpose**: Approve job offer
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: `id` (job offer ID)
- **Body**: 
```json
{
  "approved": true,
  "comments": "Job approved"
}
```
- **Response**: `{ message: "Job offer approved successfully" }`

**PUT /api/admin/job-offers/{id}/reject**
- **Purpose**: Reject job offer
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: `id` (job offer ID)
- **Body**: 
```json
{
  "reason": "Inappropriate content"
}
```
- **Response**: `{ message: "Job offer rejected successfully" }`

**GET /api/admin/applications**
- **Purpose**: Get all applications for monitoring
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
  - `status` (optional) - Filter by status
- **Response**: `{ applications: [], totalElements: number }`

**GET /api/admin/dashboard**
- **Purpose**: Get admin dashboard statistics
- **Headers**: `Authorization: Bearer {admin-token}`
- **Response**: 
```json
{
  "totalUsers": 1500,
  "totalJobs": 250,
  "totalApplications": 3500,
  "activeUsers": 1200,
  "pendingJobs": 15,
  "recentActivity": []
}
```

**GET /api/admin/analytics**
- **Purpose**: Get system analytics
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: 
  - `startDate` (optional) - Start date for analytics
  - `endDate` (optional) - End date for analytics
- **Response**: 
```json
{
  "userRegistrations": [],
  "jobPostings": [],
  "applicationRates": [],
  "successRates": []
}
```

**DELETE /api/admin/users/{id}**
- **Purpose**: Delete user account (soft delete)
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: `id` (user ID)
- **Response**: `{ message: "User deleted successfully" }`

**DELETE /api/admin/job-offers/{id}**
- **Purpose**: Delete job offer
- **Headers**: `Authorization: Bearer {admin-token}`
- **Parameters**: `id` (job offer ID)
- **Response**: `{ message: "Job offer deleted successfully" }`

## 🎨 Design Requirements

### 🎯 **Design System**
- **Framework**: React/Next.js with TypeScript
- **Styling**: Tailwind CSS for all components
- **HTTP Client**: Axios for API calls
- **State Management**: Redux Toolkit for global state
- **Authentication**: JWT tokens with localStorage
- **Icons**: Heroicons or similar
- **Responsive**: Mobile-first design
- **Colors**: Modern blue/green palette with proper contrast
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Toast notifications and error boundaries

### 📱 **Responsive Requirements**
- **Mobile**: 320px - 640px (primary focus)
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above
- **Touch-friendly**: Buttons min 44px height
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 **Technical Stack Summary**

### 🔧 **Required Technologies**
- **Frontend**: React/Next.js
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Redux Toolkit
- **Authentication**: JWT tokens (with role-based access)
- **File Upload**: FormData for CV upload
- **Routing**: Next.js App Router
- **Forms**: React Hook Form
- **Notifications**: Toast notifications
- **Loading**: Skeleton loaders
- **Admin Tools**: Data tables, charts, analytics dashboards

### 📡 **API Integration**
- **Base URL**: http://localhost:8080
- **Authentication**: Bearer token in headers
- **Error Handling**: Proper HTTP status code handling
- **Loading States**: Show loading during API calls
- **Retry Logic**: Implement retry for failed requests
- **Caching**: Cache frequently accessed data

## 🎯 **Implementation Priority**

### 📋 **Phase 1: Core Features**
1. Homepage with job browsing
2. Job search and filtering
3. Job details page
4. User registration and login
5. CV upload system

### 📋 **Phase 2: Application System**
1. Job application process
2. Candidate dashboard
3. Employer dashboard
4. Application management

### 📋 **Phase 3: Admin System**
1. Admin authentication and dashboard
2. User management system
3. Job moderation tools
4. Analytics and reporting

### 📋 **Phase 4: Advanced Features**
1. Real-time notifications
2. Advanced matching display
3. Communication system
4. System monitoring tools

## ✅ **Key Success Metrics**

### 🎯 **User Experience**
- Fast loading times (< 2s)
- Intuitive navigation
- Clear call-to-actions
- Responsive on all devices
- Accessibility compliant

### 🔧 **Technical Performance**
- API response times < 500ms
- Error handling coverage
- Proper loading states
- Secure authentication
- SEO optimized

### 📊 **Business Goals**
- Easy job discovery for visitors
- Smooth registration process
- Efficient application system
- Effective candidate-employer matching
- Professional employer experience

---

**This specification provides all scenarios, API endpoints, and requirements needed to build the JobVector frontend with v0, Tailwind CSS, Axios, and Redux.**

## 📱 Required Pages & Components

### 🏠 **1. Homepage (Public)**
**Purpose**: Landing page for visitors
**Features**:
- Hero section with search bar
- Featured jobs grid (6 jobs)
- Job categories filter
- Search section with quick filters
- Company logos and testimonials
- Statistics section (total jobs, companies, successful matches)

### 🔍 **2. Job Listings Page (Public)**
**Purpose**: Browse and filter all job offers
**Features**:
- Advanced search filters sidebar
- Job cards grid with pagination
- Sort options (date, salary, relevance, match score for authenticated)
- Filter chips showing active filters
- Loading states and empty states
- Infinite scroll or pagination

### 📋 **3. Job Details Page (Public + Authenticated)**
**Purpose**: Detailed job information
**Features**:
- Job header (title, company, location, salary)
- Job overview (contract type, experience, work mode)
- Full job description with rich text
- Requirements section (technical + soft skills)
- Company information and culture
- **For Visitors**: Apply button redirects to registration
- **For Authenticated**: Matching score display + apply functionality

### 📝 **4. Registration Page**
**Purpose**: User account creation
**Features**:
- Multi-step form with progress indicator
- Personal information (nom, prénom, email, cin)
- Account details (password with strength meter)
- Role selection (Candidate/Employer)
- Terms and conditions acceptance
- Email verification step

### 🔐 **5. Login Page**
**Purpose**: User authentication
**Features**:
- Email/password login form
- Remember me checkbox
- Password reset functionality
- Social login options (optional)
- Registration redirect link

### 📄 **6. CV Upload Page (Candidates Only)**
**Purpose**: CV upload and processing
**Features**:
- Drag & drop file upload zone
- File validation (PDF only, max 10MB)
- Upload progress indicator
- AI processing status display
- Extracted data preview and verification
- Edit extracted information option

### 🎯 **7. Candidate Dashboard**
**Purpose**: Main candidate interface
**Features**:
- Welcome header with profile completion
- Quick stats (applications, pending, accepted)
- Recommended jobs based on CV
- Recent applications with status
- Profile management shortcuts
- CV status and re-upload option

### 🏢 **8. Employer Dashboard**
**Purpose**: Main employer interface
**Features**:
- Company overview and stats
- Active job postings management
- Applications received overview
- Quick actions (create job, view analytics)
- Recent activity feed
- Company profile management

### 📊 **9. Applications Management**
**Purpose**: Manage job applications (both roles)
**Features**:
- **For Candidates**: View submitted applications, status tracking, withdraw option
- **For Employers**: Review applications, update status, download CVs, communicate
- Filtering and sorting options
- Bulk actions for employers
- Application details modal

### 💼 **10. Job Creation/Edit Page (Employers)**
**Purpose**: Create and manage job posts
**Features**:
- Comprehensive job posting form
- Rich text editor for descriptions
- Skill tags input with suggestions
- Company information section
- Preview functionality
- Save as draft option
- Duplicate job functionality
3. **Matching Score Display** → Overall score + technical/soft skills/experience/education scores
4. **Apply Button** → If no CV: "Upload CV first", If CV exists: "Apply Now"
5. **Application Form** → Motivation letter (optional)
6. **Submit Application** → Confirmation message
7. **Application Tracking** → View in dashboard with status updates

**Key Requirements:**
- Matching scores visible only to authenticated users
- CV requirement check before applying
- Application status tracking
- Email notifications for status changes

### 🏢 **Scenario 4: Employer Journey**

**User Flow:**
1. **Employer Registration** → Same form, select "Employer" role
2. **Company Setup** → Company details, logo, description
3. **Job Creation** → Comprehensive job posting form
4. **Application Management** → View received applications
5. **Candidate Review** → Review applications, download CVs, see matching scores
6. **Status Management** → Update application status (pending, accepted, rejected)
7. **Communication** → Send messages to candidates

**Key Requirements:**
- Rich job posting form with all required fields
- Application management dashboard
- CV download functionality
- Candidate communication tools

## � Required Pages & Components

### 🏠 **1. Homepage (Public)**
**Purpose**: Landing page for visitors
**Components Needed**:
- Hero section with search bar
- Featured jobs grid (6 jobs)
- Job categories filter
- Search section
- Statistics section
- Footer

### 🔍 **2. Job Listings Page (Public)**
**Purpose**: Browse and filter all job offers
**Components Needed**:
- Advanced search filters sidebar
- Job cards grid with pagination
- Sort options (date, salary, relevance)
- Filter chips (active filters display)
- Loading states and empty states

### 📋 **3. Job Details Page (Public + Authenticated)**
**Purpose**: Detailed job information
**Components Needed**:
- Job header (title, company, location)
- Job overview (salary, contract type, experience)
- Full job description
- Requirements section (technical + soft skills)
- Company information
- Application section (auth required)
- **For Authenticated Users**: Matching score display

### 📝 **4. Registration Page**
**Purpose**: User account creation
**Components Needed**:
- Step indicator (multi-step form)
- Personal information form
- Account details form
- Role selection (Candidate/Employer)
- Form validation and error handling

### � **5. Login Page**
**Purpose**: User authentication
**Components Needed**:
- Login form (email/password)
- Password reset link
- Registration link
- Social login options (optional)

### 📄 **6. CV Upload Page (Candidates Only)**
**Purpose**: CV upload and processing
**Components Needed**:
- File upload zone (drag & drop)
- Upload progress indicator
- Processing status display
- Extracted data preview
- Data verification form

### 🎯 **7. Candidate Dashboard**
**Purpose**: Candidate main interface
**Components Needed**:
- Welcome header with user info
- Quick stats cards (applications, pending, accepted)
- Recommended jobs section
- Recent applications list
- Profile completion indicator

### 🏢 **8. Employer Dashboard**
**Purpose**: Employer main interface
**Components Needed**:
- Dashboard header with company info
- Job management section
- Applications overview
- Quick actions (create job, view analytics)
- Recent activity feed

### 📊 **9. Applications Management (Both Roles)**
**Purpose**: Manage job applications
**Components Needed**:
- Applications table with filters
- Status update controls
- Application details modal
- CV download functionality
- Communication tools

### 💼 **10. Job Creation/Edit (Employers)**
**Purpose**: Create and manage job posts
**Components Needed**:
- Comprehensive job form
- Rich text editor for descriptions
- Skill tags input
- Preview functionality
- Save as draft option

## 🔌 Complete API Endpoints Documentation

### 🌐 **PUBLIC ENDPOINTS (No Authentication Required)**

#### **Job Browsing Endpoints**

**GET /api/public/job-offers**
- **Purpose**: Get all active job offers
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalPages: number, currentPage: number, totalElements: number }`

**GET /api/public/job-offers/search**
- **Purpose**: Search jobs by keyword
- **Parameters**:
  - `keyword` (required)
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalPages: number, totalElements: number }`

**GET /api/public/job-offers/search/filters**
- **Purpose**: Advanced job search with multiple filters
- **Parameters**:
  - `titre` (optional) - Job title search
  - `localisation` (optional) - Location filter
  - `secteurActivite` (optional) - Industry sector
  - `typePoste` (optional) - Job type (TECHNIQUE, COMMERCIAL, MANAGEMENT)
  - `modaliteTravail` (optional) - Work mode (REMOTE, HYBRIDE, PRESENTIEL)
  - `experienceMin` (optional) - Minimum experience in years
  - `salaireMin` (optional) - Minimum salary
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], filters: {}, totalElements: number }`

**GET /api/public/job-offers/{id}**
- **Purpose**: Get specific job offer details
- **Parameters**: `id` (path parameter)
- **Response**: `{ job: {}, company: {}, requirements: {} }`

**GET /api/public/job-offers/recent**
- **Purpose**: Get recent job offers (last 30 days)
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalElements: number }`

**GET /api/public/job-offers/enums**
- **Purpose**: Get all enum values for filters
- **Parameters**: None
- **Response**: 
```json
{
  "typePoste": ["TECHNIQUE", "COMMERCIAL", "MANAGEMENT"],
  "modaliteTravail": ["REMOTE", "HYBRIDE", "PRESENTIEL"],
  "niveauSeniorite": ["JUNIOR", "CONFIRME", "SENIOR", "EXPERT"],
  "niveauEtude": ["BAC", "BAC_PLUS_2", "BAC_PLUS_3", "BAC_PLUS_5", "DOCTORAT"]
}
```

#### **Authentication Endpoints**

**POST /auth/register**
- **Purpose**: Register new user
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Last Name",
  "prenom": "First Name",
  "cin": "12345678",
  "role": "CANDIDATE" // or "EMPLOYER"
}
```
- **Response**: `{ message: "User registered successfully", user: {} }`

**POST /auth/login**
- **Purpose**: User login
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: `{ token: "jwt-token", user: {}, expiresIn: 3600 }`

**POST /auth/refresh**
- **Purpose**: Refresh JWT token
- **Body**: `{ refreshToken: "refresh-token" }`
- **Response**: `{ token: "new-jwt-token", expiresIn: 3600 }`

### 🔐 **AUTHENTICATED ENDPOINTS (JWT Token Required)**

#### **Candidate Endpoints**

**POST /api/candidate/cv/upload**
- **Purpose**: Upload CV file
- **Headers**: `Authorization: Bearer {token}`
- **Body**: FormData with PDF file
- **Response**: `{ message: "CV uploaded successfully", cvId: number }`

**GET /api/candidate/cv/my-cv**
- **Purpose**: Get candidate's CV data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
{
  "cv": {
    "id": 1,
    "nomFichier": "cv.pdf",
    "competencesTechniques": "Java, Spring Boot, React",
    "competencesTransversales": "Leadership, Communication",
    "experienceAnnees": 5,
    "formations": "Master Computer Science",
    "langues": "French, English, Arabic"
  }
}
```

**GET /api/candidate/cv/status**
- **Purpose**: Check if candidate has uploaded CV
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ hasCv: true }`

**DELETE /api/candidate/cv/delete**
- **Purpose**: Delete candidate's CV
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "CV deleted successfully" }`

**POST /api/candidate/job-offers/{id}/apply**
- **Purpose**: Apply for a job
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Body**: 
```json
{
  "lettreMotivation": "Dear hiring manager, I am very interested..."
}
```
- **Response**: `{ message: "Application submitted", applicationId: number }`

**GET /api/candidate/applications**
- **Purpose**: Get candidate's applications
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: 
```json
{
  "applications": [
    {
      "id": 1,
      "jobOffreId": 1,
      "jobOffreTitre": "Developer",
      "statut": "EN_ATTENTE",
      "dateCandidature": "2025-07-17T10:00:00",
      "scoreGlobal": 0.75,
      "scoreCompetencesTechniques": 0.80,
      "scoreCompetencesTransversales": 0.70,
      "scoreExperience": 0.65,
      "scoreFormation": 0.85
    }
  ],
  "totalElements": 5
}
```

**DELETE /api/candidate/applications/{id}**
- **Purpose**: Withdraw application
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Response**: `{ message: "Application withdrawn" }`

#### **Employer Endpoints**

**POST /api/employer/job-offers**
- **Purpose**: Create new job offer
- **Headers**: `Authorization: Bearer {token}`
- **Body**: 
```json
{
  "titre": "Senior Developer",
  "description": "We are looking for...",
  "localisation": "Tunis, Tunisia",
  "entreprise": "TechCorp",
  "typeContrat": "CDI",
  "salaire": 2500.0,
  "experience": 5,
  "competencesTechniques": "Java, Spring Boot, React",
  "competencesTransversales": "Leadership, Communication",
  "experienceMinRequise": 3,
  "experienceMaxSouhaitee": 8,
  "niveauEtudeMin": "BAC_PLUS_5",
  "languesRequises": "French, English",
  "secteurActivite": "Technology",
  "missionPrincipale": "Develop web applications",
  "responsabilites": "Code review, mentoring, architecture",
  "outilsTechnologies": "IntelliJ, Git, Docker",
  "typePoste": "TECHNIQUE",
  "modaliteTravail": "HYBRIDE",
  "niveauSeniorite": "SENIOR",
  "dateExpiration": "2025-12-31T23:59:59"
}
```
- **Response**: `{ message: "Job created successfully", jobId: number }`

**GET /api/employer/job-offers/my-offers**
- **Purpose**: Get employer's job offers
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ jobs: [], totalElements: number }`

**PUT /api/employer/job-offers/{id}**
- **Purpose**: Update job offer
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Body**: Same as create job offer
- **Response**: `{ message: "Job updated successfully" }`

**DELETE /api/employer/job-offers/{id}**
- **Purpose**: Delete job offer
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (job offer ID)
- **Response**: `{ message: "Job deleted successfully" }`

**GET /api/employer/applications**
- **Purpose**: Get all applications for employer's jobs
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ applications: [], totalElements: number }`

**GET /api/employer/job-offers/{jobOfferId}/applications**
- **Purpose**: Get applications for specific job
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: 
  - `jobOfferId` (path parameter)
  - `page` (optional, default=0)
  - `size` (optional, default=10)
- **Response**: `{ applications: [], totalElements: number }`

**PUT /api/employer/applications/{id}/status**
- **Purpose**: Update application status
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Body**: 
```json
{
  "statut": "ACCEPTEE", // or "REFUSEE", "EN_ATTENTE"
  "commentaireEmployeur": "Great candidate!",
  "commentairePublic": "We'll contact you soon"
}
```
- **Response**: `{ message: "Status updated successfully" }`

**GET /api/employer/applications/{id}/cv**
- **Purpose**: Download candidate's CV
- **Headers**: `Authorization: Bearer {token}`
- **Parameters**: `id` (application ID)
- **Response**: PDF file download

#### **Common User Endpoints**

**GET /api/user/profile**
- **Purpose**: Get current user profile
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ user: {}, profile: {} }`

**PUT /api/user/profile**
- **Purpose**: Update user profile
- **Headers**: `Authorization: Bearer {token}`
- **Body**: 
```json
{
  "nom": "New Last Name",
  "prenom": "New First Name",
  "email": "new@email.com"
}
```
- **Response**: `{ message: "Profile updated successfully" }`

**GET /api/candidate/dashboard**
- **Purpose**: Get candidate dashboard data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "Dashboard data", stats: {} }`

**GET /api/employer/dashboard**
- **Purpose**: Get employer dashboard data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message: "Dashboard data", stats: {} }`

---

## 🎨 Design System & UI/UX

### 🎯 **Design Principles**
- **Modern & Clean**: Minimalist design with focus on usability
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant components
- **Fast Loading**: Optimized performance and lazy loading
- **Visual Hierarchy**: Clear information architecture


---

## 🎯 **Key Features Summary**

### ✨ **For Visitors**
- Browse all job offers without registration
- Advanced search and filtering
- Job details and company information
- Clear call-to-action for registration

### 👤 **For Candidates**
- Complete profile creation with CV upload
- AI-powered job matching with scores
- Application tracking and management
- Personalized job recommendations
- Real-time application status updates

### 🏢 **For Employers**
- Job posting with comprehensive details
- Application management system
- CV downloads and candidate review
- Matching score analytics
- Communication tools

### �‍💼 **For Administrators**
- Complete user management system
- Job post moderation and approval
- System analytics and reporting
- Content moderation tools
- User account activation/deactivation
- System monitoring and health checks

### �🔧 **Technical Excellence**
- JWT authentication and security
- Responsive design for all devices
- Real-time updates and notifications
- File upload with progress tracking
- Search optimization and caching
- API error handling and validation

---

## 🚀 **Getting Started with v0**

### 📋 **Implementation Steps**

1. **Project Setup**
   ```bash
   # Create new Next.js project
   npx create-next-app@latest jobvector-frontend
   cd jobvector-frontend
   
   # Install dependencies
   npm install axios react-hook-form react-query
   npm install @headlessui/react @heroicons/react
   npm install tailwindcss @tailwindcss/forms
   ```

2. **Environment Configuration**
   ```javascript
   // .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_APP_NAME=JobVector
   ```

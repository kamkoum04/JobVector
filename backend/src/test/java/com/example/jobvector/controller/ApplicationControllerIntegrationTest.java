package com.example.jobvector.controller;

import com.example.jobvector.Controller.ApplicationController;
import com.example.jobvector.Dto.ApplicationDto;
import com.example.jobvector.Dto.CvDto;
import com.example.jobvector.Dto.JobOffreDto;
import com.example.jobvector.Dto.UserDto;
import com.example.jobvector.Model.Application;
import com.example.jobvector.Model.Cv;
import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.ApplicationRepository;
import com.example.jobvector.Repository.CvRepository;
import com.example.jobvector.Repository.JobOfferRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.OllamaAiCvExtractionService;
import com.example.jobvector.Service.PythonEmbeddingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApplicationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private CvRepository cvRepository;

    @MockBean
    private OllamaAiCvExtractionService ollamaAiCvExtractionService;

    @MockBean
    private PythonEmbeddingService pythonEmbeddingService;

    private String candidateToken;
    private String employerToken;
    private Long jobOfferId;

    @BeforeEach
    void setUp() throws Exception {
        // Mock external services to avoid dependency on Ollama and Python embedding service
        CvDto mockCvDto = new CvDto();
        mockCvDto.setNom("Test");
        mockCvDto.setPrenom("User");
        mockCvDto.setEmail("candidate@test.com");
        when(ollamaAiCvExtractionService.extractCvInformation(anyString())).thenReturn(mockCvDto);
        when(pythonEmbeddingService.generateCvEmbedding(any(Cv.class))).thenReturn("mock-embedding-vector");

        applicationRepository.deleteAll();
        jobOfferRepository.deleteAll();
        utilisateurRepository.deleteAll();

        candidateToken = createUserAndGetToken("candidate@test.com", "password123", "CANDIDATE");
        employerToken = createUserAndGetToken("employer@test.com", "password123", "EMPLOYER");

        jobOfferId = createJobOfferAsEmployer();
        uploadCvForCandidate();
    }

    private String createUserAndGetToken(String email, String password, String role) throws Exception {
        UserDto registerDto = new UserDto();
        registerDto.setEmail(email);
        registerDto.setPassword(password);
        registerDto.setNom("Test");
        registerDto.setPrenom("User");
        registerDto.setCin("12345678");
        registerDto.setRole(role);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isOk());

        UserDto loginDto = new UserDto();
        loginDto.setEmail(email);
        loginDto.setPassword(password);

        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(responseContent);
        return jsonNode.get("token").asText();
    }

    private Long createJobOfferAsEmployer() throws Exception {
        JobOffreDto jobDto = new JobOffreDto();
        jobDto.setTitre("Développeur Java Senior");
        jobDto.setDescription("Poste de développeur Java avec 5 ans d'expérience");
        jobDto.setLocalisation("Tunis, Tunisie");
        jobDto.setCompetencesTechniques("Java, Spring Boot, PostgreSQL");
        jobDto.setCompetencesTransversales("Leadership, Communication");
        jobDto.setOutilsTechnologies("IntelliJ IDEA, Git, Docker");
        jobDto.setExperienceMinRequise(3);
        jobDto.setNiveauEtudeMin(JobOffre.NiveauEtude.BAC_PLUS_5);
        jobDto.setLanguesRequises("Français, Anglais");
        jobDto.setSecteurActivite("IT");
        jobDto.setMissionPrincipale("Développement d'applications web");
        jobDto.setResponsabilites("Développement, Tests, Code Review");
        jobDto.setTypePoste(JobOffre.TypePoste.TECHNIQUE);
        jobDto.setModaliteTravail(JobOffre.ModaliteTravail.HYBRIDE);
        jobDto.setEntreprise("TechCorp");
        jobDto.setTypeContrat("CDI");
        jobDto.setSalaire(3000.0);
        jobDto.setExperience(5);

        MvcResult result = mockMvc.perform(post("/api/employer/job-offers")
                        .header("Authorization", "Bearer " + employerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(responseContent);
        return jsonNode.get("id").asLong();
    }

    private void uploadCvForCandidate() throws Exception {
        // For tests, directly create CV in database instead of async upload
        // This avoids timing issues with async processing in tests
        Utilisateur candidate = utilisateurRepository.findByEmail("candidate@test.com")
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        Cv cv = new Cv();
        cv.setUtilisateur(candidate);
        cv.setNom("Test");
        cv.setPrenom("User");
        cv.setEmail("candidate@test.com");
        cv.setTelephone("0123456789");
        cv.setAdresse("Test Address");
        cv.setTexteExtrait("Test CV content");
        cv.setFichierPath("test/cv.pdf");
        cv.setEmbedding("mock-embedding-vector");
        
        cvRepository.save(cv);
    }

    @Test
    @DisplayName("Should apply to job offer successfully")
    void testApplyToJobOffer_Success() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("Je suis très motivé pour ce poste!");

        mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value(201));
    }

    @Test
    @DisplayName("Should fail to apply without authentication")
    void testApplyToJobOffer_Unauthorized() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("Test");

        mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should get candidate's own applications")
    void testGetMyCandidatures_Success() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("My application");

        mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/candidate/applications")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    @DisplayName("Should withdraw application successfully")
    void testWithdrawApplication_Success() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("Application to withdraw");

        MvcResult applyResult = mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String applyResponse = applyResult.getResponse().getContentAsString();
        JsonNode applyJson = objectMapper.readTree(applyResponse);
        Long applicationId = applyJson.get("id").asLong();

        mockMvc.perform(delete("/api/candidate/applications/" + applicationId)
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    @DisplayName("Should get all received applications as employer")
    void testGetAllReceivedApplications_Success() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("Test application");

        mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/employer/applications")
                        .header("Authorization", "Bearer " + employerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    @DisplayName("Should update application status as employer")
    void testUpdateApplicationStatus_Success() throws Exception {
        ApplicationDto applicationDto = new ApplicationDto();
        applicationDto.setLettreMotivation("Application to update");

        MvcResult applyResult = mockMvc.perform(post("/api/candidate/job-offers/" + jobOfferId + "/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(applicationDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String applyResponse = applyResult.getResponse().getContentAsString();
        JsonNode applyJson = objectMapper.readTree(applyResponse);
        Long applicationId = applyJson.get("id").asLong();

        ApplicationController.ApplicationStatusUpdateRequest statusUpdate = 
            new ApplicationController.ApplicationStatusUpdateRequest();
        statusUpdate.setStatut(Application.StatutCandidature.PRESELECTIONNE);
        statusUpdate.setCommentaireEmployeur("Bon profil");

        mockMvc.perform(put("/api/employer/applications/" + applicationId + "/status")
                        .header("Authorization", "Bearer " + employerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));
    }
}

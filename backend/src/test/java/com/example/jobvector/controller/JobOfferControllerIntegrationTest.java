package com.example.jobvector.controller;

import com.example.jobvector.Dto.JobOffreDto;
import com.example.jobvector.Dto.UserDto;
import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Repository.JobOfferRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.UserManagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class JobOfferControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private String employerToken;
    private String adminToken;
    private String candidateToken;

    private JobOffreDto validJobOfferDto;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up database
        jobOfferRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // Create test users and get tokens
        employerToken = createUserAndGetToken("employer@test.com", "password123", "EMPLOYER");
        adminToken = createUserAndGetToken("admin@test.com", "password123", "ADMIN");
        candidateToken = createUserAndGetToken("candidate@test.com", "password123", "CANDIDATE");

        // Create valid job offer DTO
        validJobOfferDto = createValidJobOfferDto();
    }

    private String createUserAndGetToken(String email, String password, String role) throws Exception {
        // Register user
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

        // Login and get token
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
        JsonNode tokenNode = jsonNode.get("token");
        if (tokenNode == null) {
            throw new RuntimeException("No token found in response: " + responseContent);
        }
        return tokenNode.asText();
    }

    private JobOffreDto createValidJobOfferDto() {
        JobOffreDto dto = new JobOffreDto();
        dto.setTitre("Développeur Java Senior");
        dto.setDescription("Poste de développeur Java avec 5 ans d'expérience");
        dto.setLocalisation("Tunis, Tunisie");
        dto.setCompetencesTechniques("Java, Spring Boot, PostgreSQL");
        dto.setCompetencesTransversales("Leadership, Communication");
        dto.setOutilsTechnologies("IntelliJ IDEA, Git, Docker");
        dto.setExperienceMinRequise(3);
        dto.setNiveauEtudeMin(JobOffre.NiveauEtude.BAC_PLUS_5);
        dto.setLanguesRequises("Français, Anglais");
        dto.setSecteurActivite("IT");
        dto.setMissionPrincipale("Développement d'applications web");
        dto.setResponsabilites("Développement, Tests, Code Review");
        dto.setTypePoste(JobOffre.TypePoste.TECHNIQUE);
        dto.setModaliteTravail(JobOffre.ModaliteTravail.HYBRIDE);
        dto.setEntreprise("TechCorp");
        dto.setTypeContrat("CDI");
        dto.setSalaire(3000.0);
        dto.setExperience(5);
        return dto;
    }

    // ========== EMPLOYER ENDPOINTS TESTS ==========

    @Test
    @DisplayName("Should create job offer as employer")
    void testCreateJobOffer_Success() throws Exception {
        mockMvc.perform(post("/api/employer/job-offers")
                        .header("Authorization", "Bearer " + employerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validJobOfferDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value(201))
                .andExpect(jsonPath("$.titre").value(validJobOfferDto.getTitre()))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Should fail to create job offer without authentication")
    void testCreateJobOffer_Unauthorized() throws Exception {
        mockMvc.perform(post("/api/employer/job-offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validJobOfferDto)))
                .andExpect(status().isForbidden());
    }

    // ========== HELPER METHODS ==========

    private void createJobOfferAsEmployer() throws Exception {
        mockMvc.perform(post("/api/employer/job-offers")
                        .header("Authorization", "Bearer " + employerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validJobOfferDto)))
                .andExpect(status().isCreated());
    }
}

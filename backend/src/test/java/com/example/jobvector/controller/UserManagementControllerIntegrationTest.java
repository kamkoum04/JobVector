package com.example.jobvector.controller;

import com.example.jobvector.Dto.UserDto;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.UserManagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Transactional
public class UserManagementControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UserManagementService userManagementService;

    private UserDto candidateUserDto;
    private UserDto employerUserDto;
    private UserDto adminUserDto;

    @BeforeEach
    void setUp() {
        // Clean database
        utilisateurRepository.deleteAll();

        // Create valid user DTOs for testing
        candidateUserDto = createValidUserDto("CANDIDATE");
        employerUserDto = createValidUserDto("EMPLOYER");
        adminUserDto = createValidUserDto("ADMIN");
    }

    private UserDto createValidUserDto(String role) {
        UserDto userDto = new UserDto();
        userDto.setNom("Test");
        userDto.setPrenom("User");
        userDto.setEmail("test." + role.toLowerCase() + "@example.com");
        userDto.setPassword("Password123!");
        userDto.setRole(role);
        userDto.setCin("12345678");
        return userDto;
    }

    // ========== REGISTRATION TESTS ==========

    @Test
    @DisplayName("Should register candidate successfully")
    void testRegisterCandidate_Success() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candidateUserDto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.utilisateurs.email").value(candidateUserDto.getEmail()))
                .andExpect(jsonPath("$.utilisateurs.role").value("CANDIDATE"));

        // Verify user was saved in database
        assertTrue(utilisateurRepository.findByEmail(candidateUserDto.getEmail()).isPresent());
    }

    @Test
    @DisplayName("Should register employer successfully")
    void testRegisterEmployer_Success() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employerUserDto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.utilisateurs.email").value(employerUserDto.getEmail()))
                .andExpect(jsonPath("$.utilisateurs.role").value("EMPLOYER"));

        assertTrue(utilisateurRepository.findByEmail(employerUserDto.getEmail()).isPresent());
    }

    @Test
    @DisplayName("Should register admin successfully")
    void testRegisterAdmin_Success() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminUserDto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.utilisateurs.email").value(adminUserDto.getEmail()))
                .andExpect(jsonPath("$.utilisateurs.role").value("ADMIN"));

        assertTrue(utilisateurRepository.findByEmail(adminUserDto.getEmail()).isPresent());
    }

    @Test
    @DisplayName("Should fail registration with duplicate email")
    void testRegisterWithDuplicateEmail_Failure() throws Exception {
        // First registration
        userManagementService.register(candidateUserDto);

        // Attempt second registration with same email
        UserDto duplicateUser = createValidUserDto("EMPLOYER");
        duplicateUser.setEmail(candidateUserDto.getEmail());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should fail registration with empty required fields")
    void testRegisterWithEmptyFields_Failure() throws Exception {
        UserDto emptyUserDto = new UserDto();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyUserDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500)); // Service will throw exception
    }

    @Test
    @DisplayName("Should fail registration with invalid role")
    void testRegisterWithInvalidRole_Failure() throws Exception {
        candidateUserDto.setRole("INVALID_ROLE");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(candidateUserDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    // ========== LOGIN TESTS ==========

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginWithValidCredentials_Success() throws Exception {
        // Register user first
        userManagementService.register(candidateUserDto);

        UserDto loginRequest = new UserDto();
        loginRequest.setEmail(candidateUserDto.getEmail());
        loginRequest.setPassword(candidateUserDto.getPassword());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.utilisateurs.email").value(candidateUserDto.getEmail()))
                .andExpect(jsonPath("$.role").value("CANDIDATE"))
                .andExpect(jsonPath("$.expirationTime").exists());
    }

    @Test
    @DisplayName("Should fail login with invalid email")
    void testLoginWithInvalidEmail_Failure() throws Exception {
        UserDto loginRequest = new UserDto();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500)) // Authentication will fail
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should fail login with wrong password")
    void testLoginWithWrongPassword_Failure() throws Exception {
        // Register user first
        userManagementService.register(candidateUserDto);

        UserDto loginRequest = new UserDto();
        loginRequest.setEmail(candidateUserDto.getEmail());
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500)) // Authentication will fail
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should fail login with empty credentials")
    void testLoginWithEmptyCredentials_Failure() throws Exception {
        UserDto loginRequest = new UserDto();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500));
    }

    // ========== REFRESH TOKEN TESTS ==========

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefreshToken_Success() throws Exception {
        // Register and login user first
        userManagementService.register(candidateUserDto);
        
        UserDto loginRequest = new UserDto();
        loginRequest.setEmail(candidateUserDto.getEmail());
        loginRequest.setPassword(candidateUserDto.getPassword());
        
        UserDto loginResponse = userManagementService.login(loginRequest);
        
        UserDto refreshRequest = new UserDto();
        refreshRequest.setToken(loginResponse.getToken());

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    @DisplayName("Should fail refresh with invalid token")
    void testRefreshWithInvalidToken_Failure() throws Exception {
        UserDto refreshRequest = new UserDto();
        refreshRequest.setToken("invalid.token.here");

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500))
                .andExpect(jsonPath("$.message").exists());
    }
}

package com.example.jobvector.controller;

import com.example.jobvector.Dto.UserDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CvControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String candidateToken;

    @BeforeEach
    void setUp() throws Exception {
        candidateToken = createUserAndGetToken("CANDIDATE", "candidate@test.com");
    }

    private String createUserAndGetToken(String role, String email) throws Exception {
        UserDto userDto = new UserDto();
        userDto.setNom("Test");
        userDto.setPrenom("User");
        userDto.setEmail(email);
        userDto.setPassword("password123");
        userDto.setRole(role);
        userDto.setCin("123456789");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk());

        UserDto loginDto = new UserDto();
        loginDto.setEmail(email);
        loginDto.setPassword("password123");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponse = loginResult.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(loginResponse);
        return jsonNode.get("token").asText();
    }

    @Test
    @DisplayName("Test CV Controller - Test Endpoint")
    void testCvTestEndpoint() throws Exception {
        mockMvc.perform(get("/api/candidate/cv/test")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(content().string("CV Controller is working!"));
    }

    @Test
    @DisplayName("Test CV Status - No CV")
    void testCvStatus_NoCv() throws Exception {
        mockMvc.perform(get("/api/candidate/cv/status")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasCv").value(false));
    }

    @Test
    @DisplayName("Test CV Upload - Empty File")
    void testCvUpload_EmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/candidate/cv/upload")
                .file(emptyFile)
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").value("Le fichier est vide"))
                .andExpect(jsonPath("$.error").value("EMPTY_FILE"));
    }

    @Test
    @DisplayName("Test CV Upload - Invalid File Type")
    void testCvUpload_InvalidFileType() throws Exception {
        MockMultipartFile textFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "This is not a PDF file".getBytes()
        );

        mockMvc.perform(multipart("/api/candidate/cv/upload")
                .file(textFile)
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").value("Seuls les fichiers PDF sont acceptés"))
                .andExpect(jsonPath("$.error").value("INVALID_FILE_TYPE"));
    }

    @Test
    @DisplayName("Test CV Upload - Unauthorized Access")
    void testCvUpload_Unauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/api/candidate/cv/upload")
                .file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test Get CV - Not Found")
    void testGetCv_NotFound() throws Exception {
        mockMvc.perform(get("/api/candidate/cv/my-cv")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode").value(404))
                .andExpect(jsonPath("$.message").value("Aucun CV trouvé pour cet utilisateur"))
                .andExpect(jsonPath("$.error").value("CV_NOT_FOUND"));
    }

    @Test
    @DisplayName("Test Delete CV - Not Found")
    void testDeleteCv_NotFound() throws Exception {
        mockMvc.perform(delete("/api/candidate/cv/delete")
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.statusCode").value(500))
                .andExpect(jsonPath("$.message").value("Erreur lors de la suppression du CV"));
    }

    @Test
    @DisplayName("Test CV Upload - PDF Processing Error")
    void testCvUpload_PdfProcessingError() throws Exception {
        // Create a file that looks like PDF but isn't valid PDF content
        MockMultipartFile invalidPdfFile = new MockMultipartFile(
                "file",
                "invalid.pdf",
                "application/pdf",
                "This is not valid PDF content but has the right MIME type".getBytes()
        );

        // This should fail because PDFBox cannot parse invalid PDF content
        mockMvc.perform(multipart("/api/candidate/cv/upload")
                .file(invalidPdfFile)
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").value("Le fichier PDF est invalide ou corrompu"))
                .andExpect(jsonPath("$.error").value("INVALID_PDF_FILE"));
    }

    @Test
    @DisplayName("Test CV Upload - File Too Large")
    void testCvUpload_FileTooLarge() throws Exception {
        // Create a file larger than 10MB
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeContent
        );

        mockMvc.perform(multipart("/api/candidate/cv/upload")
                .file(largeFile)
                .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.message").value("Le fichier est trop volumineux. Taille maximale autorisée : 10MB"))
                .andExpect(jsonPath("$.error").value("FILE_TOO_LARGE"));
    }
}

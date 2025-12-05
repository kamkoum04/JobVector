package com.example.jobvector.Controller;

import com.example.jobvector.Dto.BaseResponseDto;
import com.example.jobvector.Dto.CvDto;
import com.example.jobvector.Dto.CvProcessingJobDto;
import com.example.jobvector.Model.CvProcessingJob;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.CvProcessingJobRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.AsyncCvProcessingService;
import com.example.jobvector.Service.CvService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/cv")
public class CvController {
    
    private static final Logger logger = LoggerFactory.getLogger(CvController.class);
    
    @Autowired
    private CvService cvService;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private CvProcessingJobRepository jobRepository;
    
    @Autowired
    private AsyncCvProcessingService asyncCvProcessingService;
    
    @Value("${app.upload.cv.directory}")
    private String uploadDirectory;
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("CV Controller is working!");
    }
    
    @PostMapping("/upload")
    public ResponseEntity<CvProcessingJobDto> uploadCv(@RequestParam("file") MultipartFile file) {
        try {
            // Vérifier si le fichier est vide
            if (file.isEmpty()) {
                CvProcessingJobDto response = new CvProcessingJobDto();
                response.setStatusCode(400);
                response.setMessage("Le fichier est vide");
                response.setError("EMPTY_FILE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Vérifier le type de fichier
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                CvProcessingJobDto response = new CvProcessingJobDto();
                response.setStatusCode(400);
                response.setMessage("Seuls les fichiers PDF sont acceptés");
                response.setError("INVALID_FILE_TYPE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Vérifier la taille du fichier (max 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB en bytes
            if (file.getSize() > maxSize) {
                CvProcessingJobDto response = new CvProcessingJobDto();
                response.setStatusCode(400);
                response.setMessage("Le fichier est trop volumineux. Taille maximale autorisée : 10MB");
                response.setError("FILE_TOO_LARGE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long utilisateurId = getUserIdFromEmail(email);
            
            Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            // Save file immediately
            String fileName = saveFile(file);
            
            // Extract text from PDF
            String texteExtrait = extractTextFromPdf(file);
            
            // Create processing job
            CvProcessingJob job = new CvProcessingJob();
            job.setUtilisateur(utilisateur);
            job.setFileName(file.getOriginalFilename());
            job.setFilePath(fileName);
            job.setStatus(CvProcessingJob.JobStatus.PENDING);
            job.setStatusDetails("CV file uploaded, waiting to start processing...");
            job = jobRepository.save(job);
            
            logger.info("Created CV processing job ID: {} for user: {}", job.getId(), email);
            
            // Trigger async processing
            asyncCvProcessingService.processCvAsync(job.getId(), texteExtrait);
            
            // Return job ID immediately
            CvProcessingJobDto response = CvProcessingJobDto.fromEntity(job);
            response.setStatusCode(202); // Accepted
            response.setMessage("CV upload initiated. Processing in background.");
            
            return ResponseEntity.accepted().body(response);
            
        } catch (RuntimeException e) {
            logger.error("Erreur lors de l'upload du CV: {}", e.getMessage(), e);
            CvProcessingJobDto response = new CvProcessingJobDto();
            
            // Distinguer les différents types d'erreurs
            if (e.getMessage().contains("PDF est invalide") || e.getMessage().contains("corrompu")) {
                response.setStatusCode(400);
                response.setMessage("Le fichier PDF est invalide ou corrompu");
                response.setError("INVALID_PDF_FILE");
                return ResponseEntity.badRequest().body(response);
            } else if (e.getMessage().contains("Utilisateur non trouvé")) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                response.setError("USER_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else {
                response.setStatusCode(500);
                response.setMessage("Erreur lors du traitement du CV");
                response.setError(e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            logger.error("Erreur lors de l'upload du CV: {}", e.getMessage(), e);
            CvProcessingJobDto response = new CvProcessingJobDto();
            response.setStatusCode(500);
            response.setMessage("Erreur lors du traitement du CV");
            response.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/my-cv")
    public ResponseEntity<?> getMyCv() {
        try {
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            // Obtenir l'ID de l'utilisateur depuis l'email
            Long utilisateurId = getUserIdFromEmail(email);
            
            // Vérifier si l'utilisateur a un CV
            if (!cvService.hasCv(utilisateurId)) {
                BaseResponseDto response = new BaseResponseDto();
                response.setStatusCode(404);
                response.setMessage("Aucun CV trouvé pour cet utilisateur");
                response.setError("CV_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Récupérer le CV
            CvDto cvDto = cvService.getCvByUtilisateurId(utilisateurId);
            
            return ResponseEntity.ok(cvDto);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du CV: {}", e.getMessage(), e);
            BaseResponseDto response = new BaseResponseDto();
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la récupération du CV");
            response.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getCvStatus() {
        try {
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            // Obtenir l'ID de l'utilisateur depuis l'email
            Long utilisateurId = getUserIdFromEmail(email);
            
            // Vérifier si l'utilisateur a un CV
            boolean hasCv = cvService.hasCv(utilisateurId);
            
            return ResponseEntity.ok(new CvStatusResponse(hasCv));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification du statut du CV: {}", e.getMessage(), e);
            BaseResponseDto response = new BaseResponseDto();
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la vérification du statut");
            response.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<BaseResponseDto> deleteCv() {
        try {
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            // Obtenir l'ID de l'utilisateur depuis l'email
            Long utilisateurId = getUserIdFromEmail(email);
            
            // Supprimer le CV
            cvService.deleteCv(utilisateurId);
            
            BaseResponseDto response = new BaseResponseDto();
            response.setStatusCode(200);
            response.setMessage("CV supprimé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression du CV: {}", e.getMessage(), e);
            BaseResponseDto response = new BaseResponseDto();
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la suppression du CV");
            response.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable Long jobId) {
        try {
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Long utilisateurId = getUserIdFromEmail(email);
            
            // Vérifier que le job appartient à l'utilisateur
            CvProcessingJob job = jobRepository.findByIdAndUtilisateurId(jobId, utilisateurId)
                    .orElseThrow(() -> new RuntimeException("Job non trouvé"));
            
            CvProcessingJobDto response = CvProcessingJobDto.fromEntity(job);
            
            // Si le job est terminé, inclure les données du CV
            if (job.getStatus() == CvProcessingJob.JobStatus.COMPLETED && job.getCv() != null) {
                response.setCvData(cvService.getCvByUtilisateurId(utilisateurId));
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du statut du job: {}", e.getMessage(), e);
            BaseResponseDto errorResponse = new BaseResponseDto();
            errorResponse.setStatusCode(500);
            errorResponse.setMessage("Erreur lors de la récupération du statut");
            errorResponse.setError(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    private Long getUserIdFromEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + email));
        return utilisateur.getId();
    }
    
    private String saveFile(MultipartFile file) throws IOException {
        // Créer le répertoire s'il n'existe pas
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Générer un nom de fichier unique
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        
        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath);
        
        return fileName;
    }
    
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            if (document.isEncrypted()) {
                throw new RuntimeException("Le fichier PDF est chiffré");
            }
            
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            logger.error("Erreur lors de l'extraction du texte du PDF: {}", e.getMessage());
            throw new RuntimeException("Le fichier PDF est invalide ou corrompu", e);
        }
    }
    
    // Classe interne pour la réponse du statut du CV
    public static class CvStatusResponse {
        private boolean hasCv;
        
        public CvStatusResponse(boolean hasCv) {
            this.hasCv = hasCv;
        }
        
        public boolean isHasCv() {
            return hasCv;
        }
        
        public void setHasCv(boolean hasCv) {
            this.hasCv = hasCv;
        }
    }
}
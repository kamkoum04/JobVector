package com.example.jobvector.Controller;

import com.example.jobvector.Dto.BaseResponseDto;
import com.example.jobvector.Dto.CvDto;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.CvService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate/cv")
public class CvController {
    
    private static final Logger logger = LoggerFactory.getLogger(CvController.class);
    
    @Autowired
    private CvService cvService;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @PostMapping("/upload")
    public ResponseEntity<BaseResponseDto> uploadCv(@RequestParam("file") MultipartFile file) {
        try {
            // Vérifier si le fichier est vide
            if (file.isEmpty()) {
                BaseResponseDto response = new BaseResponseDto();
                response.setStatusCode(400);
                response.setMessage("Le fichier est vide");
                response.setError("EMPTY_FILE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Vérifier le type de fichier
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                BaseResponseDto response = new BaseResponseDto();
                response.setStatusCode(400);
                response.setMessage("Seuls les fichiers PDF sont acceptés");
                response.setError("INVALID_FILE_TYPE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Vérifier la taille du fichier (max 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB en bytes
            if (file.getSize() > maxSize) {
                BaseResponseDto response = new BaseResponseDto();
                response.setStatusCode(400);
                response.setMessage("Le fichier est trop volumineux. Taille maximale autorisée : 10MB");
                response.setError("FILE_TOO_LARGE");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Obtenir l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            // Obtenir l'ID de l'utilisateur depuis l'email
            Long utilisateurId = getUserIdFromEmail(email);
            
            // Traiter le CV
            cvService.uploadAndProcessCv(file, utilisateurId);
            
            BaseResponseDto response = new BaseResponseDto();
            response.setStatusCode(200);
            response.setMessage("CV uploadé et traité avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Erreur lors de l'upload du CV: {}", e.getMessage(), e);
            BaseResponseDto response = new BaseResponseDto();
            
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
            BaseResponseDto response = new BaseResponseDto();
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
    
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("CV Controller is working!");
    }
    
    private Long getUserIdFromEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + email));
        return utilisateur.getId();
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
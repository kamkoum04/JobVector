package com.example.jobvector.Controller;

import com.example.jobvector.Dto.ApplicationDto;
import com.example.jobvector.Model.Application;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.ApplicationRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApplicationController {
    
    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    // ========== ROUTES CANDIDAT ==========
    
    /**
     * Candidater à une offre d'emploi
     * POST /api/candidate/job-offers/{id}/apply
     */
    @PostMapping("/candidate/job-offers/{id}/apply")
    public ResponseEntity<ApplicationDto> applyToJobOffer(@PathVariable Long id, 
                                                         @RequestBody(required = false) ApplicationDto request) {
        logger.info("Candidature à l'offre d'emploi: {}", id);
        
        String lettreMotivation = request != null ? request.getLettreMotivation() : null;
        ApplicationDto response = applicationService.applyToJobOffer(id, lettreMotivation);
        
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Récupérer mes candidatures
     * GET /api/candidate/applications?page=0&size=10
     */
    @GetMapping("/candidate/applications")
    public ResponseEntity<ApplicationDto> getMyCandidatures(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        logger.info("Récupération des candidatures du candidat - Page: {}, Size: {}", page, size);
        
        ApplicationDto response = applicationService.getMyCandidatures(page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Retirer une candidature
     * DELETE /api/candidate/applications/{id}
     */
    @DeleteMapping("/candidate/applications/{id}")
    public ResponseEntity<ApplicationDto> withdrawApplication(@PathVariable Long id) {
        logger.info("Retrait de la candidature: {}", id);
        
        ApplicationDto response = applicationService.withdrawApplication(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Voir le détail d'une candidature
     * GET /api/candidate/applications/{id}
     */
    @GetMapping("/candidate/applications/{id}")
    public ResponseEntity<ApplicationDto> getMyApplicationDetails(@PathVariable Long id) {
        logger.info("Récupération des détails de la candidature: {}", id);
        
        // Cette méthode sera implémentée dans ApplicationService
        ApplicationDto response = new ApplicationDto();
        response.setStatusCode(501);
        response.setMessage("Fonctionnalité non encore implémentée");
        
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    // ========== ROUTES EMPLOYEUR ==========
    
    /**
     * Récupérer toutes les candidatures reçues
     * GET /api/employer/applications?page=0&size=10
     */
    @GetMapping("/employer/applications")
    public ResponseEntity<ApplicationDto> getAllReceivedApplications(@RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "30") int size) {
        logger.info("Récupération de toutes les candidatures reçues - Page: {}, Size: {}", page, size);
        
        ApplicationDto response = applicationService.getReceivedApplications(null, page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Récupérer les candidatures pour une offre spécifique
     * GET /api/employer/job-offers/{jobOfferId}/applications?page=0&size=10
     */
    @GetMapping("/employer/job-offers/{jobOfferId}/applications")
    public ResponseEntity<ApplicationDto> getJobOfferApplications(@PathVariable Long jobOfferId,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        logger.info("Récupération des candidatures pour l'offre: {} - Page: {}, Size: {}", jobOfferId, page, size);
        
        ApplicationDto response = applicationService.getReceivedApplications(jobOfferId, page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Mettre à jour le statut d'une candidature
     * PUT /api/employer/applications/{id}/status
     */
    @PutMapping("/employer/applications/{id}/status")
    public ResponseEntity<ApplicationDto> updateApplicationStatus(@PathVariable Long id,
                                                                @RequestBody ApplicationStatusUpdateRequest request) {
        logger.info("Mise à jour du statut de la candidature: {} vers {}", id, request.getStatut());
        
        ApplicationDto response = applicationService.updateApplicationStatus(
            id, 
            request.getStatut(), 
            request.getCommentaireEmployeur(),
            request.getCommentairePublic()
        );
        
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Voir le détail d'une candidature (employeur)
     * GET /api/employer/applications/{id}
     */
    @GetMapping("/employer/applications/{id}")
    public ResponseEntity<ApplicationDto> getApplicationDetails(@PathVariable Long id) {
        logger.info("Récupération des détails de la candidature: {}", id);
        
        // Cette méthode sera implémentée dans ApplicationService
        ApplicationDto response = new ApplicationDto();
        response.setStatusCode(501);
        response.setMessage("Fonctionnalité non encore implémentée");
        
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Télécharger le CV d'une candidature
     * GET /api/employer/applications/{id}/cv
     */
    @GetMapping("/employer/applications/{id}/cv")
    public ResponseEntity<?> downloadApplicationCv(@PathVariable Long id) {
        logger.info("Téléchargement du CV pour la candidature: {}", id);
        
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Utilisateur non trouvé");
            }
            
            Utilisateur employeur = utilisateurOptional.get();
            
            // Récupérer la candidature
            Optional<Application> applicationOptional = applicationRepository.findById(id);
            if (applicationOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Candidature non trouvée");
            }
            
            Application application = applicationOptional.get();
            
            // Vérifier que la candidature appartient à l'employeur
            if (!application.getJobOffre().getEmployeur().getId().equals(employeur.getId())) {
                return ResponseEntity.status(403).body("Accès refusé");
            }
            
            // Récupérer le chemin du CV copié
            String cvFilePath = application.getCvFilePath();
            if (cvFilePath == null || cvFilePath.isEmpty()) {
                return ResponseEntity.status(404).body("CV non trouvé pour cette candidature");
            }
            
            // Lire le fichier
            Path filePath = Paths.get(cvFilePath);
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(404).body("Fichier CV non trouvé sur le serveur");
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);
            
            // Créer un nom de fichier descriptif
            String candidatNom = application.getCandidat().getNom();
            String candidatPrenom = application.getCandidat().getPrenom();
            String jobTitle = application.getJobOffre().getTitre();
            String fileName = String.format("CV_%s_%s_%s.pdf", candidatPrenom, candidatNom, jobTitle.replaceAll("[^a-zA-Z0-9]", "_"));
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .body(fileContent);
                    
        } catch (Exception e) {
            logger.error("Erreur lors du téléchargement du CV: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erreur lors du téléchargement du CV");
        }
    }
    
    // ========== ROUTES COMMUNES ==========
    
    /**
     * Statistiques des candidatures (pour tableau de bord)
     * GET /api/applications/stats
     */
    @GetMapping("/applications/stats")
    public ResponseEntity<ApplicationDto> getApplicationStats() {
        logger.info("Récupération des statistiques des candidatures");
        
        // Cette méthode sera implémentée dans ApplicationService
        ApplicationDto response = new ApplicationDto();
        response.setStatusCode(501);
        response.setMessage("Fonctionnalité de statistiques non encore implémentée");
        
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    // ========== CLASSES INTERNES ==========
    
    /**
     * Classe pour la mise à jour du statut d'une candidature
     */
    public static class ApplicationStatusUpdateRequest {
        private Application.StatutCandidature statut;
        private String commentaireEmployeur;
        private String commentairePublic;
        
        // Getters et setters
        public Application.StatutCandidature getStatut() { return statut; }
        public void setStatut(Application.StatutCandidature statut) { this.statut = statut; }
        
        public String getCommentaireEmployeur() { return commentaireEmployeur; }
        public void setCommentaireEmployeur(String commentaireEmployeur) { this.commentaireEmployeur = commentaireEmployeur; }
        
        public String getCommentairePublic() { return commentairePublic; }
        public void setCommentairePublic(String commentairePublic) { this.commentairePublic = commentairePublic; }
    }
}

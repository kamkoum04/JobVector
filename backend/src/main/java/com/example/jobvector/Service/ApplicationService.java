package com.example.jobvector.Service;

import com.example.jobvector.Dto.ApplicationDto;

import com.example.jobvector.Model.Application;
import com.example.jobvector.Model.Cv;
import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.ApplicationRepository;
import com.example.jobvector.Repository.CvRepository;
import com.example.jobvector.Repository.JobOfferRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private CvRepository cvRepository;
    


    @Autowired
    private MatchingService matchingService;
    
    @Value("${app.upload.cv.directory}")
    private String cvDirectory;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // ===== MÉTHODES CANDIDAT =====
    
    /**
     * Candidater à une offre d'emploi
     */
    public ApplicationDto applyToJobOffer(Long jobOfferId, String lettreMotivation) {
        ApplicationDto response = new ApplicationDto();
        
        try {
            // Récupérer l'utilisateur connecté
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur candidat = utilisateurOptional.get();
            
            // Vérifier que l'utilisateur est un candidat
            if (!"CANDIDATE".equals(candidat.getRole())) {
                response.setStatusCode(403);
                response.setMessage("Seuls les candidats peuvent postuler aux offres d'emploi");
                return response;
            }
            
            // Récupérer l'offre d'emploi
            Optional<JobOffre> jobOfferOptional = jobOfferRepository.findById(jobOfferId);
            if (jobOfferOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Offre d'emploi non trouvée");
                return response;
            }
            
            JobOffre jobOffer = jobOfferOptional.get();
            
            // Vérifier que l'offre est active
            if (!"ACTIVE".equals(jobOffer.getStatut())) {
                response.setStatusCode(400);
                response.setMessage("Cette offre d'emploi n'est plus active");
                return response;
            }
            
            // Vérifier si le candidat a déjà postulé
            if (applicationRepository.existsByCandidatAndJobOffre(candidat, jobOffer)) {
                response.setStatusCode(400);
                response.setMessage("Vous avez déjà postulé pour cette offre d'emploi");
                return response;
            }
            
            // Vérifier si le candidat a un CV
            Optional<Cv> cvOptional = cvRepository.findByUtilisateurId(candidat.getId());
            if (cvOptional.isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vous devez d'abord uploader votre CV pour pouvoir postuler");
                response.setCvUploadRequired(true);
                return response;
            }
            
            Cv cv = cvOptional.get();
            
            // Créer la candidature
            Application application = new Application();
            application.setCandidat(candidat);
            application.setJobOffre(jobOffer);
            application.setLettreMotivation(lettreMotivation);
            application.setStatut(Application.StatutCandidature.EN_ATTENTE);
            
            // Créer un snapshot des données du CV
            String cvDataSnapshot = createCvDataSnapshot(cv);
            application.setCvDataSnapshot(cvDataSnapshot);
            
            // Copier l'embedding du CV
            if (cv.getEmbedding() != null) {
                application.setCvEmbedding(cv.getEmbedding());
            }
            
            // Générer un nom de fichier temporaire pour le CV
            String tempFileName = String.format("%d_%d_%d.pdf", 
                                               candidat.getId(),
                                               jobOffer.getId(),
                                               System.currentTimeMillis());
            
            // Copier le CV avant de sauvegarder l'application
            String cvCopyPath = null;
            Application savedApplication = null;
            
            try {
                cvCopyPath = copyCvForApplicationWithFileName(cv, tempFileName);
                application.setCvFilePath(cvCopyPath);
                
                // Sauvegarder la candidature avec le chemin du CV
                savedApplication = applicationRepository.save(application);
                
            } catch (IOException e) {
                logger.error("Erreur lors de la copie du CV: {}", e.getMessage());
                
                response.setStatusCode(500);
                response.setMessage("Erreur lors de la copie du CV: " + e.getMessage());
                return response;
            }
            
            // Calculer les scores de matching en arrière-plan
            try {
                calculateMatchingScores(savedApplication);
            } catch (Exception e) {
                logger.warn("Erreur lors du calcul des scores de matching pour la candidature {}: {}", 
                           savedApplication.getId(), e.getMessage());
            }
            
            response = convertToDto(savedApplication);
            response.setStatusCode(201);
            response.setMessage("Votre candidature a été soumise avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de la candidature: {}", e.getMessage(), e);
            response.setStatusCode(500);
            response.setMessage("Erreur interne du serveur lors de la candidature");
        }
        
        return response;
    }
    
    /**
     * Récupérer les candidatures du candidat connecté
     */
    public ApplicationDto getMyCandidatures(int page, int size) {
        ApplicationDto response = new ApplicationDto();
        
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur candidat = utilisateurOptional.get();
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCandidature"));
            Page<Application> applicationsPage = applicationRepository.findByCandidat(candidat, pageable);
            
            response = convertToDto(applicationsPage, false); // false = ne pas inclure les scores
            response.setStatusCode(200);
            response.setMessage("Candidatures récupérées avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des candidatures: {}", e.getMessage(), e);
            response.setStatusCode(500);
            response.setMessage("Erreur interne du serveur");
        }
        
        return response;
    }
    
    /**
     * Retirer une candidature
     */
    public ApplicationDto withdrawApplication(Long applicationId) {
        ApplicationDto response = new ApplicationDto();
        
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur candidat = utilisateurOptional.get();
            
            // Récupérer la candidature
            Optional<Application> applicationOptional = applicationRepository.findById(applicationId);
            if (applicationOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Candidature non trouvée");
                return response;
            }
            
            Application application = applicationOptional.get();
            
            // Vérifier que la candidature appartient au candidat
            if (!application.getCandidat().getId().equals(candidat.getId())) {
                response.setStatusCode(403);
                response.setMessage("Vous n'avez pas le droit de retirer cette candidature");
                return response;
            }
            
            // Vérifier que la candidature peut être retirée
            if (application.getStatut() == Application.StatutCandidature.ACCEPTE) {
                response.setStatusCode(400);
                response.setMessage("Vous ne pouvez pas retirer une candidature acceptée");
                return response;
            }
            
            // Marquer comme retirée
            application.setStatut(Application.StatutCandidature.RETIREE);
            applicationRepository.save(application);
            
            response = convertToDto(application);
            response.setStatusCode(200);
            response.setMessage("Candidature retirée avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors du retrait de la candidature: {}", e.getMessage(), e);
            response.setStatusCode(500);
            response.setMessage("Erreur interne du serveur");
        }
        
        return response;
    }
    
    // ===== MÉTHODES EMPLOYEUR =====
    
    /**
     * Récupérer les candidatures reçues pour les offres de l'employeur
     */
    public ApplicationDto getReceivedApplications(Long jobOfferId, int page, int size) {
        ApplicationDto response = new ApplicationDto();
        
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur employeur = utilisateurOptional.get();
            
            Page<Application> applicationsPage;
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "scoreGlobal", "dateCandidature"));
            
            if (jobOfferId != null) {
                // Candidatures pour une offre spécifique
                Optional<JobOffre> jobOfferOptional = jobOfferRepository.findById(jobOfferId);
                if (jobOfferOptional.isEmpty()) {
                    response.setStatusCode(404);
                    response.setMessage("Offre d'emploi non trouvée");
                    return response;
                }
                
                JobOffre jobOffer = jobOfferOptional.get();
                
                // Vérifier que l'offre appartient à l'employeur
                if (!jobOffer.getEmployeur().getId().equals(employeur.getId())) {
                    response.setStatusCode(403);
                    response.setMessage("Vous n'avez pas accès aux candidatures de cette offre");
                    return response;
                }
                
                applicationsPage = applicationRepository.findByJobOffreOrderByScoreDesc(jobOffer, pageable);
            } else {
                // Toutes les candidatures de l'employeur
                applicationsPage = applicationRepository.findByEmployeur(employeur, pageable);
            }
            
            response = convertToDto(applicationsPage, true); // true = inclure les scores
            response.setStatusCode(200);
            response.setMessage("Candidatures récupérées avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des candidatures: {}", e.getMessage(), e);
            response.setStatusCode(500);
            response.setMessage("Erreur interne du serveur");
        }
        
        return response;
    }
    
    /**
     * Changer le statut d'une candidature
     */
    public ApplicationDto updateApplicationStatus(Long applicationId, Application.StatutCandidature newStatus, 
                                                 String commentaireEmployeur, String commentairePublic) {
        ApplicationDto response = new ApplicationDto();
        
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);
            
            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }
            
            Utilisateur employeur = utilisateurOptional.get();
            
            // Récupérer la candidature
            Optional<Application> applicationOptional = applicationRepository.findById(applicationId);
            if (applicationOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Candidature non trouvée");
                return response;
            }
            
            Application application = applicationOptional.get();
            
            // Vérifier que la candidature appartient à l'employeur
            if (!application.getJobOffre().getEmployeur().getId().equals(employeur.getId())) {
                response.setStatusCode(403);
                response.setMessage("Vous n'avez pas le droit de modifier cette candidature");
                return response;
            }
            
            // Mettre à jour le statut et les commentaires
            application.setStatut(newStatus);
            if (commentaireEmployeur != null) {
                application.setCommentaireEmployeur(commentaireEmployeur);
            }
            if (commentairePublic != null) {
                application.setCommentairePublic(commentairePublic);
            }
            
            applicationRepository.save(application);
            
            response = convertToDto(application);
            response.setStatusCode(200);
            response.setMessage("Statut de la candidature mis à jour avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du statut: {}", e.getMessage(), e);
            response.setStatusCode(500);
            response.setMessage("Erreur interne du serveur");
        }
        
        return response;
    }
    
    // ===== MÉTHODES UTILITAIRES =====
    
    /**
     * Copier le CV pour une candidature spécifique avec un nom de fichier personnalisé
     */
    private String copyCvForApplicationWithFileName(Cv cv, String fileName) throws IOException {
        try {
            // Construire le chemin absolu du CV original
            Path originalCvPath;
            String fichierPath = cv.getFichierPath();
            
            if (fichierPath == null || fichierPath.trim().isEmpty()) {
                throw new IOException("Le chemin du CV est vide ou null");
            }
            
            if (fichierPath.startsWith("/")) {
                // Chemin absolu
                originalCvPath = Paths.get(fichierPath);
            } else {
                // Chemin relatif - construire le chemin complet
                originalCvPath = Paths.get(cvDirectory, fichierPath);
            }
            
            logger.info("Tentative de copie du CV: {} vers applications/", originalCvPath);
            
            // Vérifier que le CV original existe
            if (!Files.exists(originalCvPath)) {
                logger.error("Le CV original n'existe pas: {}", originalCvPath);
                logger.error("Répertoire CV configuré: {}", cvDirectory);
                logger.error("Chemin CV dans BD: {}", fichierPath);
                
                // Essayer de trouver le fichier dans le répertoire uploads/cvs
                Path uploadsDir = Paths.get(cvDirectory);
                if (Files.exists(uploadsDir)) {
                    logger.info("Contenu du répertoire uploads/cvs:");
                    Files.list(uploadsDir).forEach(path -> logger.info("  - {}", path.getFileName()));
                }
                
                throw new IOException("Le CV original n'existe pas: " + originalCvPath);
            }
            
            // Créer le répertoire pour les CV des candidatures
            Path applicationsDir = Paths.get(cvDirectory, "applications");
            if (!Files.exists(applicationsDir)) {
                Files.createDirectories(applicationsDir);
                logger.info("Répertoire applications créé: {}", applicationsDir);
            }
            
            Path applicationCvPath = applicationsDir.resolve(fileName);
            
            // Copier le fichier
            Files.copy(originalCvPath, applicationCvPath, StandardCopyOption.REPLACE_EXISTING);
            
            logger.info("CV copié avec succès de {} vers {}", originalCvPath, applicationCvPath);
            
            return applicationCvPath.toString();
            
        } catch (IOException e) {
            logger.error("Erreur lors de la copie du CV pour la candidature: {}", e.getMessage(), e);
            throw e;
        }
    }


    /**
     * Créer un snapshot des données du CV
     */
    private String createCvDataSnapshot(Cv cv) {
        try {
            Map<String, Object> cvData = new HashMap<>();
            cvData.put("nom", cv.getNom());
            cvData.put("prenom", cv.getPrenom());
            cvData.put("email", cv.getEmail());
            cvData.put("telephone", cv.getTelephone());
            cvData.put("competencesTechniques", cv.getCompetencesTechniques());
            cvData.put("competencesTransversales", cv.getCompetencesTransversales());
            cvData.put("experienceAnnees", cv.getExperienceAnnees());
            cvData.put("formations", cv.getFormations());
            cvData.put("certifications", cv.getCertifications());
            cvData.put("dateSnapshot", LocalDateTime.now().toString());
            
            return objectMapper.writeValueAsString(cvData);
        } catch (Exception e) {
            logger.error("Erreur lors de la création du snapshot CV: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Calculer les scores de matching
     */
    private void calculateMatchingScores(Application application) {
        try {
            if (matchingService != null && application.getCandidat() != null && application.getCandidat().getCv() != null) {
                Cv candidateCv = application.getCandidat().getCv();
                Map<String, Double> scores = matchingService.calculateMatchingScores(application.getCvEmbedding(), 
                                                                                   application.getJobOffre(),
                                                                                   candidateCv);
                
                application.setScoreGlobal(scores.getOrDefault("global", 0.0));
                application.setScoreCompetencesTechniques(scores.getOrDefault("competencesTechniques", 0.0));
                application.setScoreCompetencesTransversales(scores.getOrDefault("competencesTransversales", 0.0));
                application.setScoreExperience(scores.getOrDefault("experience", 0.0));
                application.setScoreFormation(scores.getOrDefault("formation", 0.0));
                
                applicationRepository.save(application);
            }
        } catch (Exception e) {
            logger.error("Erreur lors du calcul des scores de matching: {}", e.getMessage());
        }
    }
    
    /**
     * Convertir Application en DTO
     */
    private ApplicationDto convertToDto(Application application) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(application.getId());
        dto.setStatut(application.getStatut());
        dto.setDateCandidature(application.getDateCandidature());
        dto.setDateModification(application.getDateModification());
        dto.setLettreMotivation(application.getLettreMotivation());
        dto.setCvFilePath(application.getCvFilePath());
        dto.setCommentairePublic(application.getCommentairePublic());
        dto.setCvDataSnapshot(application.getCvDataSnapshot());
        
        // Informations du candidat
        dto.setCandidatId(application.getCandidat().getId());
        dto.setCandidatNom(application.getCandidat().getNom());
        dto.setCandidatPrenom(application.getCandidat().getPrenom());
        dto.setCandidatEmail(application.getCandidat().getEmail());
        
        // Informations de l'offre
        dto.setJobOffreId(application.getJobOffre().getId());
        dto.setJobOffreTitre(application.getJobOffre().getTitre());
        dto.setJobOffreEntreprise(application.getJobOffre().getEntreprise());
        dto.setJobOffreLocalisation(application.getJobOffre().getLocalisation());
        
        return dto;
    }
    
    /**
     * Convertir Page<Application> en DTO avec gestion des scores
     */
    private ApplicationDto convertToDto(Page<Application> applicationsPage, boolean includeScores) {
        ApplicationDto dto = new ApplicationDto();
        
        List<ApplicationDto> applicationDtos = applicationsPage.getContent().stream()
                .map(app -> {
                    ApplicationDto appDto = convertToDto(app);
                    
                    // Inclure les scores seulement si demandé (pour les employeurs)
                    if (includeScores) {
                        appDto.setScoreGlobal(app.getScoreGlobal());
                        appDto.setScoreCompetencesTechniques(app.getScoreCompetencesTechniques());
                        appDto.setScoreCompetencesTransversales(app.getScoreCompetencesTransversales());
                        appDto.setScoreExperience(app.getScoreExperience());
                        appDto.setScoreFormation(app.getScoreFormation());
                        appDto.setCommentaireEmployeur(app.getCommentaireEmployeur());
                    }
                    
                    return appDto;
                })
                .collect(Collectors.toList());
        
        dto.setApplications(applicationDtos);
        dto.setPage(applicationsPage.getNumber());
        dto.setSize(applicationsPage.getSize());
        dto.setTotalElements(applicationsPage.getTotalElements());
        dto.setTotalPages(applicationsPage.getTotalPages());
        
        return dto;
    }
}

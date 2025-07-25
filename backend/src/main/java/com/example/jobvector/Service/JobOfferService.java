package com.example.jobvector.Service;

import com.example.jobvector.Dto.JobOffreDto;
import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.JobOfferRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobOfferService {

    private static final Logger logger = LoggerFactory.getLogger(JobOfferService.class);

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PythonEmbeddingService pythonEmbeddingService;

    // ===== MÉTHODES PUBLIQUES (TOUS LES UTILISATEURS) =====

    /**
     * Récupérer toutes les offres d'emploi actives avec pagination
     */
    public JobOffreDto getAllActiveJobOffers(int page, int size) {
        // Pour les requêtes JPQL, utiliser le nom de propriété Java
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "datePublication"));
        Page<JobOffre> jobOffers = jobOfferRepository.findActiveNonExpired(pageable);

        return convertToDto(jobOffers);
    }

    /**
     * Récupérer une offre d'emploi par ID
     */
    public JobOffreDto getJobOfferById(Long id) {
        JobOffreDto response = new JobOffreDto();

        Optional<JobOffre> jobOfferOptional = jobOfferRepository.findById(id);
        if (jobOfferOptional.isPresent()) {
            JobOffre jobOffer = jobOfferOptional.get();
            response = convertToDto(jobOffer);
            response.setStatusCode(200);
            response.setMessage("Offre d'emploi trouvée");
        } else {
            response.setStatusCode(404);
            response.setMessage("Offre d'emploi non trouvée");
        }

        return response;
    }

    /**
     * Rechercher des offres d'emploi par mot-clé
     */
    public JobOffreDto searchJobOffers(String keyword, int page, int size) {
        // Pour les requêtes natives SQL, utiliser le nom de colonne PostgreSQL
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date_publication"));
        Page<JobOffre> jobOffers = jobOfferRepository.searchByKeyword(keyword, pageable);

        return convertToDto(jobOffers);
    }

    /**
     * Rechercher des offres d'emploi avec filtres avancés
     */
    public JobOffreDto searchJobOffersWithFilters(
            String titre, String localisation, String secteurActivite,
            JobOffre.TypePoste typePoste, JobOffre.ModaliteTravail modaliteTravail,
            Integer experienceMin, Double salaireMin, int page, int size) {

        // Pour les requêtes natives SQL, utiliser le nom de colonne PostgreSQL
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date_publication"));

        // Convertir les enums en strings pour la requête native
        String typePosteStr = typePoste != null ? typePoste.name() : null;
        String modaliteTravailStr = modaliteTravail != null ? modaliteTravail.name() : null;

        Page<JobOffre> jobOffers = jobOfferRepository.findWithFilters(
                titre, localisation, secteurActivite, typePosteStr, modaliteTravailStr,
                experienceMin, salaireMin, "ACTIVE", pageable);

        return convertToDto(jobOffers);
    }

    /**
     * Récupérer les offres récentes (30 derniers jours)
     */
    public JobOffreDto getRecentJobOffers(int page, int size) {
        LocalDateTime dateDebut = LocalDateTime.now().minusDays(30);
        // Pour les requêtes JPQL, utiliser le nom de propriété Java
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "datePublication"));
        Page<JobOffre> jobOffers = jobOfferRepository.findRecentOffers(dateDebut, pageable);

        return convertToDto(jobOffers);
    }

    // ===== MÉTHODES POUR LES EMPLOYEURS =====

    /**
     * Créer une nouvelle offre d'emploi (EMPLOYEUR seulement)
     */
    public JobOffreDto createJobOffer(JobOffreDto jobOfferDto) {
        JobOffreDto response = new JobOffreDto();

        try {
            // Récupérer l'utilisateur connecté
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);

            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }

            Utilisateur employeur = utilisateurOptional.get();

            // Vérifier que l'utilisateur est un employeur
            if (!"EMPLOYER".equals(employeur.getRole()) && !"ADMIN".equals(employeur.getRole())) {
                response.setStatusCode(403);
                response.setMessage("Seuls les employeurs peuvent créer des offres d'emploi");
                return response;
            }

            // Créer la nouvelle offre
            JobOffre jobOffer = new JobOffre();
            jobOffer.setTitre(jobOfferDto.getTitre());
            jobOffer.setDescription(jobOfferDto.getDescription());
            jobOffer.setLocalisation(jobOfferDto.getLocalisation());
            jobOffer.setEmployeur(employeur);
            jobOffer.setEntreprise(jobOfferDto.getEntreprise());
            jobOffer.setTypeContrat(jobOfferDto.getTypeContrat());
            jobOffer.setSalaire(jobOfferDto.getSalaire());
            jobOffer.setExperience(jobOfferDto.getExperience());
            // jobOffer.setDateExpiration(jobOfferDto.getDateExpiration());

            // Nouveaux champs pour le matching
            jobOffer.setCompetencesTechniques(jobOfferDto.getCompetencesTechniques());
            jobOffer.setCompetencesTransversales(jobOfferDto.getCompetencesTransversales());
            jobOffer.setExperienceMinRequise(jobOfferDto.getExperienceMinRequise());
            jobOffer.setNiveauEtudeMin(jobOfferDto.getNiveauEtudeMin());
            jobOffer.setLanguesRequises(jobOfferDto.getLanguesRequises());
            jobOffer.setSecteurActivite(jobOfferDto.getSecteurActivite());
            jobOffer.setMissionPrincipale(jobOfferDto.getMissionPrincipale());
            jobOffer.setResponsabilites(jobOfferDto.getResponsabilites());
            jobOffer.setOutilsTechnologies(jobOfferDto.getOutilsTechnologies());
            jobOffer.setTypePoste(jobOfferDto.getTypePoste());
            jobOffer.setModaliteTravail(jobOfferDto.getModaliteTravail());
            // ...existing code...

            JobOffre savedJobOffer = jobOfferRepository.save(jobOffer);

            // Générer l'embedding vectoriel de manière synchrone
            logger.info("Début de la génération d'embedding pour l'offre d'emploi ID: {}", savedJobOffer.getId());
            String embedding = pythonEmbeddingService.generateJobOfferEmbedding(savedJobOffer);
            
            if (embedding != null && !embedding.isEmpty()) {
                savedJobOffer.setEmbedding(embedding);
                savedJobOffer = jobOfferRepository.save(savedJobOffer);
                logger.info("Embedding vectoriel généré et sauvegardé pour l'offre d'emploi ID: {}", savedJobOffer.getId());
            } else {
                logger.warn("Échec de la génération d'embedding pour l'offre d'emploi ID: {}", savedJobOffer.getId());
            }

            response = convertToDto(savedJobOffer);
            response.setStatusCode(201);
            response.setMessage("Offre d'emploi créée avec succès et embedding généré");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la création de l'offre d'emploi: " + e.getMessage());
        }

        return response;
    }

    /**
     * Mettre à jour une offre d'emploi (EMPLOYEUR propriétaire seulement)
     */
    public JobOffreDto updateJobOffer(Long id, JobOffreDto jobOfferDto) {
        JobOffreDto response = new JobOffreDto();

        try {
            // Récupérer l'utilisateur connecté
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);

            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }

            Utilisateur currentUser = utilisateurOptional.get();

            // Récupérer l'offre d'emploi
            Optional<JobOffre> jobOfferOptional = jobOfferRepository.findById(id);
            if (jobOfferOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Offre d'emploi non trouvée");
                return response;
            }

            JobOffre jobOffer = jobOfferOptional.get();

            // Vérifier que l'utilisateur est le propriétaire ou un admin
            if (!jobOffer.getEmployeur().getId().equals(currentUser.getId()) &&
                !"ADMIN".equals(currentUser.getRole())) {
                response.setStatusCode(403);
                response.setMessage("Vous n'avez pas le droit de modifier cette offre d'emploi");
                return response;
            }

            // Mettre à jour les champs
            if (jobOfferDto.getTitre() != null) jobOffer.setTitre(jobOfferDto.getTitre());
            if (jobOfferDto.getDescription() != null) jobOffer.setDescription(jobOfferDto.getDescription());
            if (jobOfferDto.getLocalisation() != null) jobOffer.setLocalisation(jobOfferDto.getLocalisation());
            if (jobOfferDto.getEntreprise() != null) jobOffer.setEntreprise(jobOfferDto.getEntreprise());
            if (jobOfferDto.getTypeContrat() != null) jobOffer.setTypeContrat(jobOfferDto.getTypeContrat());
            if (jobOfferDto.getSalaire() != null) jobOffer.setSalaire(jobOfferDto.getSalaire());
            if (jobOfferDto.getExperience() != null) jobOffer.setExperience(jobOfferDto.getExperience());
            // if (jobOfferDto.getDateExpiration() != null) jobOffer.setDateExpiration(jobOfferDto.getDateExpiration());
            if (jobOfferDto.getStatut() != null) jobOffer.setStatut(jobOfferDto.getStatut());

            // Mettre à jour les nouveaux champs
            if (jobOfferDto.getCompetencesTechniques() != null) jobOffer.setCompetencesTechniques(jobOfferDto.getCompetencesTechniques());
            if (jobOfferDto.getCompetencesTransversales() != null) jobOffer.setCompetencesTransversales(jobOfferDto.getCompetencesTransversales());
            if (jobOfferDto.getExperienceMinRequise() != null) jobOffer.setExperienceMinRequise(jobOfferDto.getExperienceMinRequise());
            if (jobOfferDto.getNiveauEtudeMin() != null) jobOffer.setNiveauEtudeMin(jobOfferDto.getNiveauEtudeMin());
            if (jobOfferDto.getLanguesRequises() != null) jobOffer.setLanguesRequises(jobOfferDto.getLanguesRequises());
            if (jobOfferDto.getSecteurActivite() != null) jobOffer.setSecteurActivite(jobOfferDto.getSecteurActivite());
            if (jobOfferDto.getMissionPrincipale() != null) jobOffer.setMissionPrincipale(jobOfferDto.getMissionPrincipale());
            if (jobOfferDto.getResponsabilites() != null) jobOffer.setResponsabilites(jobOfferDto.getResponsabilites());
            if (jobOfferDto.getOutilsTechnologies() != null) jobOffer.setOutilsTechnologies(jobOfferDto.getOutilsTechnologies());
            if (jobOfferDto.getTypePoste() != null) jobOffer.setTypePoste(jobOfferDto.getTypePoste());
            if (jobOfferDto.getModaliteTravail() != null) jobOffer.setModaliteTravail(jobOfferDto.getModaliteTravail());
            // ...existing code...

            JobOffre updatedJobOffer = jobOfferRepository.save(jobOffer);

            response = convertToDto(updatedJobOffer);
            response.setStatusCode(200);
            response.setMessage("Offre d'emploi mise à jour avec succès");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la mise à jour de l'offre d'emploi: " + e.getMessage());
        }

        return response;
    }

    /**
     * Récupérer les offres d'emploi d'un employeur
     */
    public JobOffreDto getMyJobOffers(int page, int size) {
        JobOffreDto response = new JobOffreDto();

        try {
            // Récupérer l'utilisateur connecté
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);

            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }

            Utilisateur employeur = utilisateurOptional.get();
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "datePublication"));
            Page<JobOffre> jobOffers = jobOfferRepository.findByEmployeur(employeur, pageable);

            response = convertToDto(jobOffers);
            response.setStatusCode(200);
            response.setMessage("Offres d'emploi récupérées avec succès");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la récupération des offres d'emploi: " + e.getMessage());
        }

        return response;
    }

    /**
     * Supprimer une offre d'emploi (EMPLOYEUR propriétaire ou ADMIN)
     */
    public JobOffreDto deleteJobOffer(Long id) {
        JobOffreDto response = new JobOffreDto();

        try {
            // Récupérer l'utilisateur connecté
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findByEmail(userEmail);

            if (utilisateurOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
                return response;
            }

            Utilisateur currentUser = utilisateurOptional.get();

            // Récupérer l'offre d'emploi
            Optional<JobOffre> jobOfferOptional = jobOfferRepository.findById(id);
            if (jobOfferOptional.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("Offre d'emploi non trouvée");
                return response;
            }

            JobOffre jobOffer = jobOfferOptional.get();

            // Vérifier que l'utilisateur est le propriétaire ou un admin
            if (!jobOffer.getEmployeur().getId().equals(currentUser.getId()) &&
                !"ADMIN".equals(currentUser.getRole())) {
                response.setStatusCode(403);
                response.setMessage("Vous n'avez pas le droit de supprimer cette offre d'emploi");
                return response;
            }

            jobOfferRepository.delete(jobOffer);

            response.setStatusCode(200);
            response.setMessage("Offre d'emploi supprimée avec succès");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la suppression de l'offre d'emploi: " + e.getMessage());
        }

        return response;
    }

    // ===== MÉTHODES UTILITAIRES =====

    /**
     * Convertir une entité JobOffre en DTO
     */
    private JobOffreDto convertToDto(JobOffre jobOffer) {
        JobOffreDto dto = new JobOffreDto();
        dto.setId(jobOffer.getId());
        dto.setTitre(jobOffer.getTitre());
        dto.setDescription(jobOffer.getDescription());
        dto.setLocalisation(jobOffer.getLocalisation());
        dto.setDatePublication(jobOffer.getDatePublication());
        // dto.setDateExpiration(jobOffer.getDateExpiration());
        dto.setStatut(jobOffer.getStatut());
        dto.setEntreprise(jobOffer.getEntreprise());
        dto.setTypeContrat(jobOffer.getTypeContrat());
        dto.setSalaire(jobOffer.getSalaire());
        dto.setExperience(jobOffer.getExperience());

        // Nouveaux champs
        dto.setCompetencesTechniques(jobOffer.getCompetencesTechniques());
        dto.setCompetencesTransversales(jobOffer.getCompetencesTransversales());
        dto.setExperienceMinRequise(jobOffer.getExperienceMinRequise());
        dto.setNiveauEtudeMin(jobOffer.getNiveauEtudeMin());
        dto.setLanguesRequises(jobOffer.getLanguesRequises());
        dto.setSecteurActivite(jobOffer.getSecteurActivite());
        dto.setMissionPrincipale(jobOffer.getMissionPrincipale());
        dto.setResponsabilites(jobOffer.getResponsabilites());
        dto.setOutilsTechnologies(jobOffer.getOutilsTechnologies());
        dto.setTypePoste(jobOffer.getTypePoste());
        dto.setModaliteTravail(jobOffer.getModaliteTravail());
        // ...existing code...

        // Informations de l'employeur
        if (jobOffer.getEmployeur() != null) {
            dto.setEmployeurId(jobOffer.getEmployeur().getId());
            dto.setEmployeurNom(jobOffer.getEmployeur().getNom());
            dto.setEmployeurPrenom(jobOffer.getEmployeur().getPrenom());
            dto.setEmployeurEmail(jobOffer.getEmployeur().getEmail());
        }

        // Ajouter l'embedding dans la réponse (pour confirmation)
        if (jobOffer.getEmbedding() != null && !jobOffer.getEmbedding().isEmpty()) {
            dto.setEmbedding("Embedding généré (" + jobOffer.getEmbedding().length() + " caractères)");
        }

        return dto;
    }

    /**
     * Convertir une page d'entités JobOffre en DTO avec pagination
     */
    private JobOffreDto convertToDto(Page<JobOffre> jobOfferPage) {
        JobOffreDto response = new JobOffreDto();

        List<JobOffreDto> jobOfferDtos = jobOfferPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        response.setJobOffers(jobOfferDtos);
        response.setPage(jobOfferPage.getNumber());
        response.setSize(jobOfferPage.getSize());
        response.setTotalElements(jobOfferPage.getTotalElements());
        response.setStatusCode(200);
        response.setMessage("Offres d'emploi récupérées avec succès");

        return response;
    }
}

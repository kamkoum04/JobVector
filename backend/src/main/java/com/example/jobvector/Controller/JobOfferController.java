package com.example.jobvector.Controller;

import com.example.jobvector.Dto.JobOffreDto;
import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class JobOfferController {

    @Autowired
    private JobOfferService jobOfferService;

    // ===== ENDPOINTS PUBLICS (TOUS LES UTILISATEURS) =====

    /**
     * Récupérer toutes les offres d'emploi actives
     * GET /api/public/job-offers
     */
    @GetMapping("/public/job-offers")
    public ResponseEntity<JobOffreDto> getAllActiveJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobOffreDto response = jobOfferService.getAllActiveJobOffers(page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Récupérer une offre d'emploi par ID
     * GET /api/public/job-offers/{id}
     */
    @GetMapping("/public/job-offers/{id}")
    public ResponseEntity<JobOffreDto> getJobOfferById(@PathVariable Long id) {
        JobOffreDto response = jobOfferService.getJobOfferById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Rechercher des offres d'emploi par mot-clé
     * GET /api/public/job-offers/search
     */
    @GetMapping("/public/job-offers/search")
    public ResponseEntity<JobOffreDto> searchJobOffers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobOffreDto response = jobOfferService.searchJobOffers(keyword, page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Rechercher des offres d'emploi avec filtres avancés
     * GET /api/public/job-offers/search/filters
     */
    @GetMapping("/public/job-offers/search/filters")
    public ResponseEntity<JobOffreDto> searchJobOffersWithFilters(
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) String localisation,
            @RequestParam(required = false) String secteurActivite,
            @RequestParam(required = false) JobOffre.TypePoste typePoste,
            @RequestParam(required = false) JobOffre.ModaliteTravail modaliteTravail,
            @RequestParam(required = false) Integer experienceMin,
            @RequestParam(required = false) Double salaireMin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobOffreDto response = jobOfferService.searchJobOffersWithFilters(
                titre, localisation, secteurActivite, typePoste, modaliteTravail,
                 experienceMin, salaireMin, page, size);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Récupérer les offres récentes (30 derniers jours)
     * GET /api/public/job-offers/recent
     */
    @GetMapping("/public/job-offers/recent")
    public ResponseEntity<JobOffreDto> getRecentJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobOffreDto response = jobOfferService.getRecentJobOffers(page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Récupérer les énumérations pour les formulaires
     * GET /api/public/job-offers/enums
     */
    @GetMapping("/public/job-offers/enums")
    public ResponseEntity<?> getJobOfferEnums() {
        return ResponseEntity.ok(new Object() {
            public final JobOffre.TypePoste[] typePoste = JobOffre.TypePoste.values();
            public final JobOffre.ModaliteTravail[] modaliteTravail = JobOffre.ModaliteTravail.values();
            public final JobOffre.NiveauSeniorite[] niveauSeniorite = JobOffre.NiveauSeniorite.values();
            public final JobOffre.NiveauEtude[] niveauEtude = JobOffre.NiveauEtude.values();
        });
    }

    // ===== ENDPOINTS POUR LES CANDIDATS =====

    /**
     * Sauvegarder une offre d'emploi en favori (CANDIDATE seulement)
     * POST /api/candidate/job-offers/{id}/favorite
     */
    @PostMapping("/candidate/job-offers/{id}/favorite")
    public ResponseEntity<JobOffreDto> favoriteJobOffer(@PathVariable Long id) {
        JobOffreDto response = new JobOffreDto();
        response.setStatusCode(501);
        response.setMessage("Fonctionnalité de favoris non encore implémentée");
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ===== ENDPOINTS POUR LES EMPLOYEURS =====

    /**
     * Créer une nouvelle offre d'emploi (EMPLOYEUR seulement)
     * POST /api/employer/job-offers
     */
    @PostMapping("/employer/job-offers")
    public ResponseEntity<JobOffreDto> createJobOffer(@RequestBody JobOffreDto jobOfferDto) {
        JobOffreDto response = jobOfferService.createJobOffer(jobOfferDto);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Mettre à jour une offre d'emploi (EMPLOYEUR propriétaire seulement)
     * PUT /api/employer/job-offers/{id}
     */
    @PutMapping("/employer/job-offers/{id}")
    public ResponseEntity<JobOffreDto> updateJobOffer(
            @PathVariable Long id,
            @RequestBody JobOffreDto jobOfferDto) {

        JobOffreDto response = jobOfferService.updateJobOffer(id, jobOfferDto);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Récupérer les offres d'emploi de l'employeur connecté
     * GET /api/employer/job-offers/my-offers
     */
    @GetMapping("/employer/job-offers/my-offers")
    public ResponseEntity<JobOffreDto> getMyJobOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobOffreDto response = jobOfferService.getMyJobOffers(page, size);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Supprimer une offre d'emploi (EMPLOYEUR propriétaire seulement)
     * DELETE /api/employer/job-offers/{id}
     */
    @DeleteMapping("/employer/job-offers/{id}")
    public ResponseEntity<JobOffreDto> deleteJobOffer(@PathVariable Long id) {
        JobOffreDto response = jobOfferService.deleteJobOffer(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // ===== ENDPOINTS POUR LES ADMINISTRATEURS =====

    /**
     * Récupérer toutes les offres d'emploi pour l'admin
     * GET /api/admin/job-offers
     */
    @GetMapping("/admin/job-offers")
    public ResponseEntity<JobOffreDto> getAllJobOffersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String statut) {

        // Si aucun statut spécifié, récupérer toutes les offres
        if (statut == null) {
            JobOffreDto response = jobOfferService.getAllActiveJobOffers(page, size);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }

        // Sinon, utiliser le service de recherche avec filtres
        JobOffreDto response = jobOfferService.searchJobOffersWithFilters(
                null, null, null, null, null, null, null, page, size);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Supprimer n'importe quelle offre d'emploi (ADMIN seulement)
     * DELETE /api/admin/job-offers/{id}
     */
    @DeleteMapping("/admin/job-offers/{id}")
    public ResponseEntity<JobOffreDto> adminDeleteJobOffer(@PathVariable Long id) {
        JobOffreDto response = jobOfferService.deleteJobOffer(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

  
}

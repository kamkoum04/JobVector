package com.example.jobvector.Repository;

import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Model.Utilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffre, Long> {

    // Recherche par employeur
    Page<JobOffre> findByEmployeur(Utilisateur employeur, Pageable pageable);
    List<JobOffre> findByEmployeurId(Long employeurId);

    // Recherche par statut
    Page<JobOffre> findByStatut(String statut, Pageable pageable);
    Page<JobOffre> findByStatutAndEmployeur(String statut, Utilisateur employeur, Pageable pageable);

    // Recherche par titre (like)
    Page<JobOffre> findByTitreContainingIgnoreCase(String titre, Pageable pageable);

    // Recherche par localisation
    Page<JobOffre> findByLocalisationContainingIgnoreCase(String localisation, Pageable pageable);

    // Recherche par entreprise
    Page<JobOffre> findByEntrepriseContainingIgnoreCase(String entreprise, Pageable pageable);

    // Recherche par secteur d'activité
    Page<JobOffre> findBySecteurActiviteContainingIgnoreCase(String secteurActivite, Pageable pageable);

    // Recherche par type de poste
    Page<JobOffre> findByTypePoste(JobOffre.TypePoste typePoste, Pageable pageable);

    // Recherche par modalité de travail
    Page<JobOffre> findByModaliteTravail(JobOffre.ModaliteTravail modaliteTravail, Pageable pageable);


    // Recherche par niveau d'études minimum
    Page<JobOffre> findByNiveauEtudeMin(JobOffre.NiveauEtude niveauEtudeMin, Pageable pageable);

    // Recherche par expérience
    Page<JobOffre> findByExperienceMinRequiseGreaterThanEqual(Integer experience, Pageable pageable);

    // Recherche par plage de salaire
    Page<JobOffre> findBySalaireGreaterThanEqual(Double salaire, Pageable pageable);
    Page<JobOffre> findBySalaireBetween(Double salaireMin, Double salaireMax, Pageable pageable);

    // Recherche par date
    Page<JobOffre> findByDatePublicationAfter(LocalDateTime date, Pageable pageable);

    // Recherche dans les compétences techniques
    Page<JobOffre> findByCompetencesTechniquesContainingIgnoreCase(String competences, Pageable pageable);

    // Recherche dans les compétences transversales
    Page<JobOffre> findByCompetencesTransversalesContainingIgnoreCase(String competences, Pageable pageable);

    // Recherche dans les outils/technologies
    Page<JobOffre> findByOutilsTechnologiesContainingIgnoreCase(String outils, Pageable pageable);

    // Recherche complexe avec plusieurs critères - Version corrigée pour PostgreSQL
    @Query(value = "SELECT * FROM job_offres j WHERE " +
           "(:titre IS NULL OR j.titre ILIKE CONCAT('%', :titre, '%')) AND " +
           "(:localisation IS NULL OR j.localisation ILIKE CONCAT('%', :localisation, '%')) AND " +
           "(:secteurActivite IS NULL OR j.secteur_activite ILIKE CONCAT('%', :secteurActivite, '%')) AND " +
           "(:typePoste IS NULL OR j.type_poste = CAST(:typePoste AS VARCHAR)) AND " +
           "(:modaliteTravail IS NULL OR j.modalite_travail = CAST(:modaliteTravail AS VARCHAR)) AND " +
           "(:experienceMin IS NULL OR j.experience_min_requise <= :experienceMin) AND " +
           "(:salaireMin IS NULL OR j.salaire >= :salaireMin) AND " +
           "(:statut IS NULL OR j.statut = :statut)",
           countQuery = "SELECT COUNT(*) FROM job_offres j WHERE " +
           "(:titre IS NULL OR j.titre ILIKE CONCAT('%', :titre, '%')) AND " +
           "(:localisation IS NULL OR j.localisation ILIKE CONCAT('%', :localisation, '%')) AND " +
           "(:secteurActivite IS NULL OR j.secteur_activite ILIKE CONCAT('%', :secteurActivite, '%')) AND " +
           "(:typePoste IS NULL OR j.type_poste = CAST(:typePoste AS VARCHAR)) AND " +
           "(:modaliteTravail IS NULL OR j.modalite_travail = CAST(:modaliteTravail AS VARCHAR)) AND " +
           "(:experienceMin IS NULL OR j.experience_min_requise <= :experienceMin) AND " +
           "(:salaireMin IS NULL OR j.salaire >= :salaireMin) AND " +
           "(:statut IS NULL OR j.statut = :statut)",
           nativeQuery = true)
    Page<JobOffre> findWithFilters(
            @Param("titre") String titre,
            @Param("localisation") String localisation,
            @Param("secteurActivite") String secteurActivite,
            @Param("typePoste") String typePoste,
            @Param("modaliteTravail") String modaliteTravail,
            @Param("experienceMin") Integer experienceMin,
            @Param("salaireMin") Double salaireMin,
            @Param("statut") String statut,
            Pageable pageable
    );

    // Recherche textuelle dans la description - Version native PostgreSQL
    @Query(value = "SELECT * FROM job_offres j WHERE " +
           "j.description ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.titre ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.competences_techniques ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.competences_transversales ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.outils_technologies ILIKE CONCAT('%', :keyword, '%')",
           countQuery = "SELECT COUNT(*) FROM job_offres j WHERE " +
           "j.description ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.titre ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.competences_techniques ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.competences_transversales ILIKE CONCAT('%', :keyword, '%') OR " +
           "j.outils_technologies ILIKE CONCAT('%', :keyword, '%')",
           nativeQuery = true)
    Page<JobOffre> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Compter les offres par employeur
    Long countByEmployeur(Utilisateur employeur);

    // Compter les offres par statut
    Long countByStatut(String statut);

    // Offres actives non expirées (dateExpiration removed)
    @Query("SELECT j FROM JobOffre j WHERE j.statut = 'ACTIVE'")
    Page<JobOffre> findActiveNonExpired(Pageable pageable);

    // Offres récentes (dernières 30 jours)
    @Query("SELECT j FROM JobOffre j WHERE j.datePublication >= :dateDebut ORDER BY j.datePublication DESC")
    Page<JobOffre> findRecentOffers(@Param("dateDebut") LocalDateTime dateDebut, Pageable pageable);
}

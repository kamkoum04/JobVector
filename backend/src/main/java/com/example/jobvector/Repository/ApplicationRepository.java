package com.example.jobvector.Repository;

import com.example.jobvector.Model.Application;
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
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Recherche par candidat
    Page<Application> findByCandidat(Utilisateur candidat, Pageable pageable);
    List<Application> findByCandidatId(Long candidatId);
    
    // Recherche par offre d'emploi
    Page<Application> findByJobOffre(JobOffre jobOffre, Pageable pageable);
    List<Application> findByJobOffreId(Long jobOffreId);
    
    // Recherche par statut
    Page<Application> findByStatut(Application.StatutCandidature statut, Pageable pageable);
    
    // Recherche par candidat et statut
    Page<Application> findByCandidatAndStatut(Utilisateur candidat, Application.StatutCandidature statut, Pageable pageable);
    
    // Recherche par offre et statut
    Page<Application> findByJobOffreAndStatut(JobOffre jobOffre, Application.StatutCandidature statut, Pageable pageable);
    
    // Vérifier si un candidat a déjà postulé pour une offre
    boolean existsByCandidatAndJobOffre(Utilisateur candidat, JobOffre jobOffre);
    Optional<Application> findByCandidatAndJobOffre(Utilisateur candidat, JobOffre jobOffre);
    
    // Recherche par employeur (via les offres d'emploi)
    @Query("SELECT a FROM Application a WHERE a.jobOffre.employeur = :employeur")
    Page<Application> findByEmployeur(@Param("employeur") Utilisateur employeur, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.jobOffre.employeur = :employeur AND a.statut = :statut")
    Page<Application> findByEmployeurAndStatut(@Param("employeur") Utilisateur employeur, 
                                              @Param("statut") Application.StatutCandidature statut, 
                                              Pageable pageable);
    
    // Candidatures récentes
    @Query("SELECT a FROM Application a WHERE a.dateCandidature >= :dateDebut ORDER BY a.dateCandidature DESC")
    Page<Application> findRecentApplications(@Param("dateDebut") LocalDateTime dateDebut, Pageable pageable);
    
    // Candidatures avec score ordonné par score décroissant
    @Query("SELECT a FROM Application a WHERE a.jobOffre = :jobOffre AND a.scoreGlobal IS NOT NULL ORDER BY a.scoreGlobal DESC")
    Page<Application> findByJobOffreOrderByScoreDesc(@Param("jobOffre") JobOffre jobOffre, Pageable pageable);
    
    // Statistiques pour un employeur
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobOffre.employeur = :employeur")
    Long countByEmployeur(@Param("employeur") Utilisateur employeur);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobOffre.employeur = :employeur AND a.statut = :statut")
    Long countByEmployeurAndStatut(@Param("employeur") Utilisateur employeur, 
                                   @Param("statut") Application.StatutCandidature statut);
    
    // Statistiques pour une offre d'emploi
    Long countByJobOffre(JobOffre jobOffre);
    Long countByJobOffreAndStatut(JobOffre jobOffre, Application.StatutCandidature statut);
    
    // Statistiques pour un candidat
    Long countByCandidat(Utilisateur candidat);
    Long countByCandidatAndStatut(Utilisateur candidat, Application.StatutCandidature statut);
    
    // Recherche par période
    @Query("SELECT a FROM Application a WHERE a.dateCandidature BETWEEN :dateDebut AND :dateFin")
    Page<Application> findByDateCandidatureBetween(@Param("dateDebut") LocalDateTime dateDebut, 
                                                   @Param("dateFin") LocalDateTime dateFin, 
                                                   Pageable pageable);
    
    // Candidatures d'un candidat pour un employeur spécifique
    @Query("SELECT a FROM Application a WHERE a.candidat = :candidat AND a.jobOffre.employeur = :employeur")
    Page<Application> findByCandidatAndEmployeur(@Param("candidat") Utilisateur candidat,
                                                @Param("employeur") Utilisateur employeur,
                                                Pageable pageable);
    
    // Recherche avec scores minimum
    @Query("SELECT a FROM Application a WHERE a.jobOffre = :jobOffre AND a.scoreGlobal >= :scoreMin ORDER BY a.scoreGlobal DESC")
    Page<Application> findByJobOffreAndScoreGlobalGreaterThanEqual(@Param("jobOffre") JobOffre jobOffre,
                                                                  @Param("scoreMin") Double scoreMin,
                                                                  Pageable pageable);
    
    // Candidatures à traiter en priorité (score élevé et statut EN_ATTENTE)
    @Query("SELECT a FROM Application a WHERE a.jobOffre = :jobOffre AND a.statut = 'EN_ATTENTE' " +
           "AND a.scoreGlobal IS NOT NULL ORDER BY a.scoreGlobal DESC")
    Page<Application> findPriorityApplications(@Param("jobOffre") JobOffre jobOffre, Pageable pageable);
    
    // Recherche par mots-clés dans les commentaires
    @Query("SELECT a FROM Application a WHERE a.jobOffre.employeur = :employeur AND " +
           "(a.commentaireEmployeur ILIKE CONCAT('%', :keyword, '%') OR " +
           "a.commentairePublic ILIKE CONCAT('%', :keyword, '%'))")
    Page<Application> findByEmployeurAndCommentaireContaining(@Param("employeur") Utilisateur employeur,
                                                             @Param("keyword") String keyword,
                                                             Pageable pageable);
    
    // Candidatures avec lettre de motivation
    @Query("SELECT a FROM Application a WHERE a.jobOffre = :jobOffre AND a.lettreMotivation IS NOT NULL")
    Page<Application> findByJobOffreWithLettreMotivation(@Param("jobOffre") JobOffre jobOffre, Pageable pageable);
    
    // Dernier score global moyen pour une offre
    @Query("SELECT AVG(a.scoreGlobal) FROM Application a WHERE a.jobOffre = :jobOffre AND a.scoreGlobal IS NOT NULL")
    Double findAverageScoreByJobOffre(@Param("jobOffre") JobOffre jobOffre);
    
    // Meilleur score pour une offre
    @Query("SELECT MAX(a.scoreGlobal) FROM Application a WHERE a.jobOffre = :jobOffre")
    Double findMaxScoreByJobOffre(@Param("jobOffre") JobOffre jobOffre);
}

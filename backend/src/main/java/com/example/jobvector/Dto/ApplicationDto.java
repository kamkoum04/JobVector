package com.example.jobvector.Dto;

import com.example.jobvector.Model.Application;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@EqualsAndHashCode(callSuper = true)
public class ApplicationDto extends BaseResponseDto {
    
    private Long id;
    
    // Informations du candidat
    private Long candidatId;
    private String candidatNom;
    private String candidatPrenom;
    private String candidatEmail;
    
    // Informations de l'offre d'emploi
    private Long jobOffreId;
    private String jobOffreTitre;
    private String jobOffreEntreprise;
    private String jobOffreLocalisation;
    
    // Statut et dates
    private Application.StatutCandidature statut;
    private LocalDateTime dateCandidature;
    private LocalDateTime dateModification;
    
    // Lettre de motivation
    private String lettreMotivation;
    
    // Chemin du CV (pour téléchargement)
    private String cvFilePath;
    
    // Scores de matching (visibles uniquement par l'employeur)
    private Double scoreGlobal;
    private Double scoreCompetencesTechniques;
    private Double scoreCompetencesTransversales;
    private Double scoreExperience;
    private Double scoreFormation;
    
    // Commentaires
    private String commentaireEmployeur; // Visible uniquement par l'employeur
    private String commentairePublic;    // Visible par le candidat
    
    // Données du CV au moment de la candidature
    private String cvDataSnapshot;
    
    // Métadonnées
    private String metadata;
    
    // Pour les réponses de liste
    private List<ApplicationDto> applications;
    
    // Pagination
    private Integer page;
    private Integer size;
    private Long totalElements;
    private Integer totalPages;
    
    // Statistiques (pour employeur)
    private Long totalCandidatures;
    private Long candidaturesEnAttente;
    private Long candidaturesPreselectionnes;
    private Long candidaturesAcceptees;
    private Long candidaturesRefusees;
    
    // Informations additionnelles pour le candidat
    private Boolean cvUploadRequired; // Indique si le candidat doit uploader un CV
    private Boolean dejaCandidate;    // Indique si le candidat a déjà postulé
    
    // Rang du candidat (pour l'employeur)
    private Integer rang;
    
    // Données structurées du CV (pour affichage)
    private CvDto cvData;
    
    // Constructeur par défaut
    public ApplicationDto() {
        super();
    }
    
    // Méthodes utilitaires
    public String getStatutDescription() {
        return statut != null ? statut.getDescription() : null;
    }
    
    public boolean isScoreVisible() {
        return scoreGlobal != null;
    }
    
    public boolean hasLettreMotivation() {
        return lettreMotivation != null && !lettreMotivation.trim().isEmpty();
    }
}

package com.example.jobvector.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"candidat_id", "job_offre_id"})
})
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Relation avec le candidat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id", nullable = false)
    private Utilisateur candidat;
    
    // Relation avec l'offre d'emploi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offre_id", nullable = false)
    private JobOffre jobOffre;
    
    // Statut de la candidature
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;
    
    // Date de candidature
    @Column(name = "date_candidature", nullable = false)
    private LocalDateTime dateCandidature;
    
    // Lettre de motivation (optionnelle)
    @Column(name = "lettre_motivation", columnDefinition = "TEXT")
    private String lettreMotivation;
    
    // Chemin vers la copie du CV au moment de la candidature
    @Column(name = "cv_file_path", nullable = true)
    private String cvFilePath;
    
    // Données du CV au moment de la candidature (JSON ou sérialisé)
    @Column(name = "cv_data_snapshot", columnDefinition = "TEXT")
    private String cvDataSnapshot;
    
    // Scores de matching (invisibles pour le candidat)
    @Column(name = "score_global")
    private Double scoreGlobal;
    
    @Column(name = "score_competences_techniques")
    private Double scoreCompetencesTechniques;
    
    @Column(name = "score_competences_transversales")
    private Double scoreCompetencesTransversales;
    
    @Column(name = "score_experience")
    private Double scoreExperience;
    
    @Column(name = "score_formation")
    private Double scoreFormation;
    
    // Commentaires de l'employeur
    @Column(name = "commentaire_employeur", columnDefinition = "TEXT")
    private String commentaireEmployeur;
    
    // Commentaires visibles par le candidat
    @Column(name = "commentaire_public", columnDefinition = "TEXT")
    private String commentairePublic;
    
    // Date de dernière modification du statut
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
    
    // Embedding vectoriel du CV au moment de la candidature
    @Column(name = "cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;
    
    // Métadonnées additionnelles
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    // Énumération des statuts de candidature
    public enum StatutCandidature {
        EN_ATTENTE("En attente de traitement"),
        VUE("Vue par l'employeur"),
        PRESELECTIONNE("Présélectionné"),
        ENTRETIEN("Convoqué en entretien"),
        ACCEPTE("Candidature acceptée"),
        REFUSE("Candidature refusée"),
        RETIREE("Candidature retirée par le candidat");
        
        private final String description;
        
        StatutCandidature(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // Callbacks JPA
    @PrePersist
    protected void onCreate() {
        dateCandidature = LocalDateTime.now();
        dateModification = LocalDateTime.now();
        if (statut == null) {
            statut = StatutCandidature.EN_ATTENTE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}

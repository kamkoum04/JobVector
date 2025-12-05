package com.example.jobvector.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "cvs")
public class Cv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "chemin_fichier", nullable = false)
    private String fichierPath;
    
    @Column(name = "taille_fichier")
    private Long tailleFichier;
    
    @Column(name = "texte_extrait", columnDefinition = "TEXT")
    private String texteExtrait;
    
    @Column(name = "nom")
    private String nom;
    
    @Column(name = "prenom")
    private String prenom;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "telephone")
    private String telephone;
    
    @Column(name = "adresse")
    private String adresse;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "competences_techniques", columnDefinition = "TEXT")
    private String competencesTechniques;
    
    @Column(name = "competences_transversales", columnDefinition = "TEXT")
    private String competencesTransversales;
    
    @Column(name = "experience_annees")
    private Integer experienceAnnees;
    
    @Column(name = "niveau_etude")
    private String niveauEtude;
    
    @Column(name = "langues")
    private String langues;
    
    @Column(name = "formations", columnDefinition = "TEXT")
    private String formations;
    
    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;
    
    @Column(name = "projets", columnDefinition = "TEXT")
    private String projets;
    
    @Column(name = "points_forts", columnDefinition = "TEXT")
    private String pointsForts;

    @Column(name = "resume_professionnel", columnDefinition = "TEXT")
    private String resumeProfessionnel;
    
    @Column(name = "mots_cles_generes", columnDefinition = "TEXT")
    private String motsClesGeneres;
    
    // Embedding vectoriel pour le matching
    @Column(name = "embedding", columnDefinition = "TEXT")
    private String embedding;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id", referencedColumnName = "id")
    @JsonIgnore
    private Utilisateur utilisateur;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processing_job_id", referencedColumnName = "id")
    @JsonIgnore
    private CvProcessingJob processingJob;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
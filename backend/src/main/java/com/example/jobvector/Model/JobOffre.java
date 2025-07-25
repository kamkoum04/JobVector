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
@Table(name = "job_offres")
public class JobOffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String localisation;

    private LocalDateTime datePublication;

    // Relation avec l'employeur (User qui a créé l'offre)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id", nullable = false)
    private Utilisateur employeur;

    // === CHAMPS ESSENTIELS POUR LE MATCHING VECTORIEL ===

    // Compétences techniques requises (pour matching précis)
    @Column(columnDefinition = "TEXT")
    private String competencesTechniques; // "Java, Spring Boot, PostgreSQL, Docker"

    // Compétences transversales (soft skills)
    @Column(columnDefinition = "TEXT")
    private String competencesTransversales; // "Leadership, Communication, Travail d'équipe"

    // Niveau d'expérience requis (pour filtrage)
    private Integer experienceMinRequise; // En années

    // Niveau d'études requis
    @Enumerated(EnumType.STRING)
    private NiveauEtude niveauEtudeMin;

    // Langues requises pour le poste
    @Column(columnDefinition = "TEXT")
    private String languesRequises; // "Français (natif), Anglais (courant)"

    // Secteur d'activité de l'entreprise (pour matching sectoriel)
    private String secteurActivite; // "IT", "Finance", "Santé", "Education"

    // Mission principale du poste (pour contexte)
    @Column(columnDefinition = "TEXT")
    private String missionPrincipale;

    // Responsabilités clés (important pour le matching)
    @Column(columnDefinition = "TEXT")
    private String responsabilites;

    // Outils/Technologies utilisés (très important pour dev)
    @Column(columnDefinition = "TEXT")
    private String outilsTechnologies; // "IntelliJ IDEA, Git, Jenkins, AWS"

    // Type de poste (pour filtrage)
    @Enumerated(EnumType.STRING)
    private TypePoste typePoste;

    // Modalités de travail (important post-COVID)
    @Enumerated(EnumType.STRING)
    private ModaliteTravail modaliteTravail;

    // === CHAMPS POUR SCORING AVANCÉ ===



    // Champ pour l'embedding vectoriel (pgvector) - Activé pour le matching
    @Column(name = "embedding", columnDefinition = "TEXT")
    private String embedding;

    // === CHAMPS EXISTANTS ===
    private String entreprise;
    private String typeContrat; // CDI, CDD, STAGE, etc.
    private Double salaire;
    private Integer experience; // En années
    // ...existing code...

    @Column(nullable = false)
    private String statut = "ACTIVE"; // ACTIVE, FERMEE, EXPIREE

    // === ENUMS POUR LE MATCHING ===

    public enum NiveauEtude {
        AUCUN, BAC, BAC_PLUS_2, BAC_PLUS_3, BAC_PLUS_5, DOCTORAT
    }

    public enum TypePoste {
        TECHNIQUE, MANAGEMENT, COMMERCIAL, RH, FINANCE, MARKETING, SUPPORT
    }

    public enum ModaliteTravail {
        PRESENTIEL, REMOTE, HYBRIDE
    }

    public enum NiveauSeniorite {
        JUNIOR, CONFIRME, SENIOR, EXPERT, LEAD
    }

    // Constructeur pour création
    @PrePersist
    public void prePersist() {
        if (datePublication == null) {
            datePublication = LocalDateTime.now();
        }
    }
}

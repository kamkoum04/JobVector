package com.example.jobvector.Dto;

import com.example.jobvector.Model.JobOffre;
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
public class JobOffreDto extends BaseResponseDto {

    // Champs de base
    private Long id;
    private String titre;
    private String description;
    private String localisation;
    private LocalDateTime datePublication;
    private String statut;

    // === NOUVEAUX CHAMPS POUR LE MATCHING ===

    // Compétences détaillées
    private String competencesTechniques;
    private String competencesTransversales;
    private String outilsTechnologies;

    // Critères d'expérience et formation
    private Integer experienceMinRequise;
    private JobOffre.NiveauEtude niveauEtudeMin;
    private String languesRequises;

    // Contexte métier
    private String secteurActivite;
    private String missionPrincipale;
    private String responsabilites;
    private JobOffre.TypePoste typePoste;
    private JobOffre.ModaliteTravail modaliteTravail;
    // ...existing code...

    // === CHAMPS EXISTANTS ===
    private String entreprise;
    private String typeContrat;
    private Double salaire;
    private Integer experience; // Gardé pour compatibilité

    // Informations de l'employeur
    private Long employeurId;
    private String employeurNom;
    private String employeurPrenom;
    private String employeurEmail;

    // Champ embedding (optionnel dans le DTO)
    private String embedding;

    // Pour les réponses de liste
    private List<JobOffreDto> jobOffers;

    // Pagination
    private Integer page;
    private Integer size;
    private Long totalElements;
}

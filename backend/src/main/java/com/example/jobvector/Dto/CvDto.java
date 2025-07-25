package com.example.jobvector.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CvDto extends BaseResponseDto {
    private Long id;
    private String fichierPath;
    private String texteExtrait;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private String linkedinUrl;
    private String competencesTechniques;
    private String competencesTransversales;
    private Integer experienceAnnees;
    private String niveauEtude;
    private String langues;
    private String formations;
    private String certifications;
    private String projets;
    private String pointsForts;
    private String resumeProfessionnel;
    private String motsClesGeneres;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Long utilisateurId;
    
    // Champs pour les informations d'embedding
    private Boolean embeddingGenerated;
    private Integer embeddingSize;
    
    // Custom setter to handle both String and Array from AI response
    @JsonSetter("motsClesGeneres")
    public void setMotsClesGeneres(Object motsClesGeneres) {
        if (motsClesGeneres instanceof String) {
            this.motsClesGeneres = (String) motsClesGeneres;
        } else if (motsClesGeneres instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> keywords = (List<String>) motsClesGeneres;
            this.motsClesGeneres = String.join(", ", keywords);
        } else if (motsClesGeneres != null) {
            this.motsClesGeneres = motsClesGeneres.toString();
        } else {
            this.motsClesGeneres = null;
        }
    }
}
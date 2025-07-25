package com.example.jobvector.Service;

import com.example.jobvector.Model.JobOffre;
import com.example.jobvector.Model.Cv;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service pour calculer les scores de matching entre CV et offres d'emploi
 * Utilise la similarité cosinus entre les embeddings vectoriels
 */
@Service
public class MatchingService {
    
    private static final Logger logger = LoggerFactory.getLogger(MatchingService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private PythonEmbeddingService pythonEmbeddingService;
    
    /**
     * Calculer les scores de matching entre un CV et une offre d'emploi
     * VERSION AMÉLIORÉE avec pondération intelligente
     * 
     * @param cvEmbedding L'embedding du CV (format JSON)
     * @param jobOffer L'offre d'emploi
     * @param cv L'objet CV complet pour accéder aux données originales
     * @return Map contenant les différents scores de matching
     */
    public Map<String, Double> calculateMatchingScores(String cvEmbedding, JobOffre jobOffer, Cv cv) {
        Map<String, Double> scores = new HashMap<>();
        
        try {
            // Vérifier que l'embedding du CV est valide
            if (cvEmbedding == null || cvEmbedding.isEmpty()) {
                logger.warn("Embedding du CV manquant - attribution de scores par défaut");
                return getDefaultScores();
            }
            
            // Générer l'embedding de l'offre d'emploi
            String jobOfferEmbedding = pythonEmbeddingService.generateJobOfferEmbedding(jobOffer);
            
            if (jobOfferEmbedding == null || jobOfferEmbedding.isEmpty()) {
                logger.warn("Impossible de générer l'embedding pour l'offre ID: {} - scores par défaut", jobOffer.getId());
                return getDefaultScores();
            }
            
            // Calculer les scores spécifiques par domaine AVANT le score global
            // FIXE CRITIQUE: Utiliser les données du CV au lieu du texte générique
            double techScore = calculateTechnicalSkillsScore(cv, jobOffer);
            double expScore = calculateExperienceScore(cv, jobOffer);
            double langScore = calculateLanguageScore(cv, jobOffer);
            double softScore = calculateSoftSkillsScore(cv, jobOffer);
            double eduScore = calculateEducationScore(cv, jobOffer);
            
            // NOUVEAU: Calcul du score global pondéré (formule métier)
            double weightedGlobalScore = calculateWeightedGlobalScore(techScore, expScore, langScore, softScore, eduScore);
            
            // Calculer aussi la similarité cosinus traditionnelle pour comparaison
            double cosineSimilarity = calculateCosineSimilarity(cvEmbedding, jobOfferEmbedding);
            
            // Utiliser le score pondéré comme score global principal
            scores.put("global", weightedGlobalScore);
            scores.put("cosineBaseline", cosineSimilarity); // Pour analyse comparative
            scores.put("competencesTechniques", techScore);
            scores.put("competencesTransversales", softScore);
            scores.put("experience", expScore);
            scores.put("formation", eduScore);
            scores.put("langues", langScore); // NOUVEAU
            
            logger.info("Scores de matching calculés pour l'offre ID: {} - Score global pondéré: {:.3f} (cosine: {:.3f})", 
                       jobOffer.getId(), weightedGlobalScore, cosineSimilarity);
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul des scores de matching pour l'offre ID: {}: {}", 
                        jobOffer.getId(), e.getMessage());
            scores = getDefaultScores();
        }
        
        return scores;
    }
    
    /**
     * NOUVEAU: Calcul du score global avec pondération métier
     * Formule: 40% tech + 20% exp + 20% langues + 10% soft + 10% formation
     */
    private double calculateWeightedGlobalScore(double techScore, double expScore, double langScore, 
                                              double softScore, double eduScore) {
        double weightedScore = (techScore * 0.4) +      // 40% - Compétences techniques
                              (expScore * 0.2) +        // 20% - Expérience
                              (langScore * 0.2) +       // 20% - Langues  
                              (softScore * 0.1) +       // 10% - Compétences transversales
                              (eduScore * 0.1);         // 10% - Formation
        
        // Assurer que le score reste dans [0, 1]
        return Math.max(0.0, Math.min(1.0, weightedScore));
    }
    
    /**
     * NOUVEAU: Calcul du score des langues - VERSION AMÉLIORÉE
     * Évalue la correspondance des compétences linguistiques
     */
    private double calculateLanguageScore(Cv cv, JobOffre jobOffer) {
        try {
            if (jobOffer.getLanguesRequises() == null || jobOffer.getLanguesRequises().isEmpty()) {
                return 0.8; // Score par défaut si pas de langues spécifiées
            }
            
            String requiredLanguages = jobOffer.getLanguesRequises().toLowerCase();
            String cvText = pythonEmbeddingService.buildCvText(cv).toLowerCase();
            
            logger.debug("Évaluation langues: requis='{}', CV analysé", requiredLanguages);
            
            int totalRequiredLanguages = 0;
            int matchedLanguages = 0;
            
            // ANALYSER CHAQUE LANGUE REQUISE
            
            // Français
            if (requiredLanguages.contains("français") || requiredLanguages.contains("french")) {
                totalRequiredLanguages++;
                if (cvText.contains("français") || cvText.contains("french") || 
                    cvText.contains("native") || cvText.contains("natif")) {
                    matchedLanguages++;
                }
            }
            
            // Anglais
            if (requiredLanguages.contains("anglais") || requiredLanguages.contains("english")) {
                totalRequiredLanguages++;
                if (cvText.contains("anglais") || cvText.contains("english") || 
                    cvText.contains("b2") || cvText.contains("fluent") || 
                    cvText.contains("courant")) {
                    matchedLanguages++;
                }
            }
            
            // Arabe
            if (requiredLanguages.contains("arabe") || requiredLanguages.contains("arabic")) {
                totalRequiredLanguages++;
                if (cvText.contains("arabe") || cvText.contains("arabic") || 
                    cvText.contains("tunisia") || cvText.contains("tunisie")) {
                    matchedLanguages++;
                }
            }
            
            // CALCUL DU SCORE FINAL
            
            if (totalRequiredLanguages == 0) {
                return 0.8; // Pas de langues spécifiées
            }
            
            // Score de base proportionnel
            double baseScore = (double) matchedLanguages / totalRequiredLanguages;
            
            // Bonus pour multilinguisme
            if (matchedLanguages >= 2) {
                baseScore += 0.1; // Bonus multilinguisme
            }
            
            // Bonus pour niveaux spécifiés
            if (cvText.contains("b2") || cvText.contains("c1") || 
                cvText.contains("fluent") || cvText.contains("native")) {
                baseScore += 0.1; // Bonus niveau certifié
            }
            
            double finalScore = Math.max(0.0, Math.min(1.0, baseScore));
            
            logger.debug("Score langues final: {:.3f} ({}/{} langues trouvées)", 
                        finalScore, matchedLanguages, totalRequiredLanguages);
            
            return finalScore;
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du score des langues: {}", e.getMessage());
            return 0.7; // Score par défaut en cas d'erreur
        }
    }
    
    /**
     * Calculer la similarité cosinus entre deux embeddings
     */
    private double calculateCosineSimilarity(String embedding1, String embedding2) {
        try {
            // Parser les embeddings JSON
            double[] vector1 = parseEmbeddingJson(embedding1);
            double[] vector2 = parseEmbeddingJson(embedding2);
            
            if (vector1.length != vector2.length) {
                logger.warn("Dimensions des embeddings différentes: {} vs {}", vector1.length, vector2.length);
                return 0.5;
            }
            
            // Calculer la similarité cosinus
            double dotProduct = 0.0;
            double norm1 = 0.0;
            double norm2 = 0.0;
            
            for (int i = 0; i < vector1.length; i++) {
                dotProduct += vector1[i] * vector2[i];
                norm1 += vector1[i] * vector1[i];
                norm2 += vector2[i] * vector2[i];
            }
            
            norm1 = Math.sqrt(norm1);
            norm2 = Math.sqrt(norm2);
            
            if (norm1 == 0.0 || norm2 == 0.0) {
                return 0.0;
            }
            
            double similarity = dotProduct / (norm1 * norm2);
            
            // Normaliser le score entre 0 et 1
            return Math.max(0.0, Math.min(1.0, (similarity + 1.0) / 2.0));
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul de similarité cosinus: {}", e.getMessage());
            return 0.5;
        }
    }
    
    /**
     * Calculer le score pour les compétences techniques
     */
    private double calculateTechnicalSkillsScore(Cv cv, JobOffre jobOffer) {
        try {
            if (jobOffer.getCompetencesTechniques() == null || jobOffer.getCompetencesTechniques().isEmpty()) {
                return 0.7; // Score par défaut si pas de compétences techniques spécifiées
            }
            
            // Utiliser le service Python pour calculer la similarité
            String cvText = pythonEmbeddingService.buildCvText(cv);
            double similarity = pythonEmbeddingService.calculateSimilarity(cvText, jobOffer.getCompetencesTechniques());
            
            return Math.max(0.0, Math.min(1.0, similarity));
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du score technique: {}", e.getMessage());
            return 0.6;
        }
    }
    
    /**
     * Calculer le score pour les compétences transversales
     */
    private double calculateSoftSkillsScore(Cv cv, JobOffre jobOffer) {
        try {
            if (jobOffer.getCompetencesTransversales() == null || jobOffer.getCompetencesTransversales().isEmpty()) {
                return 0.7; // Score par défaut
            }
            
            String cvText = pythonEmbeddingService.buildCvText(cv);
            double similarity = pythonEmbeddingService.calculateSimilarity(cvText, jobOffer.getCompetencesTransversales());
            
            return Math.max(0.0, Math.min(1.0, similarity));
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du score soft skills: {}", e.getMessage());
            return 0.6;
        }
    }
    
    /**
     * Calculer le score d'expérience - VERSION AMÉLIORÉE
     * Utilise une formule intelligente basée sur l'écart d'expérience
     */
    private double calculateExperienceScore(Cv cv, JobOffre jobOffer) {
        try {
            int requiredExperience = jobOffer.getExperienceMinRequise() != null ? jobOffer.getExperienceMinRequise() : 0;
            int candidateExperience = cv.getExperienceAnnees() != null ? cv.getExperienceAnnees() : 0;
            
            logger.debug("Calcul expérience: candidat={} ans, requis={} ans", candidateExperience, requiredExperience);
            
            // NOUVELLE FORMULE INTELLIGENTE
            double baseScore;
            
            if (candidateExperience >= requiredExperience) {
                // Candidat qualifié ou surqualifié
                if (candidateExperience == requiredExperience) {
                    baseScore = 1.0; // Score parfait pour correspondance exacte
                } else if (candidateExperience <= requiredExperience + 2) {
                    baseScore = 0.95; // Légèrement surqualifié = excellent
                } else if (candidateExperience <= requiredExperience + 5) {
                    baseScore = 0.85; // Surqualifié mais acceptable
                } else {
                    baseScore = 0.75; // Très surqualifié = risque de départ
                }
            } else {
                // Candidat sous-qualifié
                int gap = requiredExperience - candidateExperience;
                
                if (gap == 1) {
                    baseScore = 0.8; // 1 an de moins = encore acceptable
                } else if (gap == 2) {
                    baseScore = 0.6; // 2 ans de moins = limite
                } else if (gap <= 3) {
                    baseScore = 0.4; // 3 ans de moins = faible
                } else {
                    baseScore = 0.2; // Plus de 3 ans de moins = très faible
                }
            }
            
            // BONUS CONTEXTUELS
            
            // Bonus pour postes débutants
            if (requiredExperience <= 1) {
                baseScore = Math.max(0.85, baseScore); // Bonus pour postes junior
            }
            
            // Bonus pour profils étudiants avec projets
            String cvText = pythonEmbeddingService.buildCvText(cv);
            if (candidateExperience <= 2 && cvText.toLowerCase().contains("projet")) {
                baseScore += 0.1; // Bonus projets pour jeunes diplômés
            }
            
            // Malus pour postes seniors avec candidats très juniors
            if (requiredExperience >= 4 && candidateExperience <= 1) {
                baseScore *= 0.7; // Pénalité pour écart trop important
            }
            
            double finalScore = Math.max(0.0, Math.min(1.0, baseScore));
            
            logger.debug("Score expérience final: {:.3f} (base={:.3f})", finalScore, baseScore);
            
            return finalScore;
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du score d'expérience: {}", e.getMessage());
            return 0.6;
        }
    }
    
    /**
     * Calculer le score de formation - VERSION AMÉLIORÉE
     * Évalue la correspondance du niveau d'étude avec une logique métier
     */
    private double calculateEducationScore(Cv cv, JobOffre jobOffer) {
        try {
            if (jobOffer.getNiveauEtudeMin() == null) {
                return 0.8; // Score par défaut si pas de niveau requis
            }
            
            String requiredLevel = jobOffer.getNiveauEtudeMin().toString();
            String cvText = pythonEmbeddingService.buildCvText(cv);
            
            logger.debug("Évaluation formation: requis={}, CV contient formations", requiredLevel);
            
            // LOGIQUE DE CORRESPONDANCE PAR NIVEAU
            double baseScore = 0.5; // Score de base
            
            switch (requiredLevel) {
                case "BAC_PLUS_5":
                    if (cvText.contains("Engineering degree") || cvText.contains("Master") || 
                        cvText.contains("Ingénierie") || cvText.contains("BAC+5")) {
                        baseScore = 1.0; // Correspondance parfaite
                    } else if (cvText.contains("Bachelor") || cvText.contains("Licence") || 
                              cvText.contains("BAC+3")) {
                        baseScore = 0.7; // Sous-qualifié mais acceptable
                    } else if (cvText.contains("DUT") || cvText.contains("BTS") || 
                              cvText.contains("BAC+2")) {
                        baseScore = 0.4; // Très sous-qualifié
                    } else {
                        baseScore = 0.3; // Pas de formation identifiée
                    }
                    break;
                    
                case "BAC_PLUS_3":
                    if (cvText.contains("Bachelor") || cvText.contains("Licence") || 
                        cvText.contains("BAC+3")) {
                        baseScore = 1.0; // Correspondance parfaite
                    } else if (cvText.contains("Engineering") || cvText.contains("Master") || 
                              cvText.contains("Ingénierie") || cvText.contains("BAC+5")) {
                        baseScore = 0.95; // Surqualifié = excellent
                    } else if (cvText.contains("DUT") || cvText.contains("BTS") || 
                              cvText.contains("BAC+2")) {
                        baseScore = 0.6; // Sous-qualifié
                    } else {
                        baseScore = 0.3;
                    }
                    break;
                    
                case "BAC_PLUS_2":
                    if (cvText.contains("DUT") || cvText.contains("BTS") || 
                        cvText.contains("BAC+2")) {
                        baseScore = 1.0; // Correspondance parfaite
                    } else if (cvText.contains("Bachelor") || cvText.contains("Licence") || 
                              cvText.contains("Engineering") || cvText.contains("Master")) {
                        baseScore = 0.9; // Surqualifié = bien
                    } else {
                        baseScore = 0.4;
                    }
                    break;
                    
                default:
                    // Utiliser la similarité textuelle comme fallback
                    baseScore = pythonEmbeddingService.calculateSimilarity(cvText, "Education " + requiredLevel);
                    break;
            }
            
            // BONUS POUR DOMAINES SPÉCIALISÉS
            
            // Bonus pour informatique/ingénierie
            if (cvText.toLowerCase().contains("computer science") || 
                cvText.toLowerCase().contains("informatique") ||
                cvText.toLowerCase().contains("ingénierie logicielle")) {
                baseScore += 0.1; // Bonus spécialisation
            }
            
            // Bonus pour écoles reconnues
            if (cvText.contains("National School") || 
                cvText.contains("Tek-Up") ||
                cvText.contains("Institut Supérieur")) {
                baseScore += 0.05; // Bonus établissement
            }
            
            double finalScore = Math.max(0.0, Math.min(1.0, baseScore));
            
            logger.debug("Score formation final: {:.3f} (requis={}, détecté dans CV)", 
                        finalScore, requiredLevel);
            
            return finalScore;
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du score de formation: {}", e.getMessage());
            return 0.7;
        }
    }
    
    /**
     * Parser un embedding JSON en tableau de doubles
     */
    private double[] parseEmbeddingJson(String embeddingJson) throws Exception {
        if (embeddingJson == null || embeddingJson.trim().isEmpty()) {
            throw new IllegalArgumentException("L'embedding JSON ne peut pas être vide");
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(embeddingJson);
            
            if (!jsonNode.isArray()) {
                throw new IllegalArgumentException("L'embedding doit être un tableau JSON");
            }
            
            double[] vector = new double[jsonNode.size()];
            for (int i = 0; i < jsonNode.size(); i++) {
                JsonNode element = jsonNode.get(i);
                if (element.isNumber()) {
                    vector[i] = element.asDouble();
                } else {
                    logger.warn("Élément non numérique dans l'embedding à l'index {}: {}", i, element.toString());
                    vector[i] = 0.0; // Valeur par défaut
                }
            }
            
            return vector;
            
        } catch (Exception e) {
            logger.error("Erreur lors du parsing de l'embedding JSON: {}", e.getMessage());
            logger.debug("JSON problématique (premiers 100 caractères): {}", 
                        embeddingJson.substring(0, Math.min(100, embeddingJson.length())));
            throw new Exception("Impossible de parser l'embedding JSON: " + e.getMessage());
        }
    }
    
    /**
     * Retourner des scores par défaut en cas d'erreur - VERSION MISE À JOUR
     */
    private Map<String, Double> getDefaultScores() {
        Map<String, Double> defaultScores = new HashMap<>();
        defaultScores.put("global", 0.6);
        defaultScores.put("cosineBaseline", 0.6);
        defaultScores.put("competencesTechniques", 0.6);
        defaultScores.put("competencesTransversales", 0.6);
        defaultScores.put("experience", 0.6);
        defaultScores.put("formation", 0.7);
        defaultScores.put("langues", 0.7); // NOUVEAU
        return defaultScores;
    }
    
    /**
     * Vérifier si le service de matching est opérationnel
     */
    public boolean isServiceHealthy() {
        try {
            return pythonEmbeddingService.isServiceHealthy();
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification du service de matching: {}", e.getMessage());
            return false;
        }
    }
}

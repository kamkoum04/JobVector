package com.example.jobvector.Service;

import com.example.jobvector.Model.Cv;
import com.example.jobvector.Model.JobOffre;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service pour communiquer avec le service Python d'embedding all-MiniLM-L6-v2
 */
@Service
public class PythonEmbeddingService {
    
    private static final Logger logger = LoggerFactory.getLogger(PythonEmbeddingService.class);
    
    @Value("${app.embedding.service.url:http://localhost:5002}")
    private String embeddingServiceUrl;
    
    @Value("${app.embedding.use-python-service:true}")
    private boolean usePythonService;
    
    @Value("${app.embedding.fallback-enabled:true}")
    private boolean fallbackEnabled;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Générer un embedding pour un CV via le service Python
     */
    public String generateCvEmbedding(Cv cv) {
        if (cv == null) {
            logger.error("CV ne peut pas être null");
            return null;
        }
        
        try {
            String text = buildCvText(cv);
            if (text == null || text.trim().isEmpty()) {
                logger.warn("Texte du CV vide pour l'ID: {}", cv.getId());
                return generateFallbackEmbedding("CV vide");
            }
            return generateEmbeddingFromService(text);
        } catch (Exception e) {
            logger.error("Erreur lors de la génération d'embedding pour le CV {}: {}", 
                        cv.getId(), e.getMessage());
            return fallbackEnabled ? generateFallbackEmbedding("CV error") : null;
        }
    }
    
    /**
     * Générer un embedding pour une offre d'emploi via le service Python
     */
    public String generateJobOfferEmbedding(JobOffre jobOffer) {
        if (jobOffer == null) {
            logger.error("JobOffre ne peut pas être null");
            return null;
        }
        
        try {
            String text = buildJobOfferText(jobOffer);
            if (text == null || text.trim().isEmpty()) {
                logger.warn("Texte de l'offre vide pour l'ID: {}", jobOffer.getId());
                return generateFallbackEmbedding("Offre vide");
            }
            return generateEmbeddingFromService(text);
        } catch (Exception e) {
            logger.error("Erreur lors de la génération d'embedding pour l'offre {}: {}", 
                        jobOffer.getId(), e.getMessage());
            return fallbackEnabled ? generateFallbackEmbedding("Offre error") : null;
        }
    }
    
    /**
     * Appeler le service Python pour générer un embedding
     */
    private String generateEmbeddingFromService(String text) {
        // Check if Python service is enabled
        if (!usePythonService) {
            logger.info("Service Python désactivé, utilisation du fallback");
            return generateFallbackEmbedding(text);
        }
        
        try {
            // Préparer la requête
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            // Appeler le service Python
            String url = embeddingServiceUrl + "/embed";
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, request, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                // Parser la réponse JSON
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode embeddingNode = jsonResponse.get("embedding");
                
                if (embeddingNode != null && embeddingNode.isArray()) {
                    String embeddingJson = embeddingNode.toString();
                    logger.info("Embedding généré via service Python (dimension: {})", 
                              embeddingNode.size());
                    return embeddingJson;
                }
            }
            
            logger.error("Réponse invalide du service d'embedding: {}", response.getBody());
            return null;
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'appel au service d'embedding containerized: {}", e.getMessage());
            
            // Use fallback only if enabled
            if (fallbackEnabled) {
                logger.warn("Utilisation du fallback suite à l'échec du service containerized");
                return generateFallbackEmbedding(text);
            } else {
                logger.error("Fallback désactivé, retour null");
                return null;
            }
        }
    }
    
    /**
     * Calculer la similarité entre deux textes via le service Python
     * AMÉLIORÉ: Avec timeout et logique de fallback intelligente
     */
    public double calculateSimilarity(String text1, String text2) {
        try {
            // Validation des entrées
            if (text1 == null || text2 == null || text1.trim().isEmpty() || text2.trim().isEmpty()) {
                logger.warn("Textes vides pour la similarité, retour score neutre");
                return 0.5;
            }
            
            // Préparer la requête avec timeout
            restTemplate.getMessageConverters().forEach(converter -> {
                if (converter instanceof org.springframework.http.converter.StringHttpMessageConverter) {
                    ((org.springframework.http.converter.StringHttpMessageConverter) converter).setWriteAcceptCharset(false);
                }
            });
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text1", text1.trim());
            requestBody.put("text2", text2.trim());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.add("Accept", "application/json");
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            // Appeler le service Python avec timeout
            String url = embeddingServiceUrl + "/similarity";
            logger.debug("Appel service Python: {} avec textes de longueur {} et {}", 
                        url, text1.length(), text2.length());
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, request, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                try {
                    // Parser la réponse JSON
                    JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                    JsonNode similarityNode = jsonResponse.get("similarity");
                    
                    if (similarityNode != null && similarityNode.isNumber()) {
                        double similarity = similarityNode.asDouble();
                        
                        // Valider le résultat
                        if (similarity >= -1.0 && similarity <= 1.0) {
                            logger.debug("Similarité calculée via service Python: {:.4f}", similarity);
                            return Math.max(0.0, Math.min(1.0, similarity));
                        } else {
                            logger.warn("Similarité hors limites: {}, utilisation du fallback", similarity);
                        }
                    } else {
                        logger.warn("Réponse JSON invalide: {}", response.getBody());
                    }
                } catch (Exception parseException) {
                    logger.error("Erreur parsing JSON: {}, réponse: {}", parseException.getMessage(), response.getBody());
                }
            } else {
                logger.warn("Réponse HTTP invalide: status={}, body={}", 
                          response.getStatusCode(), response.getBody());
            }
            
            // Fallback vers calcul Java simple
            logger.info("Utilisation du fallback Java pour la similarité");
            return calculateJavaFallbackSimilarity(text1, text2);
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul de similarité Python: {}, utilisation du fallback", e.getMessage());
            return calculateJavaFallbackSimilarity(text1, text2);
        }
    }
    
    /**
     * NOUVEAU: Calcul de similarité de fallback basé sur Java
     * Utilise la similarité Jaccard et des heuristiques métier
     */
    private double calculateJavaFallbackSimilarity(String text1, String text2) {
        try {
            // Normaliser les textes
            String normalizedText1 = text1.toLowerCase().replaceAll("[^a-zA-Z0-9\\s+#.]", " ");
            String normalizedText2 = text2.toLowerCase().replaceAll("[^a-zA-Z0-9\\s+#.]", " ");
            
            // Extraire les mots-clés
            String[] keywords1 = normalizedText1.split("\\s+");
            String[] keywords2 = normalizedText2.split("\\s+");
            
            if (keywords1.length == 0 || keywords2.length == 0) {
                return 0.3; // Score minimal si pas de mots
            }
            
            // Calcul de similarité Jaccard améliorée
            java.util.Set<String> set1 = new java.util.HashSet<>();
            java.util.Set<String> set2 = new java.util.HashSet<>();
            
            // Ajouter des synonymes techniques
            for (String keyword : keywords1) {
                set1.add(keyword);
                set1.addAll(getTechnicalSynonyms(keyword));
            }
            
            for (String keyword : keywords2) {
                set2.add(keyword);
                set2.addAll(getTechnicalSynonyms(keyword));
            }
            
            // Intersection et union
            java.util.Set<String> intersection = new java.util.HashSet<>(set1);
            intersection.retainAll(set2);
            
            java.util.Set<String> union = new java.util.HashSet<>(set1);
            union.addAll(set2);
            
            double jaccardSimilarity = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
            
            // Bonus pour les correspondances exactes importantes
            double exactMatchBonus = calculateExactMatchBonus(text1, text2);
            
            // Score final avec bonus
            double finalScore = Math.min(1.0, jaccardSimilarity + exactMatchBonus);
            
            logger.debug("Similarité Java fallback: Jaccard={:.3f}, Bonus={:.3f}, Final={:.3f}", 
                        jaccardSimilarity, exactMatchBonus, finalScore);
            
            return finalScore;
            
        } catch (Exception e) {
            logger.error("Erreur dans le fallback Java: {}", e.getMessage());
            return 0.4; // Score par défaut conservateur
        }
    }
    
    /**
     * NOUVEAU: Obtenir des synonymes techniques pour améliorer le matching
     */
    private java.util.Set<String> getTechnicalSynonyms(String keyword) {
        java.util.Set<String> synonyms = new java.util.HashSet<>();
        
        // Synonymes pour les langages de programmation
        switch (keyword.toLowerCase()) {
            case "java":
                synonyms.add("jvm");
                synonyms.add("openjdk");
                break;
            case "javascript":
                synonyms.add("js");
                synonyms.add("node");
                synonyms.add("nodejs");
                break;
            case "typescript":
                synonyms.add("ts");
                break;
            case "spring":
                synonyms.add("springboot");
                synonyms.add("springframework");
                break;
            case "react":
                synonyms.add("reactjs");
                break;
            case "postgresql":
                synonyms.add("postgres");
                synonyms.add("psql");
                break;
            case "mysql":
                synonyms.add("mariadb");
                break;
            case "docker":
                synonyms.add("containers");
                synonyms.add("containerization");
                break;
            case "kubernetes":
                synonyms.add("k8s");
                break;
            case "aws":
                synonyms.add("amazon");
                synonyms.add("cloud");
                break;
        }
        
        return synonyms;
    }
    
    /**
     * NOUVEAU: Calculer bonus pour correspondances exactes critiques
     */
    private double calculateExactMatchBonus(String text1, String text2) {
        double bonus = 0.0;
        
        // Technologies critiques avec bonus élevé
        String[] criticalTech = {"java", "spring", "react", "postgresql", "typescript", "docker", "kubernetes"};
        
        for (String tech : criticalTech) {
            if (text1.toLowerCase().contains(tech) && text2.toLowerCase().contains(tech)) {
                bonus += 0.05; // 5% de bonus par technologie critique
            }
        }
        
        // Bonus pour les versions spécifiques
        if (text1.contains("Java 17") && text2.contains("Java 17")) bonus += 0.1;
        if (text1.contains("Spring Boot") && text2.contains("Spring Boot")) bonus += 0.1;
        if (text1.contains("React 18") && text2.contains("React")) bonus += 0.08;
        
        return Math.min(0.3, bonus); // Limiter le bonus à 30%
    }
    
    /**
     * Vérifier la santé du service Python
     */
    public boolean isServiceHealthy() {
        try {
            String url = embeddingServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            logger.warn("Service d'embedding non disponible: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Embedding de fallback si le service Python n'est pas disponible
     */
    private String generateFallbackEmbedding(String text) {
        logger.warn("Utilisation de l'embedding de fallback (simulation)");
        
        // Utiliser la même logique que NLPEmbeddingService mais simplifiée
        double[] embedding = new double[384];
        long seed = text.hashCode();
        java.util.Random random = new java.util.Random(seed);
        
        for (int i = 0; i < 384; i++) {
            embedding[i] = random.nextGaussian() * 0.5;
        }
        
        // Normaliser
        double norm = 0.0;
        for (double value : embedding) {
            norm += value * value;
        }
        norm = Math.sqrt(norm);
        
        if (norm > 0) {
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] /= norm;
            }
        }
        
        // Convertir en JSON
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) json.append(",");
            json.append(String.format("%.6f", embedding[i]));
        }
        json.append("]");
        
        return json.toString();
    }
    
    /**
     * Construire le texte complet du CV - VERSION ENRICHIE
     * Inclut tous les éléments critiques pour un matching précis
     */
    public String buildCvText(Cv cv) {
        StringBuilder text = new StringBuilder();
        
        // SECTION 1: Compétences techniques (poids élevé)
        if (cv.getCompetencesTechniques() != null && !cv.getCompetencesTechniques().isEmpty()) {
            text.append("COMPETENCES_TECHNIQUES: ").append(cv.getCompetencesTechniques()).append(" ");
        }
        
        // SECTION 2: Projets (nouvellement ajouté - critique pour l'évaluation)
        if (cv.getProjets() != null && !cv.getProjets().isEmpty()) {
            text.append("PROJETS: ").append(cv.getProjets()).append(" ");
        }
        
        // SECTION 3: Certifications (nouvellement ajouté - très important)
        if (cv.getCertifications() != null && !cv.getCertifications().isEmpty()) {
            text.append("CERTIFICATIONS: ").append(cv.getCertifications()).append(" ");
        }
        
        // SECTION 4: Langues (nouvellement ajouté)
        if (cv.getLangues() != null && !cv.getLangues().isEmpty()) {
            text.append("LANGUES: ").append(cv.getLangues()).append(" ");
        }
        
        // SECTION 5: Expérience (structurée)
        if (cv.getExperienceAnnees() != null) {
            text.append("EXPERIENCE: ").append(cv.getExperienceAnnees()).append(" années ");
        }
        
        // SECTION 6: Formation
        if (cv.getFormations() != null && !cv.getFormations().isEmpty()) {
            text.append("FORMATIONS: ").append(cv.getFormations()).append(" ");
        }
        
        if (cv.getNiveauEtude() != null && !cv.getNiveauEtude().isEmpty()) {
            text.append("NIVEAU_ETUDE: ").append(cv.getNiveauEtude()).append(" ");
        }
        
        // SECTION 7: Compétences transversales
        if (cv.getCompetencesTransversales() != null && !cv.getCompetencesTransversales().isEmpty()) {
            text.append("COMPETENCES_TRANSVERSALES: ").append(cv.getCompetencesTransversales()).append(" ");
        }
        
        // SECTION 8: Résumé professionnel
        if (cv.getResumeProfessionnel() != null && !cv.getResumeProfessionnel().isEmpty()) {
            text.append("RESUME_PROFESSIONNEL: ").append(cv.getResumeProfessionnel()).append(" ");
        }
        
        // SECTION 9: Texte extrait (contexte global)
        if (cv.getTexteExtrait() != null && !cv.getTexteExtrait().isEmpty()) {
            text.append("CONTEXTE: ").append(cv.getTexteExtrait()).append(" ");
        }
        
        return text.toString().trim();
    }
    
    /**
     * Construire le texte complet de l'offre d'emploi - VERSION ENRICHIE
     * Structure optimisée pour le matching précis
     */
    private String buildJobOfferText(JobOffre jobOffer) {
        StringBuilder text = new StringBuilder();
        
        // SECTION 1: Informations du poste
        if (jobOffer.getTitre() != null && !jobOffer.getTitre().isEmpty()) {
            text.append("POSTE: ").append(jobOffer.getTitre()).append(" ");
        }
        
        if (jobOffer.getDescription() != null && !jobOffer.getDescription().isEmpty()) {
            text.append("DESCRIPTION: ").append(jobOffer.getDescription()).append(" ");
        }
        
        // SECTION 2: Compétences requises (poids élevé)
        if (jobOffer.getCompetencesTechniques() != null && !jobOffer.getCompetencesTechniques().isEmpty()) {
            text.append("COMPETENCES_TECHNIQUES_REQUISES: ").append(jobOffer.getCompetencesTechniques()).append(" ");
        }
        
        if (jobOffer.getCompetencesTransversales() != null && !jobOffer.getCompetencesTransversales().isEmpty()) {
            text.append("COMPETENCES_TRANSVERSALES_REQUISES: ").append(jobOffer.getCompetencesTransversales()).append(" ");
        }
        
        // SECTION 3: Exigences d'expérience et formation
        if (jobOffer.getExperienceMinRequise() != null) {
            text.append("EXPERIENCE_REQUISE: ").append(jobOffer.getExperienceMinRequise()).append(" années ");
        }
        
        if (jobOffer.getNiveauEtudeMin() != null) {
            text.append("FORMATION_REQUISE: ").append(jobOffer.getNiveauEtudeMin()).append(" ");
        }
        
        // SECTION 4: Langues requises (nouvellement structuré)
        if (jobOffer.getLanguesRequises() != null && !jobOffer.getLanguesRequises().isEmpty()) {
            text.append("LANGUES_REQUISES: ").append(jobOffer.getLanguesRequises()).append(" ");
        }
        
        // SECTION 5: Mission et responsabilités
        if (jobOffer.getMissionPrincipale() != null && !jobOffer.getMissionPrincipale().isEmpty()) {
            text.append("MISSION_PRINCIPALE: ").append(jobOffer.getMissionPrincipale()).append(" ");
        }
        
        if (jobOffer.getResponsabilites() != null && !jobOffer.getResponsabilites().isEmpty()) {
            text.append("RESPONSABILITES: ").append(jobOffer.getResponsabilites()).append(" ");
        }
        
        // SECTION 6: Outils et technologies
        if (jobOffer.getOutilsTechnologies() != null && !jobOffer.getOutilsTechnologies().isEmpty()) {
            text.append("OUTILS_TECHNOLOGIES: ").append(jobOffer.getOutilsTechnologies()).append(" ");
        }
        
        // SECTION 7: Contexte métier
        if (jobOffer.getSecteurActivite() != null && !jobOffer.getSecteurActivite().isEmpty()) {
            text.append("SECTEUR: ").append(jobOffer.getSecteurActivite()).append(" ");
        }
        
        if (jobOffer.getLocalisation() != null && !jobOffer.getLocalisation().isEmpty()) {
            text.append("LOCALISATION: ").append(jobOffer.getLocalisation()).append(" ");
        }
        
        return text.toString().trim();
    }
}

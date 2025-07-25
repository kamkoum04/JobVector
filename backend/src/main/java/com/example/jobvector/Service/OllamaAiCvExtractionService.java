package com.example.jobvector.Service;

import com.example.jobvector.Dto.CvDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OllamaAiCvExtractionService {
    
    private static final Logger logger = LoggerFactory.getLogger(OllamaAiCvExtractionService.class);
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public CvDto extractCvInformation(String texteCV) {
        try {
            String prompt = buildExtractionPrompt(texteCV);
            
            logger.info("Envoi du prompt à Ollama pour extraction du CV");
            
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            
            logger.debug("Réponse reçue d'Ollama (brute): {}", response);
            
            // Nettoyer et valider la réponse JSON
            String cleanResponse = extractAndCleanJsonResponse(response);
            
            if (cleanResponse == null || cleanResponse.isEmpty()) {
                logger.error("Impossible d'extraire un JSON valide de la réponse");
                throw new RuntimeException("Impossible d'extraire un JSON valide de la réponse");
            }

            logger.info("Réponse nettoyée prête pour le parsing: {}", cleanResponse);
            
            // Vérifier que le JSON est valide avant la désérialisation
            if (!isValidJson(cleanResponse)) {
                logger.error("JSON invalide après nettoyage: {}", cleanResponse);
                throw new RuntimeException("La réponse nettoyée n'est pas un JSON valide");
            }

            // Convertir la réponse JSON en CvDto
            CvDto cvDto = objectMapper.readValue(cleanResponse, CvDto.class);
            
            logger.info("Extraction réussie du CV pour: {} {}", cvDto.getNom(), cvDto.getPrenom());
            
            return cvDto;
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction du CV avec Ollama: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'extraction du CV: " + e.getMessage(), e);
        }
    }
    
    private String buildExtractionPrompt(String texteCV) {
        return """
                **MISSION CRITIQUE:** Vous êtes un expert en analyse de CV pour TOUT MÉTIER, TOUT SECTEUR, et TOUTE INDUSTRIE. Extrayez les informations du CV dans un format JSON structuré.

                **RÈGLES FONDAMENTALES:**
                1. ⚠️ REMPLISSEZ TOUS LES CHAMPS - Ne jamais laisser de valeurs NULL
                2. ⚠️ Répondez uniquement avec un objet JSON valide (pas de texte supplémentaire)
                3. ⚠️ Évitez toute duplication dans les différentes catégories
                4. ⚠️ Utilisez les définitions universelles pour chaque catégorie

                **DÉFINITIONS UNIVERSELLES:**

                ✅ COMPÉTENCES TECHNIQUES:
                • C'est ce que la personne SAIT FAIRE
                • Ce sont des capacités ou savoir-faire que la personne a appris et qu'elle peut appliquer pour résoudre un problème ou accomplir une tâche
                • Les compétences techniques sont spécifiques à chaque métier et secteur d'activité


                ⚙️ COMPÉTENCES TRANSVERSALES:
                • Ce sont les qualités humaines et interpersonnelles (soft skills)
                • Elles sont transférables d'un métier à l'autre (communication, travail d'équipe, gestion du temps, etc.)
                • Elles complètent les compétences techniques et s'appliquent dans divers contextes

                **CALCUL PRÉCIS DE L'EXPÉRIENCE PROFESSIONNELLE:**
                • Comptabilisez UNIQUEMENT les emplois à temps plein
                • EXCLUEZ: stages, internships, jobs étudiants, emplois saisonniers, bénévolat
                • Règles de calcul:
                   - Moins de 6 mois = 0 an pour ce poste
                   - Entre 6 et 12 mois = 1 an pour ce poste
                   - Au-delà = nombre d'années complètes
                • Additionnez uniquement les postes pertinents et à temps plein

                **DÉTERMINATION DU NIVEAU D'ÉTUDE:**
                • Suivez strictement ces équivalences dans le système français:
                   - AUCUN: Pas d'études supérieures
                   - BAC: Baccalauréat ou équivalent
                   - BAC+2: BTS, DUT, DEUG, ou 2 années post-bac
                   - BAC+3: Licence, Bachelor, ou 3 années post-bac
                   - BAC+5: Master, Diplôme d'ingénieur, MBA, ou 5 années post-bac
                   - DOCTORAT: Doctorat ou PhD
                
                • RÈGLES IMPORTANTES POUR LES ÉTUDES D'INGÉNIEUR:
                   - Tout diplôme d'ingénieur = BAC+5 (même en cours)
                   - Toute étude dans une école d'ingénieurs = BAC+5 (même en cours)
                   - Formations en "ingénierie" dans une université = BAC+5 (même en cours)
                
                • ÉDUCATION EN COURS:
                   - Si études actuellement en cours, évaluez le niveau d'études FINAL attendu
                   - Exemple: "2023-Présent: École d'ingénieurs" = BAC+5 (pas BAC+2 ou BAC+3)
                   - Indices: "Present", "Now", "En cours", "Actuel", "Current"

                **STRUCTURE JSON - TOUS LES CHAMPS SONT OBLIGATOIRES:**
                {
                  "nom": "string (nom de famille)",
                  "prenom": "string (prénom)",
                  "email": "string (email ou 'non spécifié')",
                  "telephone": "string (avec indicatif international si possible)",
                  "adresse": "string (ville, pays au minimum)",
                  "linkedinUrl": "string (URL ou 'non spécifié')",
                  "competencesTechniques": "string (CE QUE LA PERSONNE SAIT FAIRE)",
                  "competencesTransversales": "string (soft skills)",
                  "experienceAnnees": "integer (calculé selon règles précises)",
                  "langues": "string (langues mentionne ou 'Aucune langue mentionnée')",
                  "niveauEtude": "AUCUN|BAC|BAC+2|BAC+3|BAC+5|DOCTORAT",
                  "formations": "string (diplômes et formations suivies)",
                  "certifications": "string (certifications professionnelles ou 'Aucune certification mentionnée')",
                  "projets": "string (projets pertinents ou 'Aucun projet spécifique mentionné')",
                  "pointsForts": "string (réalisations et atouts principaux)",
                  "resumeProfessionnel": "string (synthèse du profil en 2-3 phrases)",
                  "motsClesGeneres": "string (5-10 mots-clés représentatifs du profil)"
                }

                **DISTINCTION ESSENTIELLE:**
                • Ne confondez pas les compétences techniques (savoir-faire) avec les outils et technologies (moyens utilisés)
                • Une personne peut avoir la compétence technique "gestion de projets" et utiliser l'outil "Microsoft Project"
                • Une personne peut avoir la compétence "analyse financière" et utiliser l'outil "Excel"

                **TEXTE DU CV À ANALYSER:**
                ---
                """ + texteCV + """
                ---

                **RAPPEL FINAL:**
                - DISTINGUEZ clairement entre ce que la personne SAIT FAIRE et les OUTILS qu'elle utilise
                - CALCULEZ PRÉCISÉMENT les années d'expérience (uniquement emplois à temps plein)
                - REMPLISSEZ tous les champs (jamais null)
                - ADAPTEZ l'analyse au secteur professionnel spécifique du CV
                - VÉRIFIEZ attentivement le niveau d'étude en prêtant attention aux études d'ingénieur ou en cours
                """;
    }
    
    /**
     * Extrait et nettoie la réponse JSON de la réponse brute du modèle
     */
    private String extractAndCleanJsonResponse(String response) {
        if (response == null || response.isEmpty()) {
            return "{}";
        }
        
        // Essayer d'extraire le JSON avec regex
        Pattern jsonPattern = Pattern.compile("\\{[\\s\\S]*?\\}(?=[^{]*(\\z|$))");
        Matcher matcher = jsonPattern.matcher(response);
        
        if (matcher.find()) {
            String potentialJson = matcher.group(0);
            // Vérifier si c'est un JSON complet et valide
            if (isValidJson(potentialJson)) {
                return potentialJson;
            }
        }
        
        // Si l'extraction par regex échoue, essayer la méthode classique
        return fallbackJsonCleaning(response);
    }
    
    /**
     * Méthode de secours pour nettoyer le JSON
     */
    private String fallbackJsonCleaning(String response) {
        // Supprimer les balises markdown et le texte d'introduction
        response = response.replaceAll("(?s).*?\\{", "{");
        response = response.replaceAll("```json|```", "").trim();
        
        // Trouver l'accolade ouvrante la plus à gauche
        int startIndex = response.indexOf("{");
        if (startIndex == -1) {
            logger.error("La réponse ne contient pas de JSON valide (aucun '{' trouvé)");
            return "{}";
        }
        
        // Trouver l'accolade fermante correspondante
        int depth = 0;
        int endIndex = -1;
        
        for (int i = startIndex; i < response.length(); i++) {
            char c = response.charAt(i);
            if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    endIndex = i;
                    break;
                }
            }
        }
        
        if (endIndex == -1) {
            logger.warn("JSON incomplet, accolade fermante manquante. Tentative de réparation.");
            return balanceJson(response.substring(startIndex));
        }
        
        return response.substring(startIndex, endIndex + 1);
    }
    
    /**
     * Équilibre un JSON potentiellement incomplet en ajoutant les accolades manquantes
     */
    private String balanceJson(String json) {
        int openBraces = 0;
        int closeBraces = 0;
        
        for (char c : json.toCharArray()) {
            if (c == '{') openBraces++;
            if (c == '}') closeBraces++;
        }
        
        StringBuilder balanced = new StringBuilder(json);
        while (closeBraces < openBraces) {
            balanced.append('}');
            closeBraces++;
        }
        
        return balanced.toString();
    }
    
    /**
     * Vérifie si une chaîne est un JSON valide
     */
    private boolean isValidJson(String jsonString) {
        try {
            objectMapper.readTree(jsonString);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}
package com.example.jobvector.Service;

import com.example.jobvector.Dto.CvDto;
import com.example.jobvector.Model.Cv;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.CvRepository;
import com.example.jobvector.Repository.UtilisateurRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class CvService {
    
    private static final Logger logger = LoggerFactory.getLogger(CvService.class);
    
    @Autowired
    private CvRepository cvRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private OllamaAiCvExtractionService ollamaAiCvExtractionService;
    
    @Autowired
    private PythonEmbeddingService pythonEmbeddingService;
    
    @Value("${app.upload.cv.directory}")
    private String uploadDirectory;
    
    public CvDto uploadAndProcessCv(MultipartFile file, Long utilisateurId) {
        try {
            // Vérifier si l'utilisateur existe
            Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + utilisateurId));
            
            // Vérifier si un CV existe déjà pour cet utilisateur
            Optional<Cv> existingCv = cvRepository.findByUtilisateurId(utilisateurId);
            
            // Sauvegarder le fichier
            String fileName = saveFile(file);
            
            // Extraire le texte du PDF
            String texteExtrait = extractTextFromPdf(file);
            
            // Créer ou mettre à jour le CV avec les informations de base SEULEMENT
            Cv cv;
            if (existingCv.isPresent()) {
                cv = existingCv.get();
                // Supprimer l'ancien fichier si nécessaire
                deleteOldFile(cv.getFichierPath());
            } else {
                cv = new Cv();
                cv.setUtilisateur(utilisateur);
            }
            
            // Mettre à jour les informations de base du CV (sans Ollama)
            cv.setFichierPath(fileName);
            cv.setTexteExtrait(texteExtrait);
            cv.setTailleFichier(file.getSize());
            
            // Sauvegarder en base de données avec les informations de base
            cv = cvRepository.save(cv);
            
            // Traiter avec Ollama de manière SYNCHRONE pour extraire les informations
            logger.info("Début de l'extraction Ollama pour l'utilisateur: {}", utilisateur.getEmail());
            CvDto cvDto = ollamaAiCvExtractionService.extractCvInformation(texteExtrait);
            
            // Mettre à jour le CV avec les informations extraites d'Ollama
            updateCvFromDto(cv, cvDto, cv.getFichierPath(), texteExtrait);
            
            // Sauvegarder les informations extraites
            cv = cvRepository.save(cv);
            logger.info("Informations Ollama sauvegardées pour le CV ID: {}", cv.getId());
            
            // Générer l'embedding de manière SYNCHRONE (inclus dans la réponse)
            logger.info("Début de la génération d'embedding pour l'utilisateur: {}", utilisateur.getEmail());
            String embedding = pythonEmbeddingService.generateCvEmbedding(cv);
            
            if (embedding != null && !embedding.isEmpty()) {
                cv.setEmbedding(embedding);
                cv = cvRepository.save(cv);
                logger.info("Embedding vectoriel généré et sauvegardé pour le CV ID: {}", cv.getId());
            } else {
                logger.warn("Échec de la génération d'embedding pour le CV ID: {}", cv.getId());
            }
            
            logger.info("CV uploadé avec succès pour l'utilisateur: {} - Embedding généré", utilisateur.getEmail());
            
            // Retourner la réponse complète avec toutes les informations extraites ET l'embedding
            CvDto response = convertToDto(cv);
            response.setStatusCode(201);
            response.setMessage("CV uploadé, traité et embedding généré avec succès");
            
            return response;
            
        } catch (Exception e) {
            logger.error("Erreur lors du traitement du CV: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors du traitement du CV: " + e.getMessage(), e);
        }
    }
    
    public CvDto getCvByUtilisateurId(Long utilisateurId) {
        Cv cv = cvRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Aucun CV trouvé pour cet utilisateur"));
        return convertToDto(cv);
    }
    
    public boolean hasCv(Long utilisateurId) {
        return cvRepository.existsByUtilisateurId(utilisateurId);
    }
    
    public String getUploadDirectory() {
        return uploadDirectory;
    }
    
    public void deleteCv(Long utilisateurId) {
        Cv cv = cvRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Aucun CV trouvé pour cet utilisateur"));
        
        // Supprimer le fichier
        deleteOldFile(cv.getFichierPath());
        
        // Supprimer l'enregistrement de la base de données
        cvRepository.delete(cv);
        
        logger.info("CV supprimé avec succès pour l'utilisateur ID: {}", utilisateurId);
    }
    
    private String saveFile(MultipartFile file) throws IOException {
        // Créer le répertoire s'il n'existe pas
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            logger.info("Répertoire d'upload créé: {}", uploadPath.toAbsolutePath());
        }
        
        // Générer un nom de fichier unique
        String fileName = UUID.randomUUID().toString() + ".pdf";
        Path filePath = uploadPath.resolve(fileName);
        
        // Sauvegarder le fichier avec une méthode plus robuste
        try {
            Files.copy(file.getInputStream(), filePath);
            logger.info("Fichier sauvegardé avec succès: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            logger.error("Erreur lors de la sauvegarde du fichier: {}", e.getMessage());
            throw new IOException("Impossible de sauvegarder le fichier: " + e.getMessage(), e);
        }
        
        return fileName;
    }
    
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String extractedText = pdfStripper.getText(document);
            
            // Vérifier si le texte extrait n'est pas vide
            if (extractedText == null || extractedText.trim().isEmpty()) {
                logger.warn("Le fichier PDF ne contient pas de texte extractible");
                return "Aucun texte détecté dans le fichier PDF";
            }
            
            return extractedText;
        } catch (IOException e) {
            logger.error("Erreur lors de l'extraction du texte PDF: {}", e.getMessage());
            throw new RuntimeException("Le fichier PDF est invalide ou corrompu. Veuillez uploader un fichier PDF valide.", e);
        }
    }

    private void updateCvFromDto(Cv cv, CvDto cvDto, String fileName, String texteExtrait) {
        cv.setFichierPath(fileName);
        cv.setTexteExtrait(texteExtrait);
        cv.setNom(cvDto.getNom());
        cv.setPrenom(cvDto.getPrenom());
        cv.setEmail(cvDto.getEmail());
        cv.setTelephone(cvDto.getTelephone());
        cv.setAdresse(cvDto.getAdresse());
        cv.setLinkedinUrl(cvDto.getLinkedinUrl());
        cv.setCompetencesTechniques(cvDto.getCompetencesTechniques());
        cv.setCompetencesTransversales(cvDto.getCompetencesTransversales());
        cv.setExperienceAnnees(cvDto.getExperienceAnnees());
        cv.setNiveauEtude(cvDto.getNiveauEtude());
        cv.setLangues(cvDto.getLangues());
        cv.setFormations(cvDto.getFormations());
        cv.setCertifications(cvDto.getCertifications());
        cv.setProjets(cvDto.getProjets());
        cv.setPointsForts(cvDto.getPointsForts());
        cv.setResumeProfessionnel(cvDto.getResumeProfessionnel());
        cv.setMotsClesGeneres(String.join(", ", cvDto.getMotsClesGeneres()));
    }

    private CvDto convertToDto(Cv cv) {
        CvDto dto = new CvDto();
        dto.setId(cv.getId());
        dto.setFichierPath(cv.getFichierPath());
        dto.setTexteExtrait(cv.getTexteExtrait());
        dto.setNom(cv.getNom());
        dto.setPrenom(cv.getPrenom());
        dto.setEmail(cv.getEmail());
        dto.setTelephone(cv.getTelephone());
        dto.setAdresse(cv.getAdresse());
        dto.setLinkedinUrl(cv.getLinkedinUrl());
        dto.setCompetencesTechniques(cv.getCompetencesTechniques());
        dto.setCompetencesTransversales(cv.getCompetencesTransversales());
        dto.setExperienceAnnees(cv.getExperienceAnnees());
        dto.setNiveauEtude(cv.getNiveauEtude());
        dto.setLangues(cv.getLangues());
        dto.setFormations(cv.getFormations());
        dto.setCertifications(cv.getCertifications());
        dto.setProjets(cv.getProjets());
        dto.setPointsForts(cv.getPointsForts());
        dto.setResumeProfessionnel(cv.getResumeProfessionnel());
        dto.setMotsClesGeneres(cv.getMotsClesGeneres());
        dto.setDateCreation(cv.getDateCreation());
        dto.setDateModification(cv.getDateModification());
        dto.setUtilisateurId(cv.getUtilisateur().getId());
        
        // Ajouter l'embedding dans la réponse (pour confirmation)
        if (cv.getEmbedding() != null && !cv.getEmbedding().isEmpty()) {
            dto.setEmbeddingGenerated(true);
            dto.setEmbeddingSize(cv.getEmbedding().length());
        } else {
            dto.setEmbeddingGenerated(false);
            dto.setEmbeddingSize(0);
        }
        
        return dto;
    }
    
    private void deleteOldFile(String fileName) {
        if (fileName != null && !fileName.isEmpty()) {
            try {
                Path filePath = Paths.get(uploadDirectory, fileName);
                Files.deleteIfExists(filePath);
                logger.info("Ancien fichier supprimé: {}", fileName);
            } catch (IOException e) {
                logger.error("Erreur lors de la suppression du fichier: {}", fileName, e);
            }
        }
    }
}
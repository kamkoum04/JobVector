package com.example.jobvector.Service;

import com.example.jobvector.Dto.CvDto;
import com.example.jobvector.Model.Cv;
import com.example.jobvector.Model.CvProcessingJob;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.CvProcessingJobRepository;
import com.example.jobvector.Repository.CvRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AsyncCvProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(AsyncCvProcessingService.class);
    
    @Autowired
    private CvProcessingJobRepository jobRepository;
    
    @Autowired
    private CvRepository cvRepository;
    
    @Autowired
    private OllamaAiCvExtractionService ollamaAiCvExtractionService;
    
    @Autowired
    private PythonEmbeddingService pythonEmbeddingService;
    
    /**
     * Process CV asynchronously in the background
     * This method runs in a separate thread and updates job status throughout processing
     */
    @Async
    @Transactional
    public void processCvAsync(Long jobId, String texteExtrait) {
        CvProcessingJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        
        try {
            // Update status to PROCESSING
            job.setStatus(CvProcessingJob.JobStatus.PROCESSING);
            job.setStatusDetails("Extracting CV information with Ollama AI...");
            jobRepository.save(job);
            
            logger.info("Starting async CV processing for job ID: {}, user: {}", 
                jobId, job.getUtilisateur().getEmail());
            
            // Extract CV information with Ollama (this takes ~10 minutes)
            CvDto cvDto = ollamaAiCvExtractionService.extractCvInformation(texteExtrait);
            logger.info("Ollama extraction completed for job ID: {}", jobId);
            
            // Update job status
            job.setStatusDetails("Saving CV information to database...");
            jobRepository.save(job);
            
            // Get or create CV record
            Optional<Cv> existingCv = cvRepository.findByUtilisateurId(job.getUtilisateur().getId());
            Cv cv;
            if (existingCv.isPresent()) {
                cv = existingCv.get();
            } else {
                cv = new Cv();
                cv.setUtilisateur(job.getUtilisateur());
            }
            
            // Update CV with extracted information
            cv.setFichierPath(job.getFilePath());
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
            cv.setMotsClesGeneres(cvDto.getMotsClesGeneres());
            cv.setProcessingJob(job);
            
            cv = cvRepository.save(cv);
            logger.info("CV information saved for job ID: {}", jobId);
            
            // Update job status for embedding generation
            job.setStatusDetails("Generating vector embedding...");
            jobRepository.save(job);
            
            // Generate embedding
            String embedding = pythonEmbeddingService.generateCvEmbedding(cv);
            if (embedding != null && !embedding.isEmpty()) {
                cv.setEmbedding(embedding);
                cvRepository.save(cv);
                logger.info("Embedding generated for job ID: {}", jobId);
            } else {
                logger.warn("Failed to generate embedding for job ID: {}", jobId);
            }
            
            // Mark job as completed
            job.setStatus(CvProcessingJob.JobStatus.COMPLETED);
            job.setStatusDetails("CV processing completed successfully");
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);
            
            logger.info("CV processing completed successfully for job ID: {}, user: {}", 
                jobId, job.getUtilisateur().getEmail());
            
        } catch (Exception e) {
            // Mark job as failed
            logger.error("CV processing failed for job ID: {}, error: {}", jobId, e.getMessage(), e);
            job.setStatus(CvProcessingJob.JobStatus.FAILED);
            job.setStatusDetails("Processing failed");
            job.setErrorMessage(e.getMessage());
            job.setCompletedAt(LocalDateTime.now());
            jobRepository.save(job);
        }
    }
}

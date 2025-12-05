package com.example.jobvector.Repository;

import com.example.jobvector.Model.CvProcessingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvProcessingJobRepository extends JpaRepository<CvProcessingJob, Long> {
    
    Optional<CvProcessingJob> findByIdAndUtilisateurId(Long id, Long utilisateurId);
    
    List<CvProcessingJob> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);
    
    Optional<CvProcessingJob> findFirstByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);
}

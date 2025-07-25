package com.example.jobvector.Repository;

import com.example.jobvector.Model.Cv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {
    
    @Query("SELECT c FROM Cv c WHERE c.utilisateur.id = :utilisateurId")
    Optional<Cv> findByUtilisateurId(@Param("utilisateurId") Long utilisateurId);
    
    @Query("SELECT c FROM Cv c WHERE c.utilisateur.email = :email")
    Optional<Cv> findByUtilisateurEmail(@Param("email") String email);
    
    boolean existsByUtilisateurId(Long utilisateurId);
}
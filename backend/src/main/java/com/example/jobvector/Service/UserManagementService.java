package com.example.jobvector.Service;

import com.example.jobvector.Dto.UserDto;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Model.UserRole;
import com.example.jobvector.Repository.UtilisateurRepository;
import com.example.jobvector.Config.JWTUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion des utilisateurs pour l'application JobVector
 * Gère les trois rôles principaux selon le scénario :
 * - ADMIN : Gestion complète du système
 * - CANDIDATE : Recherche d'emploi et candidatures
 * - EMPLOYER : Publication d'offres et recrutement
 */
@Service
public class UserManagementService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * INSCRIPTION - Création d'un nouveau compte utilisateur
     * Valide le rôle et les données spécifiques selon le type d'utilisateur
     */
    public UserDto register(UserDto registrationRequest) {
        UserDto response = new UserDto();

        try {
            // Validation de l'unicité de l'email
            if (utilisateurRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
                response.setStatusCode(400);
                response.setMessage("Un utilisateur avec cet email existe déjà");
                return response;
            }

            // Validation du rôle
            String role = registrationRequest.getRole();
            if (!isValidRole(role)) {
                response.setStatusCode(400);
                response.setMessage("Rôle invalide. Les rôles autorisés sont: ADMIN, CANDIDATE, EMPLOYER");
                return response;
            }

            // Validation spécifique selon le rôle
            String validationError = validateRoleSpecificData(registrationRequest);
            if (validationError != null) {
                response.setStatusCode(400);
                response.setMessage(validationError);
                return response;
            }

            // Création de l'utilisateur
            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setEmail(registrationRequest.getEmail());
            utilisateur.setCin(Integer.parseInt(registrationRequest.getCin()));
            utilisateur.setRole(role);
            utilisateur.setNom(registrationRequest.getNom());
            utilisateur.setPrenom(registrationRequest.getPrenom());
            utilisateur.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

            Utilisateur savedUser = utilisateurRepository.save(utilisateur);

            if (savedUser.getId() > 0) {
                response.setUtilisateurs(savedUser);
                response.setMessage(getSuccessMessageByRole(role));
                response.setStatusCode(200);
            }

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setError("Erreur lors de l'inscription: " + e.getMessage());
        }

        return response;
    }

    /**
     * CONNEXION - Authentification et génération de token JWT
     */
    public UserDto login(UserDto loginRequest) {
        UserDto response = new UserDto();

        try {
            // Authentification
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            // Récupération de l'utilisateur et génération des tokens
            Utilisateur user = utilisateurRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String jwt = jwtUtils.generateToken(user);
            String refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRole(user.getRole());
            response.setRefreshToken(refreshToken);
            response.setExpirationTime("24Hrs");
            response.setMessage(getLoginSuccessMessageByRole(user.getRole()));
            response.setUtilisateurs(user);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur de connexion: " + e.getMessage());
        }

        return response;
    }

    /**
     * REFRESH TOKEN - Renouvellement du token JWT
     */
    public UserDto refreshToken(UserDto refreshTokenRequest) {
        UserDto response = new UserDto();

        try {
            String email = jwtUtils.extractUsername(refreshTokenRequest.getToken());
            Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (jwtUtils.isTokenValid(refreshTokenRequest.getToken(), user)) {
                String jwt = jwtUtils.generateToken(user);
                response.setStatusCode(200);
                response.setToken(jwt);
                response.setRefreshToken(refreshTokenRequest.getToken());
                response.setExpirationTime("24Hr");
                response.setMessage("Token renouvelé avec succès");
            }

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors du renouvellement: " + e.getMessage());
        }

        return response;
    }

    /**
     * ADMIN - Récupérer tous les utilisateurs
     */
    public UserDto getAllUsers() {
        UserDto response = new UserDto();

        try {
            List<Utilisateur> users = utilisateurRepository.findAll();
            if (!users.isEmpty()) {
                response.setUtilisateursList(users);
                response.setStatusCode(200);
                response.setMessage("Liste des utilisateurs récupérée avec succès");
            } else {
                response.setStatusCode(404);
                response.setMessage("Aucun utilisateur trouvé");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la récupération: " + e.getMessage());
        }

        return response;
    }

    /**
     * ADMIN - Récupérer un utilisateur par ID
     */
    public UserDto getUserById(Integer id) {
        UserDto response = new UserDto();

        try {
            Utilisateur user = utilisateurRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            response.setUtilisateurs(user);
            response.setStatusCode(200);
            response.setMessage("Utilisateur trouvé avec succès");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur: " + e.getMessage());
        }

        return response;
    }

    /**
     * ADMIN - Supprimer un utilisateur
     */
    public UserDto deleteUser(Integer userId) {
        UserDto response = new UserDto();

        try {
            if (utilisateurRepository.existsById(Long.valueOf(userId))) {
                utilisateurRepository.deleteById(Long.valueOf(userId));
                response.setStatusCode(200);
                response.setMessage("Utilisateur supprimé avec succès");
            } else {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la suppression: " + e.getMessage());
        }

        return response;
    }

    /**
     * ADMIN - Mettre à jour un utilisateur
     */
    public UserDto updateUser(Integer userId, Utilisateur updatedUser) {
        UserDto response = new UserDto();

        try {
            Optional<Utilisateur> userOptional = utilisateurRepository.findById(Long.valueOf(userId));
            if (userOptional.isPresent()) {
                Utilisateur existingUser = userOptional.get();
                existingUser.setEmail(updatedUser.getEmail());
                existingUser.setNom(updatedUser.getNom());
                existingUser.setPrenom(updatedUser.getPrenom());
                existingUser.setCin(updatedUser.getCin());
                existingUser.setRole(updatedUser.getRole());

                // Si un mot de passe est fourni, l'encoder et le mettre à jour
                if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                }

                Utilisateur savedUser = utilisateurRepository.save(existingUser);
                response.setUtilisateurs(savedUser);
                response.setStatusCode(200);
                response.setMessage("Utilisateur mis à jour avec succès");
            } else {
                response.setStatusCode(404);
                response.setMessage("Utilisateur non trouvé");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la mise à jour: " + e.getMessage());
        }

        return response;
    }

    /**
     * Récupérer les informations de l'utilisateur connecté
     */
    public UserDto getMyInfo(String email) {
        UserDto response = new UserDto();

        try {
            Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            response.setUtilisateurs(user);
            response.setStatusCode(200);
            response.setMessage("Informations récupérées avec succès");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Erreur: " + e.getMessage());
        }

        return response;
    }

    // ========== MÉTHODES PRIVÉES DE VALIDATION ==========

    private boolean isValidRole(String role) {
        try {
            UserRole.valueOf(role);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String validateRoleSpecificData(UserDto request) {
        switch (request.getRole()) {
            case "ADMIN":
                return validateAdminRegistration(request);
            case "CANDIDATE":
                return validateCandidateRegistration(request);
            case "EMPLOYER":
                return validateEmployerRegistration(request);
            default:
                return "Rôle non reconnu";
        }
    }

    private String validateAdminRegistration(UserDto request) {
        // Validation spécifique pour les administrateurs
        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            return "Le nom est obligatoire pour les administrateurs";
        }
        return null;
    }

    private String validateCandidateRegistration(UserDto request) {
        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            return "Le nom est obligatoire pour les candidats";
        }
        if (request.getPrenom() == null || request.getPrenom().trim().isEmpty()) {
            return "Le prénom est obligatoire pour les candidats";
        }
        return null;
    }

    private String validateEmployerRegistration(UserDto request) {
        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            return "Le nom de l'entreprise est obligatoire pour les employeurs";
        }
        return null;
    }

    private String getSuccessMessageByRole(String role) {
        switch (role) {
            case "ADMIN":
                return "Compte administrateur créé avec succès. Accès complet au système.";
            case "CANDIDATE":
                return "Compte candidat créé avec succès. Vous pouvez maintenant postuler aux offres.";
            case "EMPLOYER":
                return "Compte employeur créé avec succès. Vous pouvez publier des offres d'emploi.";
            default:
                return "Utilisateur créé avec succès";
        }
    }

    private String getLoginSuccessMessageByRole(String role) {
        switch (role) {
            case "ADMIN":
                return "Connexion administrateur réussie. Tableau de bord d'administration accessible.";
            case "CANDIDATE":
                return "Connexion candidat réussie. Explorez les offres disponibles.";
            case "EMPLOYER":
                return "Connexion employeur réussie. Gérez vos offres et candidatures.";
            default:
                return "Connexion réussie";
        }
    }
}

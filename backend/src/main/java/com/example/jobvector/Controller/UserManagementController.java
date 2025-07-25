package com.example.jobvector.Controller;

import com.example.jobvector.Dto.UserDto;
import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Service.UserManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    // ========== ROUTES PUBLIQUES (Visiteurs non connectés) ==========

    @PostMapping("/auth/register")
    public ResponseEntity<UserDto> register(@RequestBody UserDto registrationRequest){
        return ResponseEntity.ok(userManagementService.register(registrationRequest));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<UserDto> login(@RequestBody UserDto loginRequest){
        return ResponseEntity.ok(userManagementService.login(loginRequest));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<UserDto> refreshToken(@RequestBody UserDto refreshTokenRequest){
        return ResponseEntity.ok(userManagementService.refreshToken(refreshTokenRequest));
    }

    // ========== ROUTES ADMINISTRATEUR ==========

    @GetMapping("/api/admin/users")
    public ResponseEntity<UserDto> getAllUsers(){
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @GetMapping("/api/admin/users/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer userId){
        return ResponseEntity.ok(userManagementService.getUserById(userId));
    }

    @DeleteMapping("/api/admin/users/{userId}")
    public ResponseEntity<UserDto> deleteUser(@PathVariable Integer userId){
        return ResponseEntity.ok(userManagementService.deleteUser(userId));
    }

    @PutMapping("/api/admin/users/{userId}")
    public ResponseEntity<UserDto> updateUserByAdmin(@PathVariable Integer userId, @RequestBody Utilisateur updatedUser){
        return ResponseEntity.ok(userManagementService.updateUser(userId, updatedUser));
    }

    // ========== ROUTES COMMUNES (Tous utilisateurs connectés) ==========

    @GetMapping("/api/user/profile")
    public ResponseEntity<UserDto> getMyProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserDto response = userManagementService.getMyInfo(email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/api/user/profile")
    public ResponseEntity<UserDto> updateMyProfile(@RequestBody Utilisateur updatedUser){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Récupérer l'utilisateur actuel pour obtenir son ID
        UserDto currentUser = userManagementService.getMyInfo(email);
        if (currentUser.getStatusCode() != 200) {
            return ResponseEntity.status(currentUser.getStatusCode()).body(currentUser);
        }

        Integer userId = Math.toIntExact(currentUser.getUtilisateurs().getId());
        return ResponseEntity.ok(userManagementService.updateUser(userId, updatedUser));
    }


}

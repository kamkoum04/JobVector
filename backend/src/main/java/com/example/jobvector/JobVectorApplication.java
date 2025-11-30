package com.example.jobvector;

import com.example.jobvector.Model.Utilisateur;
import com.example.jobvector.Repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class JobVectorApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobVectorApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeAdmin(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin already exists
            if (utilisateurRepository.findByEmail("admin@jobvector.tn").isEmpty()) {
                Utilisateur admin = new Utilisateur();
                admin.setNom("Admin");
                admin.setPrenom("System");
                admin.setEmail("admin@jobvector.tn");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole("ADMIN");
                admin.setCin(0); // Default CIN for system admin
                
                utilisateurRepository.save(admin);
                System.out.println("✅ Default admin user created:");
                System.out.println("   Email: admin@jobvector.tn");
                System.out.println("   Password: Admin@123");
                System.out.println("   Role: ADMIN");
            } else {
                System.out.println("ℹ️  Admin user already exists");
            }
        };
    }

}

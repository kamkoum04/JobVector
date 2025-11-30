package com.example.jobvector.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS pour l'application JobVector
 * Permet les requêtes cross-origin depuis n'importe quelle origine
 * 
 * NOTE: En production, remplacez .allowedOrigins("*") par vos domaines spécifiques
 * Exemple: .allowedOrigins("https://votredomaine.com", "https://www.votredomaine.com")
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedOriginPatterns("*")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}

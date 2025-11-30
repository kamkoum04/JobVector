package com.example.jobvector.Config;

import com.example.jobvector.Service.UtilisateurdetaisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UtilisateurdetaisService UtilisateurService;
    @Autowired
    private JWTAuthFilter jwtAuthFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(request-> request
                        // Routes publiques - accès libre (ORDRE IMPORTANT)
                        .requestMatchers("/auth/**", "/public/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll() // Ajouter les routes de test
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll() // Health checks for Kubernetes
                        .requestMatchers("/actuator/info").permitAll()

                        // Routes pour les candidats
                        .requestMatchers("/api/candidate/**").hasAnyAuthority("CANDIDATE")

                        // Routes pour les employeurs
                        .requestMatchers("/api/employer/**").hasAnyAuthority("EMPLOYER")

                        // Routes pour les administrateurs uniquement
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Routes communes aux utilisateurs connectés
                        .requestMatchers("/api/user/**").hasAnyAuthority("ADMIN", "CANDIDATE", "EMPLOYER")

                        // Toutes les autres routes nécessitent une authentification
                        .anyRequest().authenticated())
                .sessionManagement(manager->manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }
    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(UtilisateurService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

}

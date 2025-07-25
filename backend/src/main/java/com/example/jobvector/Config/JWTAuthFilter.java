package com.example.jobvector.Config;


import com.example.jobvector.Service.UtilisateurdetaisService;
import com.example.jobvector.Config.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthFilter.class);

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private UtilisateurdetaisService utilisateurdetaisService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String userEmail;

        // Si pas d'en-tête Authorization, continuer sans authentification
        if (authHeader == null || authHeader.isBlank() || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwtToken = authHeader.substring(7);
            userEmail = jwtUtils.extractUsername(jwtToken);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = utilisateurdetaisService.loadUserByUsername(userEmail);

                if (jwtUtils.isTokenValid(jwtToken, userDetails)) {
                    SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    securityContext.setAuthentication(token);
                    SecurityContextHolder.setContext(securityContext);
                }
            }
        } catch (Exception e) {
            // Log l'erreur avec plus de détails
            logger.warn("Erreur lors du traitement du JWT pour la requête {}: {}", request.getRequestURI(), e.getMessage());

            // Nettoyer le contexte de sécurité en cas d'erreur
            SecurityContextHolder.clearContext();

            // Pour les requêtes API, on peut ajouter un header d'erreur
            if (request.getRequestURI().startsWith("/api/")) {
                response.setHeader("X-Auth-Error", "Token invalide ou expiré");
            }
        }

        filterChain.doFilter(request, response);
    }
}

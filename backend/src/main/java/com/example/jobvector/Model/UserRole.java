package com.example.jobvector.Model;

public enum UserRole {
    ADMIN("Administrateur - Gestion complète du système"),
    CANDIDATE("Candidat - Recherche d'emploi et candidatures"),
    EMPLOYER("Employeur - Publication d'offres et recrutement");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return this.name();
    }
}

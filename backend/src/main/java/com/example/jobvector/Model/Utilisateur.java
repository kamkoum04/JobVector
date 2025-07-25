package com.example.jobvector.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Utilisateur implements UserDetails {
   @Id
   @GeneratedValue(strategy = GenerationType.AUTO)
   private Long id;
   private String nom;
   private String prenom;
   private String email;
   private String password;
   private String role;
   private int cin;

   @Override
   public Collection<? extends GrantedAuthority> getAuthorities() {
      return List.of(new SimpleGrantedAuthority(role));
   }

   @Override
   public String getUsername() {
      return email;
   }

   @Override
   public boolean isAccountNonExpired() {
      return UserDetails.super.isAccountNonExpired();
   }

   @Override
   public boolean isAccountNonLocked() {
      return UserDetails.super.isAccountNonLocked();
   }

   @Override
   public boolean isCredentialsNonExpired() {
      return UserDetails.super.isCredentialsNonExpired();
   }

   @Override
   public boolean isEnabled() {
      return UserDetails.super.isEnabled();
   }
   
   // Relation avec CV (One-to-One)
   @OneToOne(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
   @JsonIgnore
   private Cv cv;
}

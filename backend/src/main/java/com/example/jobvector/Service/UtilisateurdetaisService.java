package com.example.jobvector.Service;



import com.example.jobvector.Repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UtilisateurdetaisService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository usersRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usersRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + username));
    }
}
// This class implements UserDetailsService to load user details by username.
// It uses the UtilisateurRepository to find the user by email, which is used as the username.
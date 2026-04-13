package com.example.server.auth;

import com.example.server.auth.dto.AuthPayload;
import com.example.server.auth.dto.AuthUserView;
import com.example.server.auth.dto.GoogleAuthRequest;
import com.example.server.auth.dto.LoginRequest;
import com.example.server.auth.dto.RegisterRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String googleClientId;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.google.client-id:}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
    }

    public void register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.USER;

        AppUser user = AppUser.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .department(resolveDepartment(request))
                .status("ACTIVE")
                .joinDate(LocalDate.now())
                .lastLogin(null)
                .googleAccount(false)
                .build();

        userRepository.save(user);
    }

    public AuthPayload login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        AppUser user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.isGoogleAccount()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Use Google Sign-In for this account");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthPayload(jwtService.generateToken(user), toUserView(user));
    }

    public AuthPayload loginWithGoogle(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.getIdToken());

        String email = normalizeEmail(payload.getEmail());
        String fullName = payload.get("name") instanceof String ? (String) payload.get("name") : "Google User";

        Optional<AppUser> existingUser = userRepository.findByEmailIgnoreCase(email);
        AppUser user = existingUser.orElseGet(() -> userRepository.save(
                AppUser.builder()
                        .name(fullName)
                        .email(email)
                        .passwordHash(null)
                        .role(UserRole.USER)
                        .department("General")
                        .status("ACTIVE")
                        .joinDate(LocalDate.now())
                        .lastLogin(null)
                        .googleAccount(true)
                        .build()
        ));

        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }

        user.setLastLogin(LocalDateTime.now());
        user = userRepository.save(user);

        return new AuthPayload(jwtService.generateToken(user), toUserView(user));
    }

    public AuthUserView getCurrentUserFromBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid authorization header");
        }

        String token = authorizationHeader.substring(7);
        if (!jwtService.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        String email = jwtService.extractEmail(token);
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return toUserView(user);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google Sign-In is not configured on server");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
            }

            return googleIdToken.getPayload();
        } catch (GeneralSecurityException | IOException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token verification failed");
        }
    }

    private AuthUserView toUserView(AppUser user) {
        return new AuthUserView(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String resolveDepartment(RegisterRequest request) {
        if (request.getFaculty() != null && !request.getFaculty().isBlank()) {
            return request.getFaculty().trim();
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            return request.getDepartment().trim();
        }

        return "General";
    }
}

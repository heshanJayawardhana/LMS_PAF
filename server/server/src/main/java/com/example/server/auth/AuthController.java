package com.example.server.auth;

import com.example.server.common.ApiResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, null, "User is not authenticated"));
        }

        Map<String, String> user = new HashMap<>();
        user.put("name", getDisplayName(authentication));
        user.put("email", getEmail(authentication));
        user.put("role", getRole(authentication));

        return ResponseEntity.ok(new ApiResponse<>(true, user, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> loginFallback() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, null, "Use Google OAuth sign-in"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerFallback() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, null, "Registration is not enabled for OAuth-only authentication"));
    }

    private String getDisplayName(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            String fullName = oauth2User.getAttribute("name");
            if (fullName != null && !fullName.isBlank()) {
                return fullName;
            }
        }
        return authentication.getName();
    }

    private String getEmail(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
        }
        return authentication.getName();
    }

    private String getRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .findFirst()
                .orElse("USER");
    }
}

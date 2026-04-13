package com.example.server.auth;

import com.example.server.auth.dto.AuthPayload;
import com.example.server.auth.dto.AuthUserView;
import com.example.server.auth.dto.GoogleAuthRequest;
import com.example.server.auth.dto.LoginRequest;
import com.example.server.auth.dto.RegisterRequest;
import com.example.server.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return new ApiResponse<>(true, null, "Registration successful");
    }

    @PostMapping("/login")
    public ApiResponse<AuthPayload> login(@Valid @RequestBody LoginRequest request) {
        AuthPayload payload = authService.login(request);
        return new ApiResponse<>(true, payload, "Login successful");
    }

    @PostMapping("/google")
    public ApiResponse<AuthPayload> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthPayload payload = authService.loginWithGoogle(request);
        return new ApiResponse<>(true, payload, "Google login successful");
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserView> me(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        AuthUserView user = authService.getCurrentUserFromBearerToken(authorizationHeader);
        return new ApiResponse<>(true, user, null);
    }
}

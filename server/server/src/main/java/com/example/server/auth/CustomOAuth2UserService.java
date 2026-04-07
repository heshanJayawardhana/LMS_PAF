package com.example.server.auth;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Value("${app.auth.admin-emails:}")
    private String adminEmails;

    @Value("${app.auth.technician-emails:}")
    private String technicianEmails;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user"), "Google account email is required");
        }

        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(resolveRole(email)));

        return new DefaultOAuth2User(authorities, oauth2User.getAttributes(), "email");
    }

    private String resolveRole(String email) {
        String normalizedEmail = email.toLowerCase();
        if (toEmailSet(adminEmails).contains(normalizedEmail)) {
            return "ROLE_ADMIN";
        }
        if (toEmailSet(technicianEmails).contains(normalizedEmail)) {
            return "ROLE_TECHNICIAN";
        }
        return "ROLE_USER";
    }

    private Set<String> toEmailSet(String csv) {
        if (csv == null || csv.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());
    }
}

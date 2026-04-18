package com.example.server.auth;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DemoUserInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureDemoUser("Student User", "student@campus.edu", "student123", UserRole.USER, "Computer Science");
        ensureDemoUser("Admin User", "admin@campus.edu", "admin123", UserRole.ADMIN, "Administration");
        ensureDemoUser("Tech User", "tech@campus.edu", "tech123", UserRole.TECHNICIAN, "IT Support");
    }

    private void ensureDemoUser(String name, String email, String rawPassword, UserRole role, String department) {
        AppUser user = userRepository.findByEmailIgnoreCase(email).orElseGet(AppUser::new);

        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setDepartment(department);
        user.setPhone(user.getPhone());
        user.setStudentId(defaultStudentId(user, role));
        user.setAcademicYear(defaultAcademicYear(user, role));
        user.setStatus("ACTIVE");
        user.setJoinDate(user.getJoinDate() != null ? user.getJoinDate() : LocalDate.now());
        user.setGoogleAccount(false);

        userRepository.save(user);
    }

    private String defaultStudentId(AppUser user, UserRole role) {
        if (user.getStudentId() != null && !user.getStudentId().isBlank()) {
            return user.getStudentId();
        }

        return role == UserRole.USER ? "IT2026001" : null;
    }

    private String defaultAcademicYear(AppUser user, UserRole role) {
        if (user.getAcademicYear() != null && !user.getAcademicYear().isBlank()) {
            return user.getAcademicYear();
        }

        return role == UserRole.USER ? "Year 3" : null;
    }
}

package com.example.server.admin;

import com.example.server.admin.dto.AdminUserRequest;
import com.example.server.admin.dto.AdminUserView;
import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.booking.BookingRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserView> getAll(String search, String role, String status) {
        return userRepository.findAll().stream()
                .filter(user -> matchesSearch(user, search))
                .filter(user -> role == null || role.isBlank() || "all".equalsIgnoreCase(role) || user.getRole().name().equalsIgnoreCase(role))
                .filter(user -> status == null || status.isBlank() || "all".equalsIgnoreCase(status) || safeStatus(user).equalsIgnoreCase(status))
                .map(this::toView)
                .toList();
    }

    public AdminUserView getById(String id) {
        return toView(getUser(id));
    }

    public AdminUserView create(AdminUserRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser user = AppUser.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode("TempPass123!"))
                .role(request.getRole())
                .department(request.getDepartment().trim())
                .phone(trimToNull(request.getPhone()))
                .studentId(request.getStudentId().trim())
                .academicYear(trimToNull(request.getAcademicYear()))
                .status(normalizeStatus(request.getStatus()))
                .joinDate(LocalDate.now())
                .lastLogin(null)
                .googleAccount(false)
                .build();

        return toView(userRepository.save(user));
    }

    public AdminUserView update(String id, AdminUserRequest request) {
        AppUser user = getUser(id);
        String normalizedEmail = normalizeEmail(request.getEmail());
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
                });

        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(trimToNull(request.getPhone()));
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment().trim());
        user.setStudentId(request.getStudentId().trim());
        user.setAcademicYear(trimToNull(request.getAcademicYear()));
        user.setStatus(normalizeStatus(request.getStatus()));

        return toView(userRepository.save(user));
    }

    public void delete(String id) {
        userRepository.delete(getUser(id));
    }

    public AdminUserView toggleStatus(String id) {
        AppUser user = getUser(id);
        user.setStatus("ACTIVE".equalsIgnoreCase(safeStatus(user)) ? "INACTIVE" : "ACTIVE");
        return toView(userRepository.save(user));
    }

    private AppUser getUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private AdminUserView toView(AppUser user) {
        return new AdminUserView(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getDepartment(),
                user.getStudentId(),
                safeStatus(user),
                user.getJoinDate(),
                user.getLastLogin(),
                bookingRepository.countByUserId(user.getId()),
                0
        );
    }

    private boolean matchesSearch(AppUser user, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String searchTerm = search.toLowerCase();
        return (user.getName() != null && user.getName().toLowerCase().contains(searchTerm))
                || (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm))
                || (user.getStudentId() != null && user.getStudentId().toLowerCase().contains(searchTerm));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeStatus(String status) {
        return status == null || status.isBlank() ? "ACTIVE" : status.trim().toUpperCase();
    }

    private String safeStatus(AppUser user) {
        return user.getStatus() == null || user.getStatus().isBlank() ? "ACTIVE" : user.getStatus();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

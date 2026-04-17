package com.example.server.admin.dto;

import com.example.server.auth.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminUserView {
    private String id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private String department;
    private String studentId;
    private String status;
    private LocalDate joinDate;
    private LocalDateTime lastLogin;
    private long bookingsCount;
    private long ticketsCount;
}

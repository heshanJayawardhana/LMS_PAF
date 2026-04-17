package com.example.server.admin.dto;

import com.example.server.auth.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    private String phone;

    @NotNull(message = "Role is required")
    private UserRole role;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "User ID is required")
    private String studentId;

    @NotBlank(message = "Status is required")
    private String status;

    private String academicYear;
}

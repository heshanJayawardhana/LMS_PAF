package com.example.server.auth.dto;

import com.example.server.auth.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthUserView {
    private String id;
    private String name;
    private String email;
    private UserRole role;
    private String department;
}

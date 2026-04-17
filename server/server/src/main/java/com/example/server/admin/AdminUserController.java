package com.example.server.admin;

import com.example.server.admin.dto.AdminUserRequest;
import com.example.server.admin.dto.AdminUserView;
import com.example.server.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<List<AdminUserView>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status
    ) {
        return new ApiResponse<>(true, adminUserService.getAll(search, role, status), null);
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserView> getUserById(@PathVariable String id) {
        return new ApiResponse<>(true, adminUserService.getById(id), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminUserView> createUser(@Valid @RequestBody AdminUserRequest request) {
        return new ApiResponse<>(true, adminUserService.create(request), "User created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminUserView> updateUser(@PathVariable String id, @Valid @RequestBody AdminUserRequest request) {
        return new ApiResponse<>(true, adminUserService.update(id, request), "User updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable String id) {
        adminUserService.delete(id);
        return new ApiResponse<>(true, null, "User deleted successfully");
    }

    @PostMapping("/{id}/toggle-status")
    public ApiResponse<AdminUserView> toggleUserStatus(@PathVariable String id) {
        return new ApiResponse<>(true, adminUserService.toggleStatus(id), "User status updated successfully");
    }
}

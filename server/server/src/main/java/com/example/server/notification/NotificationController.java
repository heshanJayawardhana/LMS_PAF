package com.example.server.notification;

import com.example.server.common.ApiResponse;
import com.example.server.notification.dto.CreateNotificationRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<Notification>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) Boolean unread
    ) {
        return new ApiResponse<>(true, notificationService.getForUser(getEmail(authentication), unread), null);
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(Authentication authentication) {
        return new ApiResponse<>(true, Map.of("count", notificationService.getUnreadCount(getEmail(authentication))), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Notification> createNotification(
            Authentication authentication,
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        requireAdmin(authentication);
        Notification notification = notificationService.createForRecipient(getEmail(authentication), request);
        return new ApiResponse<>(true, notification, "Notification created successfully");
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Notification> markAsRead(Authentication authentication, @PathVariable String id) {
        return new ApiResponse<>(true, notificationService.markAsRead(getEmail(authentication), id), "Notification marked as read");
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(getEmail(authentication));
        return new ApiResponse<>(true, null, "All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(Authentication authentication, @PathVariable String id) {
        notificationService.delete(getEmail(authentication), id);
        return new ApiResponse<>(true, null, "Notification deleted successfully");
    }

    private String getEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        return authentication.getName();
    }

    private void requireAdmin(Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is required");
        }
    }
}

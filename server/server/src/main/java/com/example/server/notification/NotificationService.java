package com.example.server.notification;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.notification.dto.CreateNotificationRequest;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getForUser(String email, Boolean unread) {
        AppUser user = getUserByEmail(email);

        if (Boolean.TRUE.equals(unread)) {
            return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(user.getId(), false);
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public long getUnreadCount(String email) {
        AppUser user = getUserByEmail(email);
        return notificationRepository.countByUserIdAndRead(user.getId(), false);
    }

    public Notification createForRecipient(String currentEmail, CreateNotificationRequest request) {
        String recipientEmail = request.getRecipientEmail() == null || request.getRecipientEmail().isBlank()
                ? currentEmail
                : request.getRecipientEmail();
        AppUser recipient = getUserByEmail(recipientEmail);

        Notification notification = Notification.builder()
                .userId(recipient.getId())
                .message(request.getMessage().trim())
                .type(request.getType().trim())
                .read(false)
                .relatedType(trimToNull(request.getRelatedType()))
                .relatedId(trimToNull(request.getRelatedId()))
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String email, String notificationId) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(user.getId(), notificationId);
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String email) {
        AppUser user = getUserByEmail(email);
        List<Notification> notifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(user.getId(), false);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void delete(String email, String notificationId) {
        AppUser user = getUserByEmail(email);
        Notification notification = getOwnedNotification(user.getId(), notificationId);
        notificationRepository.delete(notification);
    }

    private Notification getOwnedNotification(String userId, String notificationId) {
        return notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    private AppUser getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

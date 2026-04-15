package com.example.server.notification;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);

    long countByUserIdAndRead(String userId, boolean read);

    Optional<Notification> findByIdAndUserId(String id, String userId);
}

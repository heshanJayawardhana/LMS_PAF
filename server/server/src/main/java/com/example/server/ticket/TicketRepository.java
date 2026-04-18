package com.example.server.ticket;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Ticket> findByAssignedToUserIdOrderByCreatedAtDesc(String assignedToUserId);
}

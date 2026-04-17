package com.example.server.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    List<Ticket> findByStatus(String status);
    
    List<Ticket> findByPriority(String priority);
    
    List<Ticket> findByCategory(String category);
    
    List<Ticket> findByAssignedTo(String assignedTo);
    
    List<Ticket> findByRequestedBy(String requestedBy);
    
    List<Ticket> findByResourceId(String resourceId);
    
    List<Ticket> findByAssignedToEmail(String assignedToEmail);
    
    long countByStatus(String status);
    
    Optional<Ticket> findById(String id);
    
    void deleteById(String id);
}

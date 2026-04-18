package com.example.server.ticket.dto;

import com.example.server.ticket.TicketComment;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketResponse {
    private String id;
    private String category;
    private String description;
    private String priority;
    private String status;
    private String resource;
    private String resourceName;
    private String location;
    private String resourceLocation;
    private String requestedBy;
    private String requestedByEmail;
    private String assignedTo;
    private String assignedToName;
    private String assignedToEmail;
    private String email;
    private String phone;
    private List<String> attachments;
    private List<TicketComment> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

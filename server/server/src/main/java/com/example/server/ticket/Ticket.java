package com.example.server.ticket;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String requestedBy;

    private String category;

    private String description;

    private String priority;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String resource;

    private String location;

    private String email;

    private String phone;

    private String assignedToUserId;

    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

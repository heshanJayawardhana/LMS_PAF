package com.example.server.ticket;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {
    private String id;
    private String user;
    private String userEmail;
    private String message;
    private LocalDateTime createdAt;
}

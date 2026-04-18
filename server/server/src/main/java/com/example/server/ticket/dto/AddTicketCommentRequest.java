package com.example.server.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddTicketCommentRequest {
    @NotBlank(message = "Comment is required")
    private String comment;
}

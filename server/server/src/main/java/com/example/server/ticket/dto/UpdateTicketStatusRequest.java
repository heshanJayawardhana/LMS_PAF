package com.example.server.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}

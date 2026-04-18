package com.example.server.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Resource is required")
    private String resource;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;
}

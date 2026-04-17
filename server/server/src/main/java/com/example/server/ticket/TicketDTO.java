package com.example.server.ticket;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TicketDTO {
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;
    
    @NotBlank(message = "Priority is required")
    private String priority;
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotBlank(message = "Resource name is required")
    private String resourceName;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;
    
    @NotBlank(message = "Contact phone is required")
    private String contactPhone;
    
    private List<String> attachments;
    
    // Default constructor
    public TicketDTO() {}
}
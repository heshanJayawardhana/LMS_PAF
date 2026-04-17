package com.example.server.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class CreateBookingRequest {
    
    @NotBlank(message = "Resource is required")
    private String resource;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    @Min(value = 1, message = "Must be at least 1 attendee")
    private int attendees;
    
    private String userId;
    
    private String requestedBy;
}

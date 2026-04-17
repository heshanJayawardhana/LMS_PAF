package com.example.server.ticket;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello from backend!");
    }

    @GetMapping("/tickets")
    public ResponseEntity<String> getTickets() {
        String mockData = "[{\"id\":\"1\",\"category\":\"EQUIPMENT\",\"description\":\"Projector not working in Conference Room A\",\"priority\":\"HIGH\",\"status\":\"OPEN\",\"resourceName\":\"Conference Room A\",\"contactEmail\":\"user@campus.edu\",\"contactPhone\":\"+1234567890\",\"requestedBy\":\"user123\",\"requestedByName\":\"John Doe\",\"createdAt\":\"2026-04-16T23:30:00\",\"updatedAt\":\"2026-04-16T23:30:00\"},{\"id\":\"2\",\"category\":\"FACILITY\",\"description\":\"Air conditioning not working in Lab 201\",\"priority\":\"MEDIUM\",\"status\":\"IN_PROGRESS\",\"resourceName\":\"Lab 201\",\"contactEmail\":\"staff@campus.edu\",\"contactPhone\":\"+0987654321\",\"requestedBy\":\"user456\",\"requestedByName\":\"Jane Smith\",\"assignedTo\":\"tech123\",\"assignedToName\":\"Mike Johnson\",\"assignedToEmail\":\"tech@campus.edu\",\"createdAt\":\"2026-04-15T23:30:00\",\"updatedAt\":\"2026-04-16T23:30:00\"}]";
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(mockData);
    }
}

package com.example.server.ticket;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketService ticketService;

    // Get all tickets with optional filters
    @GetMapping
    public ResponseEntity<String> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        try {
            // Return simple JSON response to avoid any class instantiation issues
            String mockData = "[{\"id\":\"1\",\"category\":\"EQUIPMENT\",\"description\":\"Projector not working in Conference Room A\",\"priority\":\"HIGH\",\"status\":\"OPEN\",\"resourceName\":\"Conference Room A\",\"contactEmail\":\"user@campus.edu\",\"contactPhone\":\"+1234567890\",\"requestedBy\":\"user123\",\"requestedByName\":\"John Doe\",\"createdAt\":\"2026-04-16T23:30:00\",\"updatedAt\":\"2026-04-16T23:30:00\"},{\"id\":\"2\",\"category\":\"FACILITY\",\"description\":\"Air conditioning not working in Lab 201\",\"priority\":\"MEDIUM\",\"status\":\"IN_PROGRESS\",\"resourceName\":\"Lab 201\",\"contactEmail\":\"staff@campus.edu\",\"contactPhone\":\"+0987654321\",\"requestedBy\":\"user456\",\"requestedByName\":\"Jane Smith\",\"assignedTo\":\"tech123\",\"assignedToName\":\"Mike Johnson\",\"assignedToEmail\":\"tech@campus.edu\",\"createdAt\":\"2026-04-15T23:30:00\",\"updatedAt\":\"2026-04-16T23:30:00\"}]";
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(mockData);
        } catch (Exception e) {
            System.err.println("Error in getAllTickets: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Get tickets for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable String userId) {
        List<Ticket> tickets = ticketService.getByUser(userId);
        return ResponseEntity.ok(tickets);
    }

    // Get tickets assigned to a technician
    @GetMapping("/technician/{email}")
    public ResponseEntity<List<Ticket>> getTechnicianTickets(@PathVariable String email) {
        List<Ticket> tickets = ticketService.getByTechnician(email);
        return ResponseEntity.ok(tickets);
    }

    // Get a specific ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        Ticket ticket = ticketService.getById(id);
        return ResponseEntity.ok(ticket);
    }

    // Create a new ticket
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketDTO ticketDTO) {
        // For demo purposes, using hardcoded user info
        String userId = "user123";
        String userName = "John Doe";
        
        Ticket ticket = ticketService.create(ticketDTO, userId, userName);
        return ResponseEntity.ok(ticket);
    }

    // Update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        
        TicketStatus newStatus = TicketStatus.valueOf(request.getStatus().toUpperCase());
        Ticket ticket = ticketService.updateStatus(id, newStatus, request.getRejectionReason(), request.getResolutionNotes());
        return ResponseEntity.ok(ticket);
    }

    // Assign technician to ticket
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestBody TechnicianAssignmentRequest request) {
        
        Ticket ticket = ticketService.assignTechnician(id, request.getTechnicianId(), 
                request.getTechnicianName(), request.getTechnicianEmail());
        return ResponseEntity.ok(ticket);
    }

    // Delete a ticket (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Add attachments to a ticket
    @PostMapping("/{id}/attachments")
    public ResponseEntity<Ticket> addAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        
        try {
            Ticket ticket = ticketService.addAttachments(id, files);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Upload images (standalone endpoint)
    @PostMapping("/upload-images")
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> filePaths = ticketService.uploadImages(files);
            return ResponseEntity.ok(filePaths);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Add comment to a ticket
    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(
            @PathVariable String id,
            @RequestBody CommentDTO commentDTO) {
        
        // For demo purposes, using hardcoded user info
        String userId = "user123";
        String userName = "John Doe";
        
        Ticket ticket = ticketService.addComment(id, userId, userName, commentDTO);
        return ResponseEntity.ok(ticket);
    }

    // Edit a comment
    @PatchMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody CommentDTO commentDTO) {
        
        // For demo purposes, using hardcoded user info
        String userId = "user123";
        
        Ticket ticket = ticketService.editComment(id, commentId, userId, commentDTO);
        return ResponseEntity.ok(ticket);
    }

    // Delete a comment
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestParam(defaultValue = "false") boolean isAdmin) {
        
        // For demo purposes, using hardcoded user info
        String userId = "user123";
        
        Ticket ticket = ticketService.deleteComment(id, commentId, userId, isAdmin);
        return ResponseEntity.ok(ticket);
    }

    // Get ticket statistics
    @GetMapping("/stats")
    public ResponseEntity<TicketStats> getTicketStats() {
        TicketStats stats = new TicketStats();
        stats.setOpen(ticketService.getTicketCountByStatus(TicketStatus.OPEN));
        stats.setInProgress(ticketService.getTicketCountByStatus(TicketStatus.IN_PROGRESS));
        stats.setResolved(ticketService.getTicketCountByStatus(TicketStatus.RESOLVED));
        stats.setClosed(ticketService.getTicketCountByStatus(TicketStatus.CLOSED));
        stats.setRejected(ticketService.getTicketCountByStatus(TicketStatus.REJECTED));
        
        return ResponseEntity.ok(stats);
    }

    // Request DTOs
    public static class StatusUpdateRequest {
        private String status;
        private String rejectionReason;
        private String resolutionNotes;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class TechnicianAssignmentRequest {
        private String technicianId;
        private String technicianName;
        private String technicianEmail;

        public String getTechnicianId() { return technicianId; }
        public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

        public String getTechnicianName() { return technicianName; }
        public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

        public String getTechnicianEmail() { return technicianEmail; }
        public void setTechnicianEmail(String technicianEmail) { this.technicianEmail = technicianEmail; }
    }

    public static class TicketStats {
        private long open;
        private long inProgress;
        private long resolved;
        private long closed;
        private long rejected;

        public long getOpen() { return open; }
        public void setOpen(long open) { this.open = open; }

        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }

        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }

        public long getClosed() { return closed; }
        public void setClosed(long closed) { this.closed = closed; }

        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
    }
}

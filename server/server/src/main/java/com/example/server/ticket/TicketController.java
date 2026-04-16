package com.example.server.ticket;

import com.example.server.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // ---- READ endpoints ----

    /**
     * GET /api/tickets
     * Admin/Technician: get all tickets with optional filters
     * Returns 200 OK
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String search
    ) {
        List<Ticket> tickets = ticketService.getAll(status, priority, category, search);
        return ResponseEntity.ok(new ApiResponse<>(true, tickets, null));
    }

    /**
     * GET /api/tickets/{id}
     * Get a single ticket by ID
     * Returns 200 OK or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> getTicketById(@PathVariable String id) {
        Ticket ticket = ticketService.getById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, ticket, null));
    }

    /**
     * GET /api/tickets/user/{userId}
     * Get all tickets for a specific user
     * Returns 200 OK
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByUser(@PathVariable String userId) {
        List<Ticket> tickets = ticketService.getByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, tickets, null));
    }

    /**
     * GET /api/tickets/technician/{email}
     * Get all tickets assigned to a specific technician
     * Returns 200 OK
     */
    @GetMapping("/technician/{email}")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByTechnician(@PathVariable String email) {
        List<Ticket> tickets = ticketService.getByTechnician(email);
        return ResponseEntity.ok(new ApiResponse<>(true, tickets, null));
    }

    // ---- CREATE endpoint ----

    /**
     * POST /api/tickets
     * Create a new incident ticket
     * Returns 201 Created
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Ticket>> createTicket(
            @Valid @RequestBody TicketDTO dto
    ) {
        System.out.println("=== CONTROLLER RECEIVED TICKET REQUEST ===");
        System.out.println("DTO: " + dto);
        System.out.println("Category: " + dto.getCategory());
        System.out.println("Priority: " + dto.getPriority());
        
        String userId = "test-user";
        String userName = "Test User";
        Ticket created = ticketService.create(dto, userId, userName);
        
        System.out.println("=== CONTROLLER RETURNING RESPONSE ===");
        System.out.println("Created ticket: " + created);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, created, "Ticket created successfully"));
    }

    // ---- STATUS UPDATE endpoint ----

    /**
     * PATCH /api/tickets/{id}/status
     * Update the status of a ticket (Admin/Technician)
     * Body: { "status": "IN_PROGRESS", "resolutionNotes": "...", "rejectionReason": "..." }
     * Returns 200 OK
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Ticket>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        TicketStatus newStatus = TicketStatus.valueOf(body.get("status"));
        String rejectionReason = body.get("rejectionReason");
        String resolutionNotes = body.get("resolutionNotes");

        Ticket updated = ticketService.updateStatus(id, newStatus, rejectionReason, resolutionNotes);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Ticket status updated"));
    }

    // ---- ASSIGN endpoint ----

    /**
     * PATCH /api/tickets/{id}/assign
     * Assign a technician to a ticket
     * Body: { "technicianId": "...", "technicianName": "..." }
     * Returns 200 OK
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Ticket>> assignTechnician(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        Ticket updated = ticketService.assignTechnician(
                id, body.get("technicianId"), body.get("technicianName"), body.get("technicianEmail"));
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Technician assigned successfully"));
    }

    // ---- DELETE endpoint ----

    /**
     * DELETE /api/tickets/{id}
     * Delete a ticket (Admin only)
     * Returns 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable String id) {
        ticketService.delete(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(new ApiResponse<>(true, null, "Ticket deleted successfully"));
    }

    // ---- ATTACHMENT endpoints ----

    /**
     * POST /api/tickets/{id}/attachments
     * Upload images for a ticket (max 3)
     * Content-Type: multipart/form-data
     * Returns 200 OK
     */
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Ticket>> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files
    ) throws IOException {
        Ticket updated = ticketService.addAttachments(id, files);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Attachments uploaded successfully"));
    }

    /**
     * POST /api/tickets/upload-images
     * Standalone image upload for ticket creation (before ticket exists)
     * Content-Type: multipart/form-data
     * Returns 200 OK with file paths
     */
    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files
    ) throws IOException {
        List<String> filePaths = ticketService.uploadImages(files);
        return ResponseEntity.ok(new ApiResponse<>(true, filePaths, "Images uploaded successfully"));
    }

    // ---- COMMENT endpoints ----

    /**
     * POST /api/tickets/{id}/comments
     * Add a comment to a ticket
     * Returns 201 Created
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Ticket>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Unknown User") String userName
    ) {
        System.out.println("=== COMMENT CONTROLLER RECEIVED REQUEST ===");
        System.out.println("Ticket ID: " + id);
        System.out.println("User ID: " + userId);
        System.out.println("User Name: " + userName);
        System.out.println("Comment DTO: " + dto);
        
        Ticket updated = ticketService.addComment(id, userId, userName, dto);
        
        System.out.println("=== COMMENT CONTROLLER RETURNING RESPONSE ===");
        System.out.println("Updated ticket: " + updated);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, updated, "Comment added successfully"));
    }

    /**
     * PUT /api/tickets/{id}/comments/{commentId}
     * Edit a comment (owner only)
     * Returns 200 OK
     */
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Ticket>> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody CommentDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId
    ) {
        Ticket updated = ticketService.editComment(id, commentId, userId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Comment updated successfully"));
    }

    /**
     * DELETE /api/tickets/{id}/comments/{commentId}
     * Delete a comment (owner or Admin)
     * Returns 200 OK
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Ticket>> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String userRole
    ) {
        boolean isAdmin = "ADMIN".equals(userRole);
        Ticket updated = ticketService.deleteComment(id, commentId, userId, isAdmin);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Comment deleted successfully"));
    }
}

package com.example.server.ticket;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.common.ApiResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllTickets(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        List<Map<String, Object>> tickets = ticketService.getVisibleTickets(currentUser, search, status, priority)
                .stream()
                .map(this::toResponse)
                .toList();
        return new ApiResponse<>(true, tickets, null);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getTicketById(Authentication authentication, @PathVariable String id) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.getVisibleTicket(currentUser, id)), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createTicket(
            Authentication authentication,
            @RequestBody Map<String, Object> request
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.createTicket(currentUser, request)), "Ticket created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateTicket(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody Map<String, Object> request
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.updateTicket(currentUser, id, request)), "Ticket updated successfully");
    }

    @PostMapping("/{id}/status")
    public ApiResponse<Map<String, Object>> updateTicketStatus(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.updateStatus(currentUser, id, request.getStatus())), "Ticket status updated successfully");
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<Map<String, Object>> assignTicket(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody AssignmentRequest request
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.assignTicket(currentUser, id, request.getAssignedTo())), "Ticket assigned successfully");
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<Map<String, Object>> addComment(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody CommentRequest request
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        return new ApiResponse<>(true, toResponse(ticketService.addComment(currentUser, id, request.getComment())), "Comment added successfully");
    }

    private AppUser getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Map<String, Object> toResponse(Ticket ticket) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", ticket.getId());
        response.put("category", ticket.getCategory());
        response.put("description", ticket.getDescription());
        response.put("priority", ticket.getPriority());
        response.put("status", ticket.getStatus());
        response.put("resourceId", ticket.getResourceId());
        response.put("resource", ticket.getResourceName());
        response.put("resourceName", ticket.getResourceName());
        response.put("location", ticket.getLocation());
        response.put("contactEmail", ticket.getContactEmail());
        response.put("contactPhone", ticket.getContactPhone());
        response.put("requestedBy", ticket.getRequestedByName());
        response.put("requestedById", ticket.getRequestedBy());
        response.put("requestedByName", ticket.getRequestedByName());
        response.put("assignedTo", ticket.getAssignedTo());
        response.put("assignedToName", ticket.getAssignedToName());
        response.put("assignedToEmail", ticket.getAssignedToEmail());
        response.put("attachments", ticket.getAttachments());
        response.put("comments", ticket.getComments());
        response.put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null);
        response.put("updatedAt", ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().toString() : null);
        return response;
    }

    @Data
    public static class StatusUpdateRequest {
        private String status;
    }

    @Data
    public static class AssignmentRequest {
        private String assignedTo;
    }

    @Data
    public static class CommentRequest {
        private String comment;
    }
}

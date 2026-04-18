package com.example.server.ticket;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.common.ApiResponse;
import com.example.server.ticket.dto.AddTicketCommentRequest;
import com.example.server.ticket.dto.AssignTicketRequest;
import com.example.server.ticket.dto.CreateTicketRequest;
import com.example.server.ticket.dto.TicketResponse;
import com.example.server.ticket.dto.UpdateTicketStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ApiResponse<List<TicketResponse>> getAll(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority
    ) {
        return new ApiResponse<>(true, ticketService.getAllFor(getCurrentUser(authentication), search, status, priority), null);
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketResponse> getById(Authentication authentication, @PathVariable String id) {
        return new ApiResponse<>(true, ticketService.getById(getCurrentUser(authentication), id), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TicketResponse> create(Authentication authentication, @Valid @RequestBody CreateTicketRequest request) {
        return new ApiResponse<>(true, ticketService.create(getCurrentUser(authentication), request), "Ticket created successfully");
    }

    @PostMapping("/{id}/status")
    public ApiResponse<TicketResponse> updateStatus(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketStatusRequest request
    ) {
        return new ApiResponse<>(true, ticketService.updateStatus(getCurrentUser(authentication), id, request.getStatus()), "Ticket status updated successfully");
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<TicketResponse> assign(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody AssignTicketRequest request
    ) {
        return new ApiResponse<>(true, ticketService.assign(getCurrentUser(authentication), id, request.getAssignedTo()), "Ticket assigned successfully");
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<TicketResponse> addComment(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody AddTicketCommentRequest request
    ) {
        return new ApiResponse<>(true, ticketService.addComment(getCurrentUser(authentication), id, request.getComment()), "Comment added successfully");
    }

    private AppUser getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}

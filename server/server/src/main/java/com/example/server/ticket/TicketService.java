package com.example.server.ticket;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.auth.UserRole;
import com.example.server.notification.NotificationService;
import com.example.server.notification.dto.CreateNotificationRequest;
import com.example.server.ticket.dto.CreateTicketRequest;
import com.example.server.ticket.dto.TicketResponse;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<TicketResponse> getAllFor(AppUser currentUser, String search, String status, String priority) {
        List<Ticket> tickets = switch (currentUser.getRole()) {
            case ADMIN -> ticketRepository.findAll();
            case TECHNICIAN -> ticketRepository.findAll();
            case USER -> ticketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        };

        return tickets.stream()
                .filter(ticket -> matches(ticket, search, status, priority))
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public TicketResponse getById(AppUser currentUser, String id) {
        Ticket ticket = getTicket(id);
        ensureTicketAccess(currentUser, ticket);
        return toResponse(ticket);
    }

    public TicketResponse create(AppUser currentUser, CreateTicketRequest request) {
        Ticket ticket = Ticket.builder()
                .userId(currentUser.getId())
                .requestedBy(currentUser.getName())
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority().trim().toUpperCase())
                .status(TicketStatus.OPEN)
                .resource(request.getResource().trim())
                .location(request.getLocation().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone().trim())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        notifyAdminsAndTechnicians(saved, "New ticket submitted for " + saved.getResource() + ".", "info");
        return toResponse(saved);
    }

    public TicketResponse updateStatus(AppUser currentUser, String id, String statusValue) {
        if (currentUser.getRole() == UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff can update ticket status");
        }

        Ticket ticket = getTicket(id);
        TicketStatus nextStatus;
        try {
            nextStatus = TicketStatus.valueOf(statusValue.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket status");
        }

        ticket.setStatus(nextStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        String type = nextStatus == TicketStatus.RESOLVED ? "ticket_resolved" : "ticket_status_changed";
        notifyTicketOwner(saved, "Ticket #" + saved.getId() + " status changed to " + nextStatus + ".", type);
        return toResponse(saved);
    }

    public TicketResponse assign(AppUser currentUser, String id, String requestedAssignee) {
        if (currentUser.getRole() == UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff can assign tickets");
        }

        Ticket ticket = getTicket(id);
        AppUser assignee = resolveAssignee(currentUser, requestedAssignee);

        ticket.setAssignedToUserId(assignee.getId());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        notifyTicketOwner(saved, "Ticket #" + saved.getId() + " has been assigned to a technician.", "ticket_assigned");
        return toResponse(saved);
    }

    public TicketResponse addComment(AppUser currentUser, String id, String message) {
        Ticket ticket = getTicket(id);
        ensureTicketAccess(currentUser, ticket);

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .user(currentUser.getName())
                .userEmail(currentUser.getEmail())
                .message(message.trim())
                .createdAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        AppUser recipient = resolveCommentRecipient(currentUser, saved);
        if (recipient != null) {
            CreateNotificationRequest request = new CreateNotificationRequest();
            request.setRecipientEmail(recipient.getEmail());
            request.setMessage("New comment on ticket #" + saved.getId() + ".");
            request.setType("ticket_comment");
            request.setRelatedType("TICKET");
            request.setRelatedId(saved.getId());
            notificationService.createForRecipient(currentUser.getEmail(), request);
        }

        return toResponse(saved);
    }

    private Ticket getTicket(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private void ensureTicketAccess(AppUser currentUser, Ticket ticket) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            return;
        }

        if (!currentUser.getId().equals(ticket.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this ticket");
        }
    }

    private boolean matches(Ticket ticket, String search, String status, String priority) {
        boolean matchesSearch = search == null || search.isBlank()
                || ticket.getDescription().toLowerCase().contains(search.toLowerCase())
                || ticket.getResource().toLowerCase().contains(search.toLowerCase())
                || ticket.getRequestedBy().toLowerCase().contains(search.toLowerCase());
        boolean matchesStatus = status == null || status.isBlank() || "all".equalsIgnoreCase(status)
                || ticket.getStatus().name().equalsIgnoreCase(status);
        boolean matchesPriority = priority == null || priority.isBlank() || "all".equalsIgnoreCase(priority)
                || ticket.getPriority().equalsIgnoreCase(priority);
        return matchesSearch && matchesStatus && matchesPriority;
    }

    private TicketResponse toResponse(Ticket ticket) {
        AppUser requester = userRepository.findById(ticket.getUserId()).orElse(null);
        AppUser assignee = ticket.getAssignedToUserId() == null ? null : userRepository.findById(ticket.getAssignedToUserId()).orElse(null);

        return TicketResponse.builder()
                .id(ticket.getId())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus().name())
                .resource(ticket.getResource())
                .resourceName(ticket.getResource())
                .location(ticket.getLocation())
                .resourceLocation(ticket.getLocation())
                .requestedBy(ticket.getRequestedBy())
                .requestedByEmail(requester != null ? requester.getEmail() : ticket.getEmail())
                .assignedTo(assignee != null ? assignee.getName() : null)
                .assignedToName(assignee != null ? assignee.getName() : null)
                .assignedToEmail(assignee != null ? assignee.getEmail() : null)
                .email(ticket.getEmail())
                .phone(ticket.getPhone())
                .attachments(ticket.getAttachments())
                .comments(ticket.getComments())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private void notifyTicketOwner(Ticket ticket, String message, String type) {
        userRepository.findById(ticket.getUserId()).ifPresent(user -> {
            CreateNotificationRequest request = new CreateNotificationRequest();
            request.setRecipientEmail(user.getEmail());
            request.setMessage(message);
            request.setType(type);
            request.setRelatedType("TICKET");
            request.setRelatedId(ticket.getId());
            notificationService.createForRecipient(user.getEmail(), request);
        });
    }

    private void notifyAdminsAndTechnicians(Ticket ticket, String message, String type) {
        List<AppUser> recipients = userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN)
                .toList();

        for (AppUser recipient : recipients) {
            CreateNotificationRequest request = new CreateNotificationRequest();
            request.setRecipientEmail(recipient.getEmail());
            request.setMessage(message);
            request.setType(type);
            request.setRelatedType("TICKET");
            request.setRelatedId(ticket.getId());
            notificationService.createForRecipient(recipient.getEmail(), request);
        }
    }

    private AppUser resolveAssignee(AppUser currentUser, String requestedAssignee) {
        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            return currentUser;
        }

        if (requestedAssignee == null || requestedAssignee.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee is required");
        }

        return userRepository.findById(requestedAssignee)
                .or(() -> userRepository.findByEmailIgnoreCase(requestedAssignee))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee not found"));
    }

    private AppUser resolveCommentRecipient(AppUser currentUser, Ticket ticket) {
        if (currentUser.getId().equals(ticket.getUserId())) {
            if (ticket.getAssignedToUserId() == null) {
                return null;
            }
            return userRepository.findById(ticket.getAssignedToUserId()).orElse(null);
        }

        return userRepository.findById(ticket.getUserId()).orElse(null);
    }
}

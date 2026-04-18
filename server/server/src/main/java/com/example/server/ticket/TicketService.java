package com.example.server.ticket;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.auth.UserRole;
import com.example.server.notification.Notification;
import com.example.server.notification.NotificationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public List<Ticket> getVisibleTickets(AppUser currentUser, String search, String status, String priority) {
        return baseTicketSet(currentUser).stream()
                .filter(ticket -> matches(ticket, search, status, priority))
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Ticket getVisibleTicket(AppUser currentUser, String id) {
        Ticket ticket = getById(id);
        ensureAccess(currentUser, ticket);
        return ticket;
    }

    public Ticket createTicket(AppUser currentUser, Map<String, Object> request) {
        Ticket ticket = new Ticket();
        ticket.setCategory(normalizeText(readString(request, "category"), "FACILITY"));
        ticket.setDescription(required(readString(request, "description"), "Description is required"));
        ticket.setPriority(normalizeText(readString(request, "priority"), "MEDIUM"));

        String resourceName = firstNonBlank(readString(request, "resourceName"), readString(request, "resource"));
        resourceName = required(resourceName, "Resource is required");
        ticket.setResourceId(resourceName);
        ticket.setResourceName(resourceName);
        ticket.setLocation(readString(request, "location"));
        ticket.setContactEmail(firstNonBlank(readString(request, "contactEmail"), readString(request, "email"), currentUser.getEmail()));
        ticket.setContactPhone(firstNonBlank(readString(request, "contactPhone"), readString(request, "phone"), currentUser.getPhone()));
        ticket.setRequestedBy(currentUser.getId());
        ticket.setRequestedByName(currentUser.getName());
        ticket.setStatus(TicketStatus.OPEN.name());
        ticket.setAttachments(stringList(request.get("attachments")));
        ticket.setComments(new ArrayList<>());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        createNotification(currentUser,
                "Your ticket for " + savedTicket.getResourceName() + " was created.",
                "ticket_created",
                "ticket",
                savedTicket.getId());

        notifyRoles(Set.of(UserRole.ADMIN, UserRole.TECHNICIAN), currentUser.getId(),
                "New ticket submitted for " + savedTicket.getResourceName() + ".",
                "ticket_created",
                savedTicket.getId());

        return savedTicket;
    }

    public Ticket updateTicket(AppUser currentUser, String id, Map<String, Object> request) {
        Ticket ticket = getById(id);
        ensureAccess(currentUser, ticket);

        if (!isPrivileged(currentUser) && !Objects.equals(ticket.getRequestedBy(), currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this ticket");
        }

        String category = readString(request, "category");
        if (hasText(category)) {
            ticket.setCategory(normalizeText(category, ticket.getCategory()));
        }

        String description = readString(request, "description");
        if (hasText(description)) {
            ticket.setDescription(description.trim());
        }

        String priority = readString(request, "priority");
        if (hasText(priority)) {
            ticket.setPriority(normalizeText(priority, ticket.getPriority()));
        }

        String resourceName = firstNonBlank(readString(request, "resourceName"), readString(request, "resource"));
        if (hasText(resourceName)) {
            ticket.setResourceId(resourceName.trim());
            ticket.setResourceName(resourceName.trim());
        }

        String location = readString(request, "location");
        if (location != null) {
            ticket.setLocation(location.trim());
        }

        String email = firstNonBlank(readString(request, "contactEmail"), readString(request, "email"));
        if (hasText(email)) {
            ticket.setContactEmail(email.trim());
        }

        String phone = firstNonBlank(readString(request, "contactPhone"), readString(request, "phone"));
        if (hasText(phone)) {
            ticket.setContactPhone(phone.trim());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket updateStatus(AppUser currentUser, String id, String status) {
        ensurePrivileged(currentUser);

        Ticket ticket = getById(id);
        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(required(status, "Status is required").trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket status");
        }

        ticket.setStatus(newStatus.name());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        if (!Objects.equals(ticket.getRequestedBy(), currentUser.getId())) {
            notifyUserId(ticket.getRequestedBy(),
                    "Ticket " + readableTicketId(ticket.getId()) + " status changed to " + savedTicket.getStatus() + ".",
                    "ticket_status_changed",
                    savedTicket.getId());
        }

        return savedTicket;
    }

    public Ticket assignTicket(AppUser currentUser, String id, String assignedToUserId) {
        ensurePrivileged(currentUser);

        Ticket ticket = getById(id);
        AppUser assignee = userRepository.findById(firstNonBlank(assignedToUserId, currentUser.getId()))
                .orElse(currentUser);

        ticket.setAssignedTo(assignee.getId());
        ticket.setAssignedToName(assignee.getName());
        ticket.setAssignedToEmail(assignee.getEmail());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        if (!Objects.equals(ticket.getRequestedBy(), currentUser.getId())) {
            notifyUserId(ticket.getRequestedBy(),
                    "Ticket " + readableTicketId(ticket.getId()) + " has been assigned to a technician.",
                    "ticket_assigned",
                    savedTicket.getId());
        }

        if (!Objects.equals(assignee.getId(), currentUser.getId())) {
            createNotification(assignee,
                    "You have been assigned ticket " + readableTicketId(ticket.getId()) + ".",
                    "ticket_assigned",
                    "ticket",
                    savedTicket.getId());
        }

        return savedTicket;
    }

    public Ticket addComment(AppUser currentUser, String id, String commentMessage) {
        Ticket ticket = getById(id);
        ensureAccess(currentUser, ticket);

        String cleanComment = required(commentMessage, "Comment is required").trim();
        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }

        ticket.getComments().add(new Ticket.Comment(cleanComment, currentUser.getName()));
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        if (Objects.equals(ticket.getRequestedBy(), currentUser.getId())) {
            if (hasText(ticket.getAssignedTo())) {
                notifyUserId(ticket.getAssignedTo(),
                        "New comment on ticket " + readableTicketId(ticket.getId()) + ".",
                        "ticket_comment",
                        savedTicket.getId());
            } else {
                notifyRoles(Set.of(UserRole.ADMIN, UserRole.TECHNICIAN), currentUser.getId(),
                        "New comment on ticket " + readableTicketId(ticket.getId()) + ".",
                        "ticket_comment",
                        savedTicket.getId());
            }
        } else {
            notifyUserId(ticket.getRequestedBy(),
                    "New comment on ticket " + readableTicketId(ticket.getId()) + ".",
                    "ticket_comment",
                    savedTicket.getId());
        }

        return savedTicket;
    }

    private List<Ticket> baseTicketSet(AppUser currentUser) {
        if (isPrivileged(currentUser)) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findByRequestedBy(currentUser.getId());
    }

    private boolean matches(Ticket ticket, String search, String status, String priority) {
        boolean matchesSearch = !hasText(search)
                || containsIgnoreCase(ticket.getDescription(), search)
                || containsIgnoreCase(ticket.getResourceName(), search)
                || containsIgnoreCase(ticket.getRequestedByName(), search)
                || containsIgnoreCase(ticket.getCategory(), search);

        boolean matchesStatus = !hasText(status)
                || "all".equalsIgnoreCase(status)
                || Objects.equals(ticket.getStatus(), status.toUpperCase());

        boolean matchesPriority = !hasText(priority)
                || "all".equalsIgnoreCase(priority)
                || Objects.equals(ticket.getPriority(), priority.toUpperCase());

        return matchesSearch && matchesStatus && matchesPriority;
    }

    private void ensureAccess(AppUser currentUser, Ticket ticket) {
        if (isPrivileged(currentUser)) {
            return;
        }

        if (!Objects.equals(ticket.getRequestedBy(), currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this ticket");
        }
    }

    private void ensurePrivileged(AppUser currentUser) {
        if (!isPrivileged(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins or technicians can perform this action");
        }
    }

    private boolean isPrivileged(AppUser currentUser) {
        return currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.TECHNICIAN;
    }

    private Ticket getById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private void notifyRoles(Set<UserRole> roles, String actorUserId, String message, String type, String ticketId) {
        userRepository.findAll().stream()
                .filter(user -> roles.contains(user.getRole()))
                .filter(user -> !Objects.equals(user.getId(), actorUserId))
                .forEach(user -> createNotification(user, message, type, "ticket", ticketId));
    }

    private void notifyUserId(String userId, String message, String type, String ticketId) {
        if (!hasText(userId)) {
            return;
        }

        userRepository.findById(userId)
                .ifPresent(user -> createNotification(user, message, type, "ticket", ticketId));
    }

    private void createNotification(AppUser user, String message, String type, String relatedType, String relatedId) {
        notificationRepository.save(Notification.builder()
                .userId(user.getId())
                .message(message)
                .type(type)
                .read(false)
                .relatedType(relatedType)
                .relatedId(relatedId)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private List<String> stringList(Object rawValue) {
        if (!(rawValue instanceof List<?> rawList)) {
            return new ArrayList<>();
        }

        return rawList.stream()
                .filter(Objects::nonNull)
                .map(Object::toString)
                .toList();
    }

    private String readString(Map<String, Object> request, String key) {
        Object value = request.get(key);
        return value == null ? null : value.toString();
    }

    private String required(String value, String message) {
        if (!hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private String normalizeText(String value, String fallback) {
        return firstNonBlank(value, fallback).toUpperCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean containsIgnoreCase(String source, String target) {
        return source != null && target != null && source.toLowerCase().contains(target.toLowerCase());
    }

    private String readableTicketId(String ticketId) {
        if (!hasText(ticketId)) {
            return "TKT-0000";
        }
        String cleanId = ticketId.trim();
        String suffix = cleanId.length() > 6 ? cleanId.substring(cleanId.length() - 6) : cleanId;
        return "TKT-" + suffix.toUpperCase();
    }
}

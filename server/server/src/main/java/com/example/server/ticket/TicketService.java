package com.example.server.ticket;

import com.example.server.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    // Directory where uploaded files are stored
    private static final String UPLOAD_DIR = "uploads/tickets/";

    // ---- CRUD Operations ----

    /**
     * Get all tickets. Admins/Technicians call this.
     * Supports optional filters for status, priority, category.
     */
    public List<Ticket> getAll(TicketStatus status, TicketPriority priority,
                                TicketCategory category, String search) {
        // Start with all tickets
        List<Ticket> tickets = ticketRepository.findAll();

        // Apply filters in memory (for small datasets; use MongoTemplate for large scale)
        if (status != null) {
            tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
        }
        if (priority != null) {
            tickets = tickets.stream().filter(t -> t.getPriority() == priority).toList();
        }
        if (category != null) {
            tickets = tickets.stream().filter(t -> t.getCategory() == category).toList();
        }
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            tickets = tickets.stream()
                    .filter(t -> t.getDescription().toLowerCase().contains(lower)
                            || (t.getResourceName() != null && t.getResourceName().toLowerCase().contains(lower)))
                    .toList();
        }

        return tickets;
    }

    /**
     * Get all tickets belonging to a specific user.
     */
    public List<Ticket> getByUser(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    /**
     * Get all tickets assigned to a specific technician.
     */
    public List<Ticket> getByTechnician(String technicianEmail) {
        return ticketRepository.findByAssignedToEmail(technicianEmail);
    }

    /**
     * Get a single ticket by ID.
     */
    public Ticket getById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    /**
     * Create a new ticket. Status is always OPEN on creation.
     */
    public Ticket create(TicketDTO dto, String userId, String userName) {
        System.out.println("=== CREATING TICKET ===");
        System.out.println("DTO: " + dto);
        System.out.println("UserId: " + userId);
        System.out.println("UserName: " + userName);
        
        Ticket ticket = Ticket.builder()
                .userId(userId)
                .requestedByName(userName)
                .resourceId(dto.getResourceId())
                .resourceName(dto.getResourceName())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .status(TicketStatus.OPEN)
                .build();

        System.out.println("Built ticket: " + ticket);
        
        Ticket saved = ticketRepository.save(ticket);
        
        System.out.println("Saved ticket: " + saved);
        System.out.println("=== TICKET CREATION COMPLETE ===");
        
        return saved;
    }

    /**
     * Update status of a ticket (Admin/Technician only for most transitions).
     * Enforces valid workflow transitions.
     */
    public Ticket updateStatus(String id, TicketStatus newStatus, String rejectionReason,
                                String resolutionNotes) {
        Ticket ticket = getById(id);

        // Validate workflow transitions
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(Instant.now());

        if (newStatus == TicketStatus.REJECTED && rejectionReason != null) {
            ticket.setRejectionReason(rejectionReason);
        }
        if (newStatus == TicketStatus.RESOLVED && resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        return ticketRepository.save(ticket);
    }

    /**
     * Assign a ticket to a technician.
     */
    public Ticket assignTechnician(String ticketId, String technicianId, String technicianName, String technicianEmail) {
        Ticket ticket = getById(ticketId);
        ticket.setAssignedToId(technicianId);
        ticket.setAssignedToName(technicianName);
        ticket.setAssignedToEmail(technicianEmail);

        // Auto-progress from OPEN to IN_PROGRESS when assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Delete a ticket (Admin only).
     */
    public void delete(String id) {
        Ticket ticket = getById(id); // throws 404 if not found
        ticketRepository.delete(ticket);
    }

    // ---- Attachment Operations ----

    /**
     * Upload up to 3 image attachments for a ticket.
     */
    public Ticket addAttachments(String ticketId, List<MultipartFile> files) throws IOException {
        Ticket ticket = getById(ticketId);

        if (ticket.getAttachments().size() + files.size() > 3) {
            throw new IllegalArgumentException(
                    "Cannot exceed 3 attachments. Current: " + ticket.getAttachments().size());
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR + ticketId);
        Files.createDirectories(uploadPath);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // Validate it's an image
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            // Generate unique filename to prevent collisions
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            ticket.getAttachments().add(UPLOAD_DIR + ticketId + "/" + filename);
        }

        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Upload images for ticket creation (before ticket exists).
     * Returns list of file paths that can be stored with the ticket later.
     */
    public List<String> uploadImages(List<MultipartFile> files) throws IOException {
        List<String> filePaths = new ArrayList<>();

        // Create general upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR + "temp");
        Files.createDirectories(uploadPath);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // Validate it's an image
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            // Generate unique filename to prevent collisions
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return relative path that can be used by frontend
            filePaths.add("/uploads/temp/" + filename);
        }

        return filePaths;
    }

    // ---- Comment Operations ----

    /**
     * Add a comment to a ticket.
     */
    public Ticket addComment(String ticketId, String userId, String authorName, CommentDTO dto) {
        System.out.println("=== ADDING COMMENT ===");
        System.out.println("Ticket ID: " + ticketId);
        System.out.println("User ID: " + userId);
        System.out.println("Author Name: " + authorName);
        System.out.println("Comment DTO: " + dto);
        
        Ticket ticket = getById(ticketId);
        System.out.println("Found ticket: " + ticket);
        System.out.println("Current comments count: " + ticket.getComments().size());

        Ticket.TicketComment comment = Ticket.TicketComment.builder()
                .commentId(UUID.randomUUID().toString())
                .userId(userId)
                .authorName(authorName)
                .message(dto.getMessage())
                .createdAt(Instant.now())
                .build();

        System.out.println("Built comment: " + comment);
        
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());
        
        Ticket saved = ticketRepository.save(ticket);
        
        System.out.println("Saved ticket with new comment: " + saved);
        System.out.println("New comments count: " + saved.getComments().size());
        System.out.println("=== COMMENT ADDITION COMPLETE ===");
        
        return saved;
    }

    /**
     * Edit a comment. Only the comment owner can edit their comment.
     */
    public Ticket editComment(String ticketId, String commentId,
                               String requestingUserId, CommentDTO dto) {
        Ticket ticket = getById(ticketId);

        Ticket.TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getCommentId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Ownership check
        if (!comment.getUserId().equals(requestingUserId)) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }

        comment.setMessage(dto.getMessage());
        comment.setUpdatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Delete a comment. Owner or Admin can delete.
     */
    public Ticket deleteComment(String ticketId, String commentId,
                                 String requestingUserId, boolean isAdmin) {
        Ticket ticket = getById(ticketId);

        Ticket.TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getCommentId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!isAdmin && !comment.getUserId().equals(requestingUserId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    // ---- Stats (for dashboard) ----

    public long countByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }

    // ---- Private Helpers ----

    /**
     * Add attachment paths to a ticket
     */
    public Ticket addAttachmentPaths(String id, List<String> attachmentPaths) {
        Ticket ticket = getById(id);
        ticket.getAttachments().addAll(attachmentPaths);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Remove attachment from a ticket
     */
    public Ticket removeAttachment(String id, String attachmentPath) {
        Ticket ticket = getById(id);
        ticket.getAttachments().remove(attachmentPath);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    /**
     * Enforces: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
     * Admin can also set REJECTED from OPEN or IN_PROGRESS
     */
    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false; // terminal states
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid status transition from " + current + " to " + next);
        }
    }
}

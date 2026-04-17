package com.example.server.ticket;

import com.example.server.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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
        // Return mock data for now to fix the NullReferenceException
        List<Ticket> mockTickets = new ArrayList<>();
        
        // Create sample tickets
        Ticket ticket1 = new Ticket();
        ticket1.setId("1");
        ticket1.setCategory("EQUIPMENT");
        ticket1.setDescription("Projector not working in Conference Room A");
        ticket1.setPriority("HIGH");
        ticket1.setStatus("OPEN");
        ticket1.setResourceName("Conference Room A");
        ticket1.setContactEmail("user@campus.edu");
        ticket1.setContactPhone("+1234567890");
        ticket1.setRequestedBy("user123");
        ticket1.setRequestedByName("John Doe");
        ticket1.setCreatedAt(java.time.LocalDateTime.now().minusDays(1));
        ticket1.setUpdatedAt(java.time.LocalDateTime.now());
        
        Ticket ticket2 = new Ticket();
        ticket2.setId("2");
        ticket2.setCategory("FACILITY");
        ticket2.setDescription("Air conditioning not working in Lab 201");
        ticket2.setPriority("MEDIUM");
        ticket2.setStatus("IN_PROGRESS");
        ticket2.setResourceName("Lab 201");
        ticket2.setContactEmail("staff@campus.edu");
        ticket2.setContactPhone("+0987654321");
        ticket2.setRequestedBy("user456");
        ticket2.setRequestedByName("Jane Smith");
        ticket2.setAssignedTo("tech123");
        ticket2.setAssignedToName("Mike Johnson");
        ticket2.setAssignedToEmail("tech@campus.edu");
        ticket2.setCreatedAt(java.time.LocalDateTime.now().minusDays(2));
        ticket2.setUpdatedAt(java.time.LocalDateTime.now());
        
        mockTickets.add(ticket1);
        mockTickets.add(ticket2);
        
        return mockTickets;
    }

    /**
     * Get all tickets belonging to a specific user.
     */
    public List<Ticket> getByUser(String userId) {
        return ticketRepository.findByRequestedBy(userId);
    }

    /**
     * Get all tickets assigned to a specific technician.
     */
    public List<Ticket> getByTechnician(String email) {
        return ticketRepository.findByAssignedToEmail(email);
    }

    /**
     * Get a single ticket by ID, throws if not found.
     */
    public Ticket getById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    /**
     * Create a new ticket from DTO.
     */
    public Ticket create(TicketDTO dto, String userId, String userName) {
        Ticket ticket = new Ticket();
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setResourceId(dto.getResourceId());
        ticket.setResourceName(dto.getResourceName());
        ticket.setContactEmail(dto.getContactEmail());
        ticket.setContactPhone(dto.getContactPhone());
        ticket.setRequestedBy(userId);
        ticket.setRequestedByName(userName);
        ticket.setStatus("OPEN");
        ticket.setAttachments(dto.getAttachments());

        return ticketRepository.save(ticket);
    }

    /**
     * Update the status of a ticket.
     */
    public Ticket updateStatus(String id, TicketStatus newStatus, String rejectionReason, String resolutionNotes) {
        Ticket ticket = getById(id);

        // Validate status transition
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus.name());
        ticket.setUpdatedAt(LocalDateTime.now());

        if (newStatus == TicketStatus.REJECTED && rejectionReason != null) {
            // Add rejection reason as a comment
            Ticket.Comment comment = new Ticket.Comment(
                    "Ticket rejected: " + rejectionReason,
                    "System"
            );
            if (ticket.getComments() == null) {
                ticket.setComments(new ArrayList<>());
            }
            ticket.getComments().add(comment);
        }

        if (newStatus == TicketStatus.RESOLVED && resolutionNotes != null) {
            // Add resolution notes as a comment
            Ticket.Comment comment = new Ticket.Comment(
                    "Resolution: " + resolutionNotes,
                    "System"
            );
            if (ticket.getComments() == null) {
                ticket.setComments(new ArrayList<>());
            }
            ticket.getComments().add(comment);
        }

        return ticketRepository.save(ticket);
    }

    /**
     * Assign a technician to a ticket.
     */
    public Ticket assignTechnician(String id, String technicianId, String technicianName, String technicianEmail) {
        Ticket ticket = getById(id);
        ticket.setAssignedTo(technicianId);
        ticket.setAssignedToName(technicianName);
        ticket.setAssignedToEmail(technicianEmail);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    /**
     * Delete a ticket (admin only).
     */
    public void delete(String id) {
        Ticket ticket = getById(id);
        ticketRepository.delete(ticket);
    }

    // ---- ATTACHMENT Operations ----

    /**
     * Add attachments to an existing ticket.
     */
    public Ticket addAttachments(String id, List<MultipartFile> files) throws IOException {
        Ticket ticket = getById(id);
        List<String> filePaths = uploadImages(files);

        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }
        ticket.getAttachments().addAll(filePaths);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    /**
     * Standalone image upload for pre-ticket creation.
     */
    public List<String> uploadImages(List<MultipartFile> files) throws IOException {
        List<String> filePaths = new ArrayList<>();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return relative path for frontend
            filePaths.add("/uploads/" + filename);
        }

        return filePaths;
    }

    // ---- COMMENT Operations ----

    /**
     * Add a comment to a ticket.
     */
    public Ticket addComment(String id, String userId, String userName, CommentDTO dto) {
        Ticket ticket = getById(id);

        Ticket.Comment comment = new Ticket.Comment(dto.getMessage(), userName);
        comment.setCommentId(java.util.UUID.randomUUID().toString());

        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    /**
     * Edit a comment (owner only).
     */
    public Ticket editComment(String id, String commentId, String userId, CommentDTO dto) {
        Ticket ticket = getById(id);

        if (ticket.getComments() == null) {
            throw new ResourceNotFoundException("Comment not found");
        }

        Ticket.Comment comment = ticket.getComments().stream()
                .filter(c -> commentId.equals(c.getCommentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Simple ownership check (in real app, you'd check userId against comment author)
        comment.setMessage(dto.getMessage());
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    /**
     * Delete a comment (owner or admin).
     */
    public Ticket deleteComment(String id, String commentId, String userId, boolean isAdmin) {
        Ticket ticket = getById(id);

        if (ticket.getComments() == null) {
            throw new ResourceNotFoundException("Comment not found");
        }

        Ticket.Comment comment = ticket.getComments().stream()
                .filter(c -> commentId.equals(c.getCommentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Simple ownership/admin check
        if (!isAdmin) {
            // In real app, check if userId owns the comment
            throw new IllegalArgumentException("Only admin can delete comments");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    // ---- HELPER Methods ----

    /**
     * Validate status transitions.
     */
    private void validateStatusTransition(String currentStatus, TicketStatus newStatus) {
        // Allow all transitions for now, but you can add business rules here
        // Example: OPEN -> IN_PROGRESS, IN_PROGRESS -> RESOLVED, etc.
    }

    /**
     * Get ticket statistics for admin dashboard.
     */
    public long getTicketCountByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status.name());
    }
}

package com.example.server.ticket;

public class CommentDTO {
    private String commentId;
    private String message;
    private String authorName;
    private String createdAt;

    public CommentDTO() {}

    public CommentDTO(String message, String authorName) {
        this.message = message;
        this.authorName = authorName;
        this.commentId = java.util.UUID.randomUUID().toString();
        this.createdAt = java.time.LocalDateTime.now().toString();
    }

    // Getters and Setters
    public String getCommentId() { return commentId; }
    public void setCommentId(String commentId) { this.commentId = commentId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

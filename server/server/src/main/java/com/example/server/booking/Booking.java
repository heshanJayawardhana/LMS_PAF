package com.example.server.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @NotNull
    @Indexed
    private String userId;

    @NotNull
    @Indexed
    private String resourceId;

    @NotNull
    @Indexed
    private LocalDate date;

    @NotNull
    @Indexed
    private LocalTime startTime;

    @NotNull
    @Indexed
    private LocalTime endTime;

    @NotBlank
    private String purpose;

    @Min(1)
    private int attendees;

    @NotNull
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @NotBlank
    @Indexed
    private String requestedBy;

    private String rejectionReason;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}

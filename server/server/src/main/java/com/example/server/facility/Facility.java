package com.example.server.facility;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
@Document(collection = "facilities")
public class Facility {
    @Id
    private String id;

    @NotBlank
    @Indexed
    private String name;

    @NotNull
    @Indexed
    private FacilityType type;

    @NotBlank
    @Indexed
    private String location;

    @Min(1)
    private int capacity;

    @NotBlank
    private String availabilityWindow;

    @NotNull
    @Builder.Default
    private FacilityStatus status = FacilityStatus.ACTIVE;

    private String description;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}

package com.example.server.facility;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FacilityService {
    private final FacilityRepository repository;

    public FacilityService(FacilityRepository repository) {
        this.repository = repository;
    }

    /**
     * Retrieves a list of facilities based on optional filter parameters.
     * @param search Keyword to search in name, location, or description.
     * @param type Facility type filter.
     * @param status Facility status filter.
     * @param location Facility location filter.
     * @param minCapacity Minimum capacity filter.
     * @return List of matching facilities.
     */
    public List<Facility> getAll(String search, FacilityType type, FacilityStatus status, String location, Integer minCapacity) {
        return repository.findAll().stream()
                .filter(f -> matchesSearch(f, search))
                .filter(f -> type == null || f.getType() == type)
                .filter(f -> status == null || f.getStatus() == status)
                .filter(f -> location == null || location.isBlank() || containsIgnoreCase(f.getLocation(), location))
                .filter(f -> minCapacity == null || f.getCapacity() >= minCapacity)
                .toList();
    }

    /**
     * Retrieves a specific facility by its unique ID.
     * @param id The ID of the facility to retrieve.
     * @return The requested Facility object.
     * @throws ResponseStatusException if the facility is not found.
     */
    public Facility getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));
    }

    /**
     * Creates a new facility record.
     * @param facility The facility details to create.
     * @return The created Facility object.
     */
    public Facility create(Facility facility) {
        facility.setId(null);
        facility.setCreatedAt(Instant.now());
        facility.setUpdatedAt(Instant.now());
        return repository.save(facility);
    }

    /**
     * Updates an existing facility by its ID.
     * @param id The ID of the facility to update.
     * @param updatedFacility The updated facility data.
     * @return The updated Facility object.
     */
    public Facility update(String id, Facility updatedFacility) {
        Facility existing = getById(id);
        existing.setName(updatedFacility.getName());
        existing.setType(updatedFacility.getType());
        existing.setLocation(updatedFacility.getLocation());
        existing.setCapacity(updatedFacility.getCapacity());
        existing.setAvailabilityWindow(updatedFacility.getAvailabilityWindow());
        existing.setStatus(updatedFacility.getStatus());
        existing.setDescription(updatedFacility.getDescription());
        existing.setAmenities(updatedFacility.getAmenities());
        existing.setUpdatedAt(Instant.now());
        return repository.save(existing);
    }

    /**
     * Deletes a facility by its ID.
     * @param id The ID of the facility to delete.
     * @throws ResponseStatusException if the facility is not found.
     */
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found");
        }
        repository.deleteById(id);
    }

    /**
     * Validates if a facility matches a given search string.
     * @param facility The facility to check.
     * @param search The search keyword.
     * @return True if the facility matches the search string, false otherwise.
     */
    private boolean matchesSearch(Facility facility, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        return containsIgnoreCase(facility.getName(), search)
                || containsIgnoreCase(facility.getLocation(), search)
                || containsIgnoreCase(facility.getDescription(), search);
    }

    /**
     * Helper method to check if a string contains a query string, ignoring case.
     * @param value The value to search within.
     * @param query The query to search for.
     * @return True if value contains query ignoring case, false otherwise.
     */
    private boolean containsIgnoreCase(String value, String query) {
        if (value == null || query == null) {
            return false;
        }
        return value.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }
}

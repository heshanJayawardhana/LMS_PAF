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

    public List<Facility> getAll(String search, FacilityType type, FacilityStatus status, String location, Integer minCapacity) {
        return repository.findAll().stream()
                .filter(f -> matchesSearch(f, search))
                .filter(f -> type == null || f.getType() == type)
                .filter(f -> status == null || f.getStatus() == status)
                .filter(f -> location == null || location.isBlank() || containsIgnoreCase(f.getLocation(), location))
                .filter(f -> minCapacity == null || f.getCapacity() >= minCapacity)
                .toList();
    }

    public Facility getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));
    }

    public Facility create(Facility facility) {
        facility.setId(null);
        facility.setCreatedAt(Instant.now());
        facility.setUpdatedAt(Instant.now());
        return repository.save(facility);
    }

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

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found");
        }
        repository.deleteById(id);
    }

    private boolean matchesSearch(Facility facility, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        return containsIgnoreCase(facility.getName(), search)
                || containsIgnoreCase(facility.getLocation(), search)
                || containsIgnoreCase(facility.getDescription(), search);
    }

    private boolean containsIgnoreCase(String value, String query) {
        if (value == null || query == null) {
            return false;
        }
        return value.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }
}

package com.example.server.facility;

import com.example.server.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {
    private final FacilityService service;

    public FacilityController(FacilityService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Facility>> getAllFacilities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity
    ) {
        return new ApiResponse<>(true, service.getAll(search, type, status, location, minCapacity), null);
    }

    @GetMapping("/{id}")
    public ApiResponse<Facility> getFacilityById(@PathVariable String id) {
        return new ApiResponse<>(true, service.getById(id), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Facility> createFacility(@Valid @RequestBody Facility facility) {
        return new ApiResponse<>(true, service.create(facility), "Facility created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<Facility> updateFacility(@PathVariable String id, @Valid @RequestBody Facility facility) {
        return new ApiResponse<>(true, service.update(id, facility), "Facility updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteFacility(@PathVariable String id) {
        service.delete(id);
        return new ApiResponse<>(true, null, "Facility deleted successfully");
    }
}

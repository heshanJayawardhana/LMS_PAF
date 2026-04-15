package com.example.server.booking;

import com.example.server.common.ApiResponse;
import com.example.server.facility.Facility;
import com.example.server.facility.FacilityService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    private final FacilityService facilityService;
    
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        BookingStatus bookingStatus = null;
        if (status != null && !status.equals("all")) {
            try {
                bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, return empty list
                return new ApiResponse<>(true, List.of(), null);
            }
        }
        
        List<Booking> bookings = bookingService.getAll(search, bookingStatus);
        
        // Convert to response format with resource details
        List<Map<String, Object>> response = bookings.stream()
            .map(this::convertToResponse)
            .toList();
        
        return new ApiResponse<>(true, response, null);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getBookingById(@PathVariable String id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) {
            return new ApiResponse<>(false, null, "Booking not found");
        }
        
        Map<String, Object> response = convertToResponse(booking);
        return new ApiResponse<>(true, response, null);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        try {
            Booking booking = Booking.builder()
                .userId(request.getUserId())
                .resourceId(request.getResource())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .requestedBy(request.getRequestedBy())
                .build();
            
            Booking createdBooking = bookingService.create(booking);
            Map<String, Object> response = convertToResponse(createdBooking);
            
            return new ApiResponse<>(true, response, "Booking created successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateBooking(@PathVariable String id, @Valid @RequestBody CreateBookingRequest request) {
        try {
            Booking booking = Booking.builder()
                .userId(request.getUserId())
                .resourceId(request.getResource())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .requestedBy(request.getRequestedBy())
                .build();
            
            // First check if booking exists
            Booking existingBooking = bookingService.getById(id);
            if (existingBooking == null) {
                return new ApiResponse<>(false, null, "Booking not found");
            }
            
            // Update the booking by creating a new one with same ID
            booking.setId(id);
            booking.setStatus(existingBooking.getStatus());
            booking.setCreatedAt(existingBooking.getCreatedAt());
            
            Booking updatedBooking = bookingService.update(booking);
            Map<String, Object> response = convertToResponse(updatedBooking);
            
            return new ApiResponse<>(true, response, "Booking updated successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/approve")
    public ApiResponse<Map<String, Object>> approveBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.approve(id);
            Map<String, Object> response = convertToResponse(booking);
            return new ApiResponse<>(true, response, "Booking approved successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/reject")
    public ApiResponse<Map<String, Object>> rejectBooking(
            @PathVariable String id, 
            @RequestBody RejectBookingRequest request
    ) {
        try {
            Booking booking = bookingService.reject(id, request.getReason());
            Map<String, Object> response = convertToResponse(booking);
            return new ApiResponse<>(true, response, "Booking rejected successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelBooking(@PathVariable String id) {
        try {
            Booking booking = bookingService.cancel(id);
            Map<String, Object> response = convertToResponse(booking);
            return new ApiResponse<>(true, response, "Booking cancelled successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBooking(@PathVariable String id) {
        try {
            bookingService.delete(id);
            return new ApiResponse<>(true, null, "Booking deleted successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    private Map<String, Object> convertToResponse(Booking booking) {
        Map<String, Object> response = new HashMap<>();
        
        // Add booking details
        response.put("id", booking.getId());
        response.put("date", booking.getDate().toString());
        response.put("startTime", booking.getStartTime().toString());
        response.put("endTime", booking.getEndTime().toString());
        response.put("purpose", booking.getPurpose());
        response.put("attendees", booking.getAttendees());
        response.put("status", booking.getStatus().name());
        response.put("requestedBy", booking.getRequestedBy());
        response.put("requestedAt", booking.getCreatedAt().toString().split("T")[0]);
        response.put("rejectionReason", booking.getRejectionReason());
        
        // Add resource details
        try {
            Facility facility = facilityService.getById(booking.getResourceId());
            if (facility != null) {
                response.put("resourceName", facility.getName());
                response.put("resourceType", facility.getType().name());
                response.put("resourceLocation", facility.getLocation());
            } else {
                response.put("resourceName", "Unknown");
                response.put("resourceType", "Unknown");
                response.put("resourceLocation", "Unknown");
            }
        } catch (Exception e) {
            response.put("resourceName", "Unknown");
            response.put("resourceType", "Unknown");
            response.put("resourceLocation", "Unknown");
        }
        
        return response;
    }
}

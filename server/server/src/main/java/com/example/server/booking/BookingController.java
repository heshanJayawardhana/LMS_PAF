package com.example.server.booking;

import com.example.server.auth.AppUser;
import com.example.server.auth.UserRepository;
import com.example.server.auth.UserRole;
import com.example.server.common.ApiResponse;
import com.example.server.facility.Facility;
import com.example.server.facility.FacilityService;
import com.example.server.notification.NotificationService;
import com.example.server.notification.dto.CreateNotificationRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    private final FacilityService facilityService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllBookings(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        AppUser currentUser = getCurrentUser(authentication);
        BookingStatus bookingStatus = null;
        if (status != null && !status.equals("all")) {
            try {
                bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, return empty list
                return new ApiResponse<>(true, List.of(), null);
            }
        }
        
        List<Booking> bookings = currentUser.getRole() == UserRole.ADMIN
                ? bookingService.getAll(search, bookingStatus)
                : bookingService.getForUser(currentUser.getId(), search, bookingStatus);
        
        // Convert to response format with resource details
        List<Map<String, Object>> response = bookings.stream()
            .map(this::convertToResponse)
            .toList();
        
        return new ApiResponse<>(true, response, null);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getBookingById(Authentication authentication, @PathVariable String id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) {
            return new ApiResponse<>(false, null, "Booking not found");
        }

        ensureBookingAccess(authentication, booking);
        
        Map<String, Object> response = convertToResponse(booking);
        return new ApiResponse<>(true, response, null);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createBooking(
            Authentication authentication,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        try {
            AppUser currentUser = getCurrentUser(authentication);
            Booking booking = Booking.builder()
                .userId(currentUser.getId())
                .resourceId(request.getResource())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .requestedBy(currentUser.getName())
                .build();
            
            Booking createdBooking = bookingService.create(booking);
            notifyBookingOwner(
                    createdBooking,
                    "You created a booking request for " + resolveResourceName(createdBooking) + ". Awaiting admin review.",
                    "booking_created"
            );
            notifyAdminsAboutPendingBooking(createdBooking);
            Map<String, Object> response = convertToResponse(createdBooking);
            
            return new ApiResponse<>(true, response, "Booking created successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Map<String, Object>> updateBooking(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        try {
            Booking existingBooking = bookingService.getById(id);
            if (existingBooking == null) {
                return new ApiResponse<>(false, null, "Booking not found");
            }

            ensureBookingAccess(authentication, existingBooking);

            Booking booking = Booking.builder()
                .userId(existingBooking.getUserId())
                .resourceId(request.getResource())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .requestedBy(existingBooking.getRequestedBy())
                .build();
            
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
            notifyBookingOwner(
                    booking,
                    "Your booking for " + resolveResourceName(booking) + " was approved.",
                    "booking_approved"
            );
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
            notifyBookingOwner(
                    booking,
                    "Your booking for " + resolveResourceName(booking) + " was rejected.",
                    "booking_rejected"
            );
            Map<String, Object> response = convertToResponse(booking);
            return new ApiResponse<>(true, response, "Booking rejected successfully");
        } catch (RuntimeException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelBooking(Authentication authentication, @PathVariable String id) {
        try {
            Booking existingBooking = bookingService.getById(id);
            if (existingBooking == null) {
                return new ApiResponse<>(false, null, "Booking not found");
            }

            ensureBookingAccess(authentication, existingBooking);

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

    private AppUser getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void ensureBookingAccess(Authentication authentication, Booking booking) {
        AppUser currentUser = getCurrentUser(authentication);
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (!currentUser.getId().equals(booking.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this booking");
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
        response.put("userId", booking.getUserId());
        response.put("requestedBy", booking.getRequestedBy());
        response.put("requestedAt", booking.getCreatedAt().toString().split("T")[0]);
        response.put("rejectionReason", booking.getRejectionReason());

        userRepository.findById(booking.getUserId()).ifPresent(user -> {
            response.put("requestedByEmail", user.getEmail());
        });
        
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

    private void notifyAdminsAboutPendingBooking(Booking booking) {
        List<AppUser> admins = userRepository.findByRole(UserRole.ADMIN);
        String resourceName = resolveResourceName(booking);

        for (AppUser admin : admins) {
            CreateNotificationRequest request = new CreateNotificationRequest();
            request.setRecipientEmail(admin.getEmail());
            request.setMessage("New booking request from " + booking.getRequestedBy() + " for " + resourceName + ".");
            request.setType("info");
            request.setRelatedType("BOOKING");
            request.setRelatedId(booking.getId());
            notificationService.createForRecipient(admin.getEmail(), request);
        }
    }

    private void notifyBookingOwner(Booking booking, String message, String type) {
        userRepository.findById(booking.getUserId()).ifPresent(user -> {
            CreateNotificationRequest request = new CreateNotificationRequest();
            request.setRecipientEmail(user.getEmail());
            request.setMessage(message);
            request.setType(type);
            request.setRelatedType("BOOKING");
            request.setRelatedId(booking.getId());
            notificationService.createForRecipient(user.getEmail(), request);
        });
    }

    private String resolveResourceName(Booking booking) {
        try {
            Facility facility = facilityService.getById(booking.getResourceId());
            if (facility != null && facility.getName() != null && !facility.getName().isBlank()) {
                return facility.getName();
            }
        } catch (Exception ignored) {
            // Fall back to a generic label when facility lookup fails
        }

        return "the selected facility";
    }
}

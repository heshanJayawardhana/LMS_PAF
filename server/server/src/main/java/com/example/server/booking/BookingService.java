package com.example.server.booking;

import com.example.server.facility.Facility;
import com.example.server.facility.FacilityService;
import jakarta.validation.Valid;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final FacilityService facilityService;
    
    public List<Booking> getAll(String search, BookingStatus status) {
        List<Booking> bookings;
        
        if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else {
            bookings = bookingRepository.findAll();
        }
        
        // Add resource details for search functionality
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.toLowerCase();
            bookings = bookings.stream()
                .filter(booking -> {
                    try {
                        Facility facility = facilityService.getById(booking.getResourceId());
                        if (facility == null) return false;
                        
                        return facility.getName().toLowerCase().contains(searchTerm) ||
                               booking.getPurpose().toLowerCase().contains(searchTerm) ||
                               booking.getRequestedBy().toLowerCase().contains(searchTerm);
                    } catch (Exception e) {
                        // Skip bookings with invalid facility references
                        return false;
                    }
                })
                .toList();
        }
        
        return bookings;
    }
    
    public Booking getById(String id) {
        return bookingRepository.findById(id).orElse(null);
    }
    
    public Booking create(@Valid Booking booking) {
        // Check for conflicting bookings
        List<Booking> conflictingBookings = bookingRepository.findByResourceIdAndDateAndStatusNot(
            booking.getResourceId(), 
            booking.getDate(), 
            BookingStatus.CANCELLED
        );
        
        // Check time conflicts
        for (Booking existing : conflictingBookings) {
            if (isTimeConflict(booking.getStartTime(), booking.getEndTime(), 
                             existing.getStartTime(), existing.getEndTime())) {
                throw new RuntimeException("Time slot conflicts with existing booking");
            }
        }
        
        // Validate facility exists and is active
        Facility facility = facilityService.getById(booking.getResourceId());
        if (facility == null) {
            throw new RuntimeException("Facility not found");
        }
        
        if (facility.getStatus() != com.example.server.facility.FacilityStatus.ACTIVE) {
            throw new RuntimeException("Facility is not available for booking");
        }
        
        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }
    
    public Booking approve(String id) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be approved");
        }
        
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }
    
    public Booking reject(String id, String reason) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }
    
    public Booking cancel(String id) {
        Booking booking = getById(id);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only approved bookings can be cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
    
    public Booking update(Booking booking) {
        // Check for conflicting bookings (excluding the current booking)
        List<Booking> conflictingBookings = bookingRepository.findByResourceIdAndDateAndStatusNot(
            booking.getResourceId(), 
            booking.getDate(), 
            BookingStatus.CANCELLED
        );
        
        // Check time conflicts (excluding current booking)
        for (Booking existing : conflictingBookings) {
            if (!existing.getId().equals(booking.getId()) && 
                isTimeConflict(booking.getStartTime(), booking.getEndTime(), 
                               existing.getStartTime(), existing.getEndTime())) {
                throw new RuntimeException("Time slot conflicts with existing booking");
            }
        }
        
        // Validate facility exists and is active
        Facility facility = facilityService.getById(booking.getResourceId());
        if (facility == null) {
            throw new RuntimeException("Facility not found");
        }
        
        if (facility.getStatus() != com.example.server.facility.FacilityStatus.ACTIVE) {
            throw new RuntimeException("Facility is not available for booking");
        }
        
        return bookingRepository.save(booking);
    }
    
    public void delete(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }
    
    private boolean isTimeConflict(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }
}

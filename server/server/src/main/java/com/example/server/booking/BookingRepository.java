package com.example.server.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
    
    List<Booking> findByResourceIdAndDateAndStatusNot(String resourceId, LocalDate date, BookingStatus status);
    
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $ne: ?5 }, " +
           "$or: [ " +
           "  { 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }, " +
           "  { 'startTime': { $gte: ?2, $lt: ?3 } }, " +
           "  { 'endTime': { $gt: ?2, $lte: ?3 } } " +
           "] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, LocalTime startCheck, LocalTime endCheck, BookingStatus status);
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByResourceId(String resourceId);
}

package com.example.server.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    List<AppUser> findByRole(UserRole role);
}

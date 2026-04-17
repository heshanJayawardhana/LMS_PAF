package com.example.server.admin;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminSettingsRepository extends MongoRepository<AdminSettings, String> {
}

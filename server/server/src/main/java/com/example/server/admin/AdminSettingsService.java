package com.example.server.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {
    private static final String SETTINGS_ID = "default-admin-settings";

    private final AdminSettingsRepository adminSettingsRepository;

    public AdminSettings getSettings() {
        return adminSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaultSettings);
    }

    public AdminSettings saveSettings(AdminSettings settings) {
        settings.setId(SETTINGS_ID);
        return adminSettingsRepository.save(settings);
    }

    private AdminSettings createDefaultSettings() {
        AdminSettings settings = AdminSettings.builder()
                .id(SETTINGS_ID)
                .appName("SmartEdu Portal")
                .systemEmail("admin@smartedu.edu")
                .timeZone("UTC+05:30 - India Standard Time")
                .emailNotifications(true)
                .bookingReminders(true)
                .ticketUpdates(false)
                .passwordPolicy("Medium (8 characters, 1 uppercase, 1 number)")
                .sessionTimeout("30 minutes")
                .twoFactorAdmin(false)
                .defaultUserRole("User")
                .maxUsersPerDepartment("100")
                .autoApproveUsers(false)
                .build();

        return adminSettingsRepository.save(settings);
    }
}

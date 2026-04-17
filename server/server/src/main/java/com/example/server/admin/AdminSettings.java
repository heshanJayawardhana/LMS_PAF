package com.example.server.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_settings")
public class AdminSettings {
    @Id
    private String id;

    private String appName;
    private String systemEmail;
    private String timeZone;
    private boolean emailNotifications;
    private boolean bookingReminders;
    private boolean ticketUpdates;
    private String passwordPolicy;
    private String sessionTimeout;
    private boolean twoFactorAdmin;
    private String defaultUserRole;
    private String maxUsersPerDepartment;
    private boolean autoApproveUsers;
}

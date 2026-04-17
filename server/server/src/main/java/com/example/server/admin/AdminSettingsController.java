package com.example.server.admin;

import com.example.server.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {
    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ApiResponse<AdminSettings> getSettings() {
        return new ApiResponse<>(true, adminSettingsService.getSettings(), null);
    }

    @PutMapping
    public ApiResponse<AdminSettings> updateSettings(@RequestBody AdminSettings settings) {
        return new ApiResponse<>(true, adminSettingsService.saveSettings(settings), "Settings saved successfully");
    }
}

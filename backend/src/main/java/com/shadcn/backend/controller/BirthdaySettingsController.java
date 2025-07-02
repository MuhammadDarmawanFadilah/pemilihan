package com.shadcn.backend.controller;

import com.shadcn.backend.entity.BirthdaySettings;
import com.shadcn.backend.service.BirthdaySettingsService;
import com.shadcn.backend.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/birthday-settings")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Slf4j
public class BirthdaySettingsController {
    
    @Autowired
    private BirthdaySettingsService birthdaySettingsService;
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    /**
     * Get current birthday settings
     */
    @GetMapping
    public ResponseEntity<BirthdaySettings> getCurrentSettings() {
        try {
            log.info("Getting current birthday settings");
            BirthdaySettings settings = birthdaySettingsService.getCurrentSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Error getting current birthday settings", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Update birthday settings
     */    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody BirthdaySettings settings) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Received birthday settings update request: includeAge={}, enabled={}", 
                settings.getIncludeAge(), settings.getEnabled());
            
            // Get current user from context (simplified for now)
            String updatedBy = "admin"; // TODO: Get from security context
            
            BirthdaySettings updatedSettings = birthdaySettingsService.updateSettings(settings, updatedBy);
            
            response.put("success", true);
            response.put("message", "Birthday settings updated successfully");
            response.put("data", updatedSettings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating birthday settings", e);
            response.put("success", false);
            response.put("message", "Failed to update birthday settings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Upload attachment image for birthday notifications
     */
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, Object>> uploadAttachmentImage(@RequestParam("image") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "No file uploaded");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Please upload a valid image file");
                return ResponseEntity.badRequest().body(response);
            }
            
            // TODO: Implement image upload service integration
            String imageUrl = "/uploads/" + file.getOriginalFilename(); // Temporary mock
            
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("imageUrl", imageUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading image", e);
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Reset to default settings
     */
    @PostMapping("/reset-defaults")
    public ResponseEntity<Map<String, Object>> resetToDefaults() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Resetting birthday settings to defaults");
            String updatedBy = "admin"; // TODO: Get from security context
            BirthdaySettings defaultSettings = birthdaySettingsService.resetToDefaults(updatedBy);
            
            response.put("success", true);
            response.put("message", "Settings reset to defaults successfully");
            response.put("data", defaultSettings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error resetting birthday settings to defaults", e);
            response.put("success", false);
            response.put("message", "Failed to reset settings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Test birthday notification with current settings
     */
    @PostMapping("/test-notification")
    public ResponseEntity<Map<String, Object>> testNotification(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phoneNumber = request.get("phoneNumber");
            log.info("Testing birthday notification to phone number: {}", phoneNumber);
            
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Phone number is required for test notification");
                return ResponseEntity.badRequest().body(response);
            }
            
            BirthdaySettings settings = birthdaySettingsService.getActiveSettings();
            
            if (settings == null) {
                response.put("success", false);
                response.put("message", "Birthday notifications are disabled");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Prepare test message
            String message = settings.getMessage();
            if (message == null || message.trim().isEmpty()) {
                message = "🎉 Selamat Ulang Tahun! 🎂\n\nSemoga panjang umur, sehat selalu, dan sukses dalam segala hal!\n\nSalam hangat,\nAlumni Association";
            }
            
            // Create personalized test message with age if enabled
            String testMessage;
            if (settings.getIncludeAge() != null && settings.getIncludeAge()) {
                testMessage = String.format("*TEST NOTIFIKASI ULANG TAHUN* 🧪\n\nHalo Tester,\n\nSelamat ulang tahun yang ke-30! 🎉\n\n%s\n\n⚙️ Ini adalah pesan test dari sistem notifikasi ulang tahun.", message);
            } else {
                testMessage = String.format("*TEST NOTIFIKASI ULANG TAHUN* 🧪\n\nHalo Tester,\n\n%s\n\n⚙️ Ini adalah pesan test dari sistem notifikasi ulang tahun.", message);
            }
            
            // Send WhatsApp message using the service
            whatsAppService.sendMessage(phoneNumber, testMessage);
            
            response.put("success", true);
            response.put("message", "Test notification sent successfully to " + phoneNumber);
            response.put("phoneNumber", phoneNumber);
            response.put("testMessage", testMessage);
            response.put("settings", settings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing birthday notification", e);
            response.put("success", false);
            response.put("message", "Failed to send test notification: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Debug endpoint to check current settings and includeAge functionality
     */
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugSettings() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            BirthdaySettings currentSettings = birthdaySettingsService.getCurrentSettings();
            
            response.put("success", true);
            response.put("currentSettings", currentSettings);
            response.put("includeAge", currentSettings.getIncludeAge());
            response.put("enabled", currentSettings.getEnabled());
            response.put("message", currentSettings.getMessage());
            response.put("hasId", currentSettings.getId() != null);
            response.put("isFromDatabase", currentSettings.getId() != null ? "Yes" : "No (using defaults)");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting debug settings", e);
            response.put("success", false);
            response.put("message", "Failed to get debug settings: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

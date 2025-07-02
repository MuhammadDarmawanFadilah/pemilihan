package com.shadcn.backend.controller;

import com.shadcn.backend.dto.*;
import com.shadcn.backend.model.Laporan;
import com.shadcn.backend.service.AuthService;
import com.shadcn.backend.service.LaporanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/laporan")
@RequiredArgsConstructor
public class LaporanController {

    private final LaporanService laporanService;
    private final AuthService authService;

    // Get all laporan with pagination and filters
    @PostMapping("/search")
    public ResponseEntity<Page<LaporanDto>> searchLaporan(@RequestBody LaporanFilterRequest filterRequest) {
        try {
            Page<LaporanDto> laporanPage = laporanService.getAllLaporan(filterRequest);
            return ResponseEntity.ok(laporanPage);
        } catch (Exception e) {
            log.error("Error searching laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get laporan by user
    @PostMapping("/my-laporan")
    public ResponseEntity<?> getMyLaporan(
            @RequestBody LaporanFilterRequest filterRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk mengakses laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Page<LaporanDto> laporanPage = laporanService.getLaporanByUser(userId, filterRequest);
            return ResponseEntity.ok(laporanPage);
        } catch (Exception e) {
            log.error("Error fetching user laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get laporan by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getLaporanById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk mengakses laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // For admin, show all laporan. For user, only show their own laporan
            Optional<LaporanDto> laporan;
            if (authService.isAdmin(userId)) {
                laporan = laporanService.getLaporanById(id);
            } else {
                laporan = laporanService.getLaporanByIdForUser(id, userId);
            }

            if (laporan.isPresent()) {
                return ResponseEntity.ok(laporan.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            log.error("Error fetching laporan by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create laporan
    @PostMapping
    public ResponseEntity<?> createLaporan(
            @Valid @RequestBody LaporanDto laporanDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk membuat laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            laporanDto.setUserId(userId);
            LaporanDto newLaporan = laporanService.createLaporan(laporanDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newLaporan);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error creating laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat membuat laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Create laporan dengan wizard (support multiple jenis laporan)
    @PostMapping("/wizard")
    public ResponseEntity<?> createLaporanWizard(
            @Valid @RequestBody LaporanWizardDto wizardDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk membuat laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            wizardDto.setUserId(userId);
            LaporanDto newLaporan = laporanService.createLaporanWizard(wizardDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newLaporan);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error creating laporan with wizard", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat membuat laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update laporan
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLaporan(
            @PathVariable Long id,
            @Valid @RequestBody LaporanDto laporanDto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk mengupdate laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            LaporanDto updatedLaporan = laporanService.updateLaporan(id, laporanDto, userId);
            return ResponseEntity.ok(updatedLaporan);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error updating laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat mengupdate laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update laporan status (admin only)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateLaporanStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk mengupdate status laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Check if user is admin
            if (!authService.isAdmin(userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda tidak memiliki akses untuk mengupdate status laporan");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            String statusStr = statusRequest.get("status");
            if (statusStr == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Status tidak boleh kosong");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            try {
                Laporan.StatusLaporan status = Laporan.StatusLaporan.valueOf(statusStr.toUpperCase());
                LaporanDto updatedLaporan = laporanService.updateLaporanStatus(id, status);
                return ResponseEntity.ok(updatedLaporan);
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Status tidak valid");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error updating laporan status", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat mengupdate status laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Delete laporan
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLaporan(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk menghapus laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            laporanService.deleteLaporan(id, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Laporan berhasil dihapus");
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error deleting laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat menghapus laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update detail laporan
    @PutMapping("/detail/{detailId}")
    public ResponseEntity<?> updateDetailLaporan(
            @PathVariable Long detailId,
            @RequestBody Map<String, String> contentRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk mengupdate detail laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String konten = contentRequest.get("konten");
            DetailLaporanDto updatedDetail = laporanService.updateDetailLaporan(detailId, konten, userId);
            return ResponseEntity.ok(updatedDetail);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error updating detail laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat mengupdate detail laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Complete detail laporan
    @PutMapping("/detail/{detailId}/complete")
    public ResponseEntity<?> completeDetailLaporan(
            @PathVariable Long detailId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk menyelesaikan detail laporan");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            DetailLaporanDto completedDetail = laporanService.completeDetailLaporan(detailId, userId);
            return ResponseEntity.ok(completedDetail);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error completing detail laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat menyelesaikan detail laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Upload lampiran
    @PostMapping("/detail/{detailId}/upload")
    public ResponseEntity<?> uploadLampiran(
            @PathVariable Long detailId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk upload lampiran");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File tidak boleh kosong");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            LampiranLaporanDto lampiran = laporanService.uploadLampiran(detailId, file, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(lampiran);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error uploading lampiran", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat upload lampiran");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getLaporanStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check authorization
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Anda harus login untuk melihat statistik");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            Long userId = authService.getUserIdFromToken(token);

            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token tidak valid atau telah kedaluwarsa");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // For admin, show all stats. For user, show only their stats
            Long statsUserId = authService.isAdmin(userId) ? null : userId;
            LaporanService.LaporanStats stats = laporanService.getLaporanStats(statsUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching laporan stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Laporan Service");
        return ResponseEntity.ok(response);
    }
}

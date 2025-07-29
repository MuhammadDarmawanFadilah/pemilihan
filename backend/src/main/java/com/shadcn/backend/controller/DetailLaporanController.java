package com.shadcn.backend.controller;

import com.shadcn.backend.dto.DetailLaporanRequest;
import com.shadcn.backend.dto.DetailLaporanResponse;
import com.shadcn.backend.dto.PaginatedResponse;
import com.shadcn.backend.model.SubmissionLaporan;
import com.shadcn.backend.model.Pegawai;
import com.shadcn.backend.model.User;
import com.shadcn.backend.service.SubmissionLaporanService;
import com.shadcn.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detail-laporan")
public class DetailLaporanController {

    private static final Logger logger = LoggerFactory.getLogger(DetailLaporanController.class);

    @Autowired
    private SubmissionLaporanService submissionLaporanService;
    
    @Autowired
    private AuthService authService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<DetailLaporanResponse> createSubmission(
            @RequestBody DetailLaporanRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            logger.info("Creating submission for judul: {}", request != null ? request.getJudul() : "null");
            
            // Validate token and get user
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid auth header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            
            String actualToken = authHeader.substring(7); // Remove "Bearer " prefix
            User user = authService.getUserFromToken(actualToken);
            
            if (user == null) {
                logger.error("Invalid token - user not found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            
            logger.info("Authenticated user: {}", user.getUsername());
            
            DetailLaporanResponse response = submissionLaporanService.createSubmission(request);
            logger.info("Submission created successfully with ID: {}", response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in createSubmission: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<PaginatedResponse<DetailLaporanResponse>> getSubmissionsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer pemilihanId,
            @RequestParam(required = false) Integer laporanId,
            @RequestParam(required = false) Integer jenisLaporanId,
            @RequestParam(required = false) Integer tahapanLaporanId,
            @RequestParam(required = false) String pegawaiId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        // Get current user from token to check their role
        String actualToken = token != null && token.startsWith("Bearer ") ? token.substring(7) : null;
        
        // Determine if current user is admin
        boolean isAdmin = false;
        Long currentUserId = null;
        
        if (actualToken != null) {
            // Check if it's a pegawai token
            if (authService.isPegawaiToken(actualToken)) {
                Pegawai currentPegawai = authService.getCurrentPegawai(actualToken);
                if (currentPegawai != null) {
                    currentUserId = currentPegawai.getId();
                    // Check if pegawai has ADMIN or MODERATOR role
                    isAdmin = "ADMIN".equals(currentPegawai.getRole()) || "MODERATOR".equals(currentPegawai.getRole());
                }
            } else {
                // Regular user token
                currentUserId = authService.getUserIdFromToken(actualToken);
                isAdmin = authService.isAdmin(currentUserId);
            }
        }
        
        // Convert pegawaiId from String to Long, handle "all" case
        Long pegawaiIdLong = null;
        if (pegawaiId != null && !pegawaiId.equals("all") && !pegawaiId.trim().isEmpty()) {
            try {
                pegawaiIdLong = Long.parseLong(pegawaiId);
            } catch (NumberFormatException e) {
                // Invalid pegawaiId format, ignore it
                pegawaiIdLong = null;
            }
        }
        
        // Security enforcement: Non-admin users can only see their own reports
        if (!isAdmin) {
            // Force pegawaiId to be the current user's ID for non-admin users
            pegawaiIdLong = currentUserId;
        }
        
        PaginatedResponse<DetailLaporanResponse> submissions = submissionLaporanService.getSubmissionsByUserPaginated(
            userId, page, size, search, pemilihanId, laporanId, jenisLaporanId, tahapanLaporanId, pegawaiIdLong);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<List<DetailLaporanResponse>> getSubmissionsByUserAndStatus(
            @PathVariable Long userId, 
            @PathVariable String status) {
        try {
            SubmissionLaporan.StatusLaporan statusEnum = SubmissionLaporan.StatusLaporan.valueOf(status.toUpperCase());
            List<DetailLaporanResponse> submissions = submissionLaporanService.getSubmissionsByUserAndStatus(userId, statusEnum);
            return ResponseEntity.ok(submissions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<DetailLaporanResponse> getSubmissionById(@PathVariable Long id, @PathVariable Long userId) {
        Optional<DetailLaporanResponse> submission = submissionLaporanService.getSubmissionById(id, userId);
        return submission.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<DetailLaporanResponse> updateSubmission(
            @PathVariable Long id, 
            @PathVariable Long userId, 
            @RequestBody DetailLaporanRequest request) {
        try {
            DetailLaporanResponse response = submissionLaporanService.updateSubmission(id, userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id, @PathVariable Long userId) {
        try {
            submissionLaporanService.deleteSubmission(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

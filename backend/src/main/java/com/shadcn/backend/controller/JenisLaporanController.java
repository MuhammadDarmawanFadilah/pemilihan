package com.shadcn.backend.controller;

import com.shadcn.backend.dto.JenisLaporanDto;
import com.shadcn.backend.dto.JenisLaporanFilterRequest;
import com.shadcn.backend.dto.TahapanLaporanDto;
import com.shadcn.backend.service.JenisLaporanService;
import com.shadcn.backend.service.TahapanLaporanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/jenis-laporan")
@RequiredArgsConstructor
public class JenisLaporanController {

    private final JenisLaporanService jenisLaporanService;
    private final TahapanLaporanService tahapanLaporanService;

    // Get all jenis laporan with pagination and filters
    @PostMapping("/search")
    public ResponseEntity<Page<JenisLaporanDto>> searchJenisLaporan(@RequestBody JenisLaporanFilterRequest filterRequest) {
        try {
            Page<JenisLaporanDto> jenisLaporanPage = jenisLaporanService.getAllJenisLaporan(filterRequest);
            return ResponseEntity.ok(jenisLaporanPage);
        } catch (Exception e) {
            log.error("Error searching jenis laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all active jenis laporan for dropdown
    @GetMapping("/active")
    public ResponseEntity<List<JenisLaporanDto>> getActiveJenisLaporan() {
        try {
            List<JenisLaporanDto> jenisLaporanList = jenisLaporanService.getActiveJenisLaporan();
            return ResponseEntity.ok(jenisLaporanList);
        } catch (Exception e) {
            log.error("Error fetching active jenis laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get jenis laporan by ID
    @GetMapping("/{id}")
    public ResponseEntity<JenisLaporanDto> getJenisLaporanById(@PathVariable Long id) {
        try {
            Optional<JenisLaporanDto> jenisLaporan = jenisLaporanService.getJenisLaporanById(id);
            if (jenisLaporan.isPresent()) {
                return ResponseEntity.ok(jenisLaporan.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error fetching jenis laporan by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get jenis laporan with tahapan
    @GetMapping("/{id}/with-tahapan")
    public ResponseEntity<JenisLaporanDto> getJenisLaporanWithTahapan(@PathVariable Long id) {
        try {
            Optional<JenisLaporanDto> jenisLaporan = jenisLaporanService.getJenisLaporanWithTahapan(id);
            if (jenisLaporan.isPresent()) {
                return ResponseEntity.ok(jenisLaporan.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error fetching jenis laporan with tahapan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create jenis laporan
    @PostMapping
    public ResponseEntity<?> createJenisLaporan(@Valid @RequestBody JenisLaporanDto jenisLaporanDto) {
        try {
            JenisLaporanDto newJenisLaporan = jenisLaporanService.createJenisLaporan(jenisLaporanDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newJenisLaporan);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error creating jenis laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat membuat jenis laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update jenis laporan
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJenisLaporan(
            @PathVariable Long id, 
            @Valid @RequestBody JenisLaporanDto jenisLaporanDto) {
        try {
            JenisLaporanDto updatedJenisLaporan = jenisLaporanService.updateJenisLaporan(id, jenisLaporanDto);
            return ResponseEntity.ok(updatedJenisLaporan);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error updating jenis laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat mengupdate jenis laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Delete jenis laporan (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJenisLaporan(@PathVariable Long id) {
        try {
            jenisLaporanService.deleteJenisLaporan(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Jenis laporan berhasil dihapus");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error deleting jenis laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat menghapus jenis laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Hard delete jenis laporan
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> hardDeleteJenisLaporan(@PathVariable Long id) {
        try {
            jenisLaporanService.hardDeleteJenisLaporan(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Jenis laporan berhasil dihapus permanen");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error hard deleting jenis laporan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat menghapus jenis laporan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get tahapan by jenis laporan
    @GetMapping("/{id}/tahapan")
    public ResponseEntity<List<TahapanLaporanDto>> getTahapanByJenisLaporan(@PathVariable Long id) {
        try {
            List<TahapanLaporanDto> tahapanList = tahapanLaporanService.getTahapanByJenisLaporan(id);
            return ResponseEntity.ok(tahapanList);
        } catch (Exception e) {
            log.error("Error fetching tahapan by jenis laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active tahapan by jenis laporan
    @GetMapping("/{id}/tahapan/active")
    public ResponseEntity<List<TahapanLaporanDto>> getActiveTahapanByJenisLaporan(@PathVariable Long id) {
        try {
            List<TahapanLaporanDto> tahapanList = tahapanLaporanService.getActiveTahapanByJenisLaporan(id);
            return ResponseEntity.ok(tahapanList);
        } catch (Exception e) {
            log.error("Error fetching active tahapan by jenis laporan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create tahapan for jenis laporan
    @PostMapping("/{id}/tahapan")
    public ResponseEntity<?> createTahapanForJenisLaporan(
            @PathVariable Long id, 
            @Valid @RequestBody TahapanLaporanDto tahapanDto) {
        try {
            tahapanDto.setJenisLaporanId(id);
            TahapanLaporanDto newTahapan = tahapanLaporanService.createTahapan(tahapanDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newTahapan);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error creating tahapan", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Terjadi kesalahan saat membuat tahapan");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get next urutan for jenis laporan
    @GetMapping("/{id}/tahapan/next-urutan")
    public ResponseEntity<Map<String, Integer>> getNextUrutan(@PathVariable Long id) {
        try {
            Integer nextUrutan = tahapanLaporanService.getNextUrutan(id);
            Map<String, Integer> response = new HashMap<>();
            response.put("nextUrutan", nextUrutan);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting next urutan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<JenisLaporanService.JenisLaporanStats> getJenisLaporanStats() {
        try {
            JenisLaporanService.JenisLaporanStats stats = jenisLaporanService.getJenisLaporanStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching jenis laporan stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Jenis Laporan Service");
        return ResponseEntity.ok(response);
    }
}

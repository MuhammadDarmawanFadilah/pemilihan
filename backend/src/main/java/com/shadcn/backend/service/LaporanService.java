package com.shadcn.backend.service;

import com.shadcn.backend.dto.*;
import com.shadcn.backend.model.*;
import com.shadcn.backend.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LaporanService {
    
    private final LaporanRepository laporanRepository;
    private final JenisLaporanRepository jenisLaporanRepository;
    private final TahapanLaporanRepository tahapanLaporanRepository;
    private final DetailLaporanRepository detailLaporanRepository;
    private final LampiranLaporanRepository lampiranLaporanRepository;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper;
    
    // Get laporan with pagination and filters
    public Page<LaporanDto> getAllLaporan(LaporanFilterRequest filterRequest) {
        Sort sort = Sort.by(
            filterRequest.getSortDirection().equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC,
            filterRequest.getSortBy()
        );
        
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);
        
        Page<Laporan> laporanPage = laporanRepository.findWithFilters(
            filterRequest.getNamaLaporan(),
            filterRequest.getNamaPelapor(),
            filterRequest.getJenisLaporanId(),
            filterRequest.getStatus(),
            filterRequest.getUserId(),
            pageable
        );
        
        return laporanPage.map(this::convertToDto);
    }
    
    // Get laporan by user
    public Page<LaporanDto> getLaporanByUser(Long userId, LaporanFilterRequest filterRequest) {
        filterRequest.setUserId(userId);
        return getAllLaporan(filterRequest);
    }
    
    // Get laporan by ID
    public Optional<LaporanDto> getLaporanById(Long id) {
        return laporanRepository.findById(id)
                .map(this::convertToDtoWithDetails);
    }
    
    // Get laporan by ID with authorization check
    public Optional<LaporanDto> getLaporanByIdForUser(Long id, Long userId) {
        Optional<Laporan> laporanOpt = laporanRepository.findById(id);
        if (laporanOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Laporan laporan = laporanOpt.get();
        if (!laporan.getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses ke laporan ini");
        }
        
        return Optional.of(convertToDtoWithDetails(laporan));
    }
    
    // Create laporan
    @Transactional
    public LaporanDto createLaporan(LaporanDto laporanDto) {
        JenisLaporan jenisLaporan = jenisLaporanRepository.findById(laporanDto.getJenisLaporanId())
                .orElseThrow(() -> new RuntimeException("Jenis laporan tidak ditemukan"));
        
        Laporan laporan = convertToEntity(laporanDto);
        laporan.setJenisLaporan(jenisLaporan);
        laporan.setCreatedAt(LocalDateTime.now());
        laporan.setUpdatedAt(LocalDateTime.now());
        
        Laporan savedLaporan = laporanRepository.save(laporan);
        
        // Create detail laporan for each tahapan
        List<TahapanLaporan> tahapanList = tahapanLaporanRepository
                .findActiveTahapanByJenisLaporan(jenisLaporan.getJenisLaporanId());
        
        for (TahapanLaporan tahapan : tahapanList) {
            DetailLaporan detail = new DetailLaporan();
            detail.setLaporan(savedLaporan);
            detail.setTahapanLaporan(tahapan);
            detail.setStatus(DetailLaporan.StatusDetailLaporan.BELUM_DIKERJAKAN);
            detail.setCreatedAt(LocalDateTime.now());
            detail.setUpdatedAt(LocalDateTime.now());
            detailLaporanRepository.save(detail);
        }
        
        return convertToDto(savedLaporan);
    }
    
    // Create laporan dengan wizard (support multiple jenis laporan)
    @Transactional
    public LaporanDto createLaporanWizard(LaporanWizardDto wizardDto) {
        // Validasi jenis laporan
        List<JenisLaporan> jenisLaporanList = jenisLaporanRepository.findAllById(wizardDto.getJenisLaporanIds());
        if (jenisLaporanList.size() != wizardDto.getJenisLaporanIds().size()) {
            throw new RuntimeException("Beberapa jenis laporan tidak ditemukan");
        }
        
        // Buat laporan utama dengan jenis laporan pertama sebagai primary
        JenisLaporan primaryJenisLaporan = jenisLaporanList.get(0);
        
        Laporan laporan = new Laporan();
        laporan.setNamaLaporan(wizardDto.getNamaLaporan());
        laporan.setDeskripsi(wizardDto.getDeskripsi());
        laporan.setJenisLaporan(primaryJenisLaporan);
        laporan.setUserId(wizardDto.getUserId());
        laporan.setStatus(Laporan.StatusLaporan.DRAFT);
        laporan.setCreatedAt(LocalDateTime.now());
        laporan.setUpdatedAt(LocalDateTime.now());
        
        Laporan savedLaporan = laporanRepository.save(laporan);
        
        // Create detail laporan untuk semua jenis laporan yang dipilih
        for (JenisLaporan jenisLaporan : jenisLaporanList) {
            List<TahapanLaporan> tahapanList = tahapanLaporanRepository
                    .findActiveTahapanByJenisLaporan(jenisLaporan.getJenisLaporanId());
            
            for (TahapanLaporan tahapan : tahapanList) {
                DetailLaporan detail = new DetailLaporan();
                detail.setLaporan(savedLaporan);
                detail.setTahapanLaporan(tahapan);
                detail.setStatus(DetailLaporan.StatusDetailLaporan.BELUM_DIKERJAKAN);
                detail.setCreatedAt(LocalDateTime.now());
                detail.setUpdatedAt(LocalDateTime.now());
                detailLaporanRepository.save(detail);
            }
        }
        
        return convertToDto(savedLaporan);
    }
    
    // Update laporan
    @Transactional
    public LaporanDto updateLaporan(Long id, LaporanDto laporanDto, Long userId) {
        Laporan existingLaporan = laporanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));
        
        // Check authorization
        if (!existingLaporan.getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses untuk mengedit laporan ini");
        }
        
        existingLaporan.setNamaLaporan(laporanDto.getNamaLaporan());
        existingLaporan.setDeskripsi(laporanDto.getDeskripsi());
        existingLaporan.setNamaPelapor(laporanDto.getNamaPelapor());
        existingLaporan.setAlamatPelapor(laporanDto.getAlamatPelapor());
        existingLaporan.setStatus(laporanDto.getStatus());
        existingLaporan.setUpdatedAt(LocalDateTime.now());
        
        Laporan savedLaporan = laporanRepository.save(existingLaporan);
        return convertToDto(savedLaporan);
    }
    
    // Update laporan status
    @Transactional
    public LaporanDto updateLaporanStatus(Long id, Laporan.StatusLaporan status) {
        Laporan laporan = laporanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));
        
        laporan.setStatus(status);
        laporan.setUpdatedAt(LocalDateTime.now());
        
        Laporan savedLaporan = laporanRepository.save(laporan);
        return convertToDto(savedLaporan);
    }
    
    // Delete laporan
    @Transactional
    public void deleteLaporan(Long id, Long userId) {
        Laporan laporan = laporanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));
        
        // Check authorization
        if (!laporan.getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses untuk menghapus laporan ini");
        }
        
        laporanRepository.delete(laporan);
    }
    
    // Update detail laporan
    @Transactional
    public DetailLaporanDto updateDetailLaporan(Long detailId, String konten, Long userId) {
        DetailLaporan detail = detailLaporanRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Detail laporan tidak ditemukan"));
        
        // Check authorization
        if (!detail.getLaporan().getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses untuk mengedit detail laporan ini");
        }
        
        detail.setKonten(konten);
        detail.setStatus(DetailLaporan.StatusDetailLaporan.DALAM_PENGERJAAN);
        detail.setUpdatedAt(LocalDateTime.now());
        
        DetailLaporan savedDetail = detailLaporanRepository.save(detail);
        return convertDetailToDto(savedDetail);
    }
    
    // Complete detail laporan
    @Transactional
    public DetailLaporanDto completeDetailLaporan(Long detailId, Long userId) {
        DetailLaporan detail = detailLaporanRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Detail laporan tidak ditemukan"));
        
        // Check authorization
        if (!detail.getLaporan().getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses untuk mengedit detail laporan ini");
        }
        
        detail.setStatus(DetailLaporan.StatusDetailLaporan.SELESAI);
        detail.setUpdatedAt(LocalDateTime.now());
        
        DetailLaporan savedDetail = detailLaporanRepository.save(detail);
        
        // Check if all tahapan completed and update laporan status
        boolean allCompleted = detailLaporanRepository.isAllTahapanCompleted(detail.getLaporan().getLaporanId());
        if (allCompleted) {
            updateLaporanStatus(detail.getLaporan().getLaporanId(), Laporan.StatusLaporan.SELESAI);
        }
        
        return convertDetailToDto(savedDetail);
    }
    
    // Upload file for detail laporan
    @Transactional
    public LampiranLaporanDto uploadLampiran(Long detailId, MultipartFile file, Long userId) {
        DetailLaporan detail = detailLaporanRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Detail laporan tidak ditemukan"));
        
        // Check authorization
        if (!detail.getLaporan().getUserId().equals(userId)) {
            throw new SecurityException("Anda tidak memiliki akses untuk upload file ke detail laporan ini");
        }
        
        // Validate file type against allowed types
        String jenisFile = getFileType(file.getOriginalFilename());
        List<String> allowedTypes = getAllowedFileTypes(detail.getTahapanLaporan());
        
        if (!allowedTypes.contains(jenisFile)) {
            throw new RuntimeException("Jenis file tidak diizinkan untuk tahapan ini");
        }
        
        // Upload file
        String filePath = fileUploadService.uploadFile(file, "laporan");
        
        // Save lampiran
        LampiranLaporan lampiran = new LampiranLaporan();
        lampiran.setDetailLaporan(detail);
        lampiran.setNamaFile(file.getOriginalFilename());
        lampiran.setPathFile(filePath);
        lampiran.setJenisFile(jenisFile);
        lampiran.setUkuranFile(file.getSize());
        lampiran.setCreatedAt(LocalDateTime.now());
        
        LampiranLaporan savedLampiran = lampiranLaporanRepository.save(lampiran);
        return convertLampiranToDto(savedLampiran);
    }
    
    // Get statistics
    public LaporanStats getLaporanStats(Long userId) {
        Object[] stats = laporanRepository.getLaporanStatistics(userId);
        if (stats.length > 0) {
            Object[] row = (Object[]) stats[0];
            return new LaporanStats(
                ((Number) row[0]).longValue(), // total
                ((Number) row[1]).longValue(), // draft
                ((Number) row[2]).longValue(), // dalam proses
                ((Number) row[3]).longValue(), // selesai
                ((Number) row[4]).longValue()  // ditolak
            );
        }
        return new LaporanStats(0, 0, 0, 0, 0);
    }
    
    // Helper methods
    private String getFileType(String filename) {
        if (filename == null) return "unknown";
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg", "png", "gif", "bmp" -> "image";
            case "mp4", "avi", "mov", "wmv", "flv", "webm" -> "video";
            case "pdf" -> "pdf";
            case "xls", "xlsx" -> "excel";
            case "doc", "docx" -> "word";
            default -> "unknown";
        };
    }
    
    private List<String> getAllowedFileTypes(TahapanLaporan tahapan) {
        if (tahapan.getJenisFileIzin() == null) {
            return List.of();
        }
        
        try {
            return objectMapper.readValue(
                tahapan.getJenisFileIzin(), 
                new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            log.error("Error parsing allowed file types", e);
            return List.of();
        }
    }
    
    // Convert entity to DTO
    private LaporanDto convertToDto(Laporan laporan) {
        LaporanDto dto = new LaporanDto();
        dto.setLaporanId(laporan.getLaporanId());
        dto.setNamaLaporan(laporan.getNamaLaporan());
        dto.setDeskripsi(laporan.getDeskripsi());
        dto.setNamaPelapor(laporan.getNamaPelapor());
        dto.setAlamatPelapor(laporan.getAlamatPelapor());
        dto.setUserId(laporan.getUserId());
        dto.setStatus(laporan.getStatus());
        dto.setCreatedAt(laporan.getCreatedAt());
        dto.setUpdatedAt(laporan.getUpdatedAt());
        dto.setJenisLaporanId(laporan.getJenisLaporan().getJenisLaporanId());
        dto.setJenisLaporanNama(laporan.getJenisLaporan().getNama());
        
        // Calculate progress
        Object[] progress = detailLaporanRepository.getLaporanProgress(laporan.getLaporanId());
        if (progress != null && progress.length >= 2) {
            try {
                // Handle potential null values and different number types
                Object totalObj = progress[0];
                Object selesaiObj = progress[1];
                
                long total = 0;
                long selesai = 0;
                
                if (totalObj != null) {
                    if (totalObj instanceof Number) {
                        total = ((Number) totalObj).longValue();
                    } else {
                        log.warn("Total progress is not a Number: {} for laporan {}", totalObj.getClass(), laporan.getLaporanId());
                    }
                }
                
                if (selesaiObj != null) {
                    if (selesaiObj instanceof Number) {
                        selesai = ((Number) selesaiObj).longValue();
                    } else {
                        log.warn("Selesai progress is not a Number: {} for laporan {}", selesaiObj.getClass(), laporan.getLaporanId());
                    }
                }
                
                dto.setTotalTahapan((int) total);
                dto.setTahapanSelesai((int) selesai);
                dto.setProgressPercentage(total > 0 ? (int) ((selesai * 100) / total) : 0);
            } catch (Exception e) {
                log.error("Error calculating progress for laporan {}: {}", laporan.getLaporanId(), e.getMessage());
                // Set default values if calculation fails
                dto.setTotalTahapan(0);
                dto.setTahapanSelesai(0);
                dto.setProgressPercentage(0);
            }
        } else {
            // Set default values if no progress data
            dto.setTotalTahapan(0);
            dto.setTahapanSelesai(0);
            dto.setProgressPercentage(0);
        }
        
        return dto;
    }
    
    private LaporanDto convertToDtoWithDetails(Laporan laporan) {
        LaporanDto dto = convertToDto(laporan);
        
        // Get detail laporan
        List<DetailLaporan> detailList = detailLaporanRepository
                .findByLaporanLaporanIdOrderByTahapanLaporanUrutanTahapanAsc(laporan.getLaporanId());
        
        dto.setDetailLaporanList(detailList.stream()
                .map(this::convertDetailToDto)
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    private DetailLaporanDto convertDetailToDto(DetailLaporan detail) {
        DetailLaporanDto dto = new DetailLaporanDto();
        dto.setDetailLaporanId(detail.getDetailLaporanId());
        dto.setKonten(detail.getKonten());
        dto.setStatus(detail.getStatus());
        dto.setCreatedAt(detail.getCreatedAt());
        dto.setUpdatedAt(detail.getUpdatedAt());
        dto.setLaporanId(detail.getLaporan().getLaporanId());
        dto.setTahapanLaporanId(detail.getTahapanLaporan().getTahapanLaporanId());
        dto.setTahapanNama(detail.getTahapanLaporan().getNama());
        dto.setTahapanDeskripsi(detail.getTahapanLaporan().getDeskripsi());
        dto.setTemplateTahapan(detail.getTahapanLaporan().getTemplateTahapan());
        dto.setUrutanTahapan(detail.getTahapanLaporan().getUrutanTahapan());
        
        // Parse allowed file types
        List<String> allowedTypes = getAllowedFileTypes(detail.getTahapanLaporan());
        dto.setJenisFileIzin(allowedTypes);
        
        // Get lampiran
        List<LampiranLaporan> lampiranList = lampiranLaporanRepository
                .findByDetailLaporanDetailLaporanIdOrderByCreatedAtDesc(detail.getDetailLaporanId());
        
        dto.setLampiranList(lampiranList.stream()
                .map(this::convertLampiranToDto)
                .collect(Collectors.toList()));
        
        dto.setJumlahLampiran(lampiranList.size());
        
        return dto;
    }
    
    private LampiranLaporanDto convertLampiranToDto(LampiranLaporan lampiran) {
        LampiranLaporanDto dto = new LampiranLaporanDto();
        dto.setLampiranId(lampiran.getLampiranId());
        dto.setNamaFile(lampiran.getNamaFile());
        dto.setPathFile(lampiran.getPathFile());
        dto.setJenisFile(lampiran.getJenisFile());
        dto.setUkuranFile(lampiran.getUkuranFile());
        dto.setUkuranFileFormatted(formatFileSize(lampiran.getUkuranFile()));
        dto.setCreatedAt(lampiran.getCreatedAt());
        dto.setDetailLaporanId(lampiran.getDetailLaporan().getDetailLaporanId());
        dto.setDownloadUrl("/api/laporan/lampiran/" + lampiran.getLampiranId() + "/download");
        
        return dto;
    }
    
    private Laporan convertToEntity(LaporanDto dto) {
        Laporan entity = new Laporan();
        entity.setLaporanId(dto.getLaporanId());
        entity.setNamaLaporan(dto.getNamaLaporan());
        entity.setDeskripsi(dto.getDeskripsi());
        entity.setNamaPelapor(dto.getNamaPelapor());
        entity.setAlamatPelapor(dto.getAlamatPelapor());
        entity.setUserId(dto.getUserId());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : Laporan.StatusLaporan.DRAFT);
        return entity;
    }
    
    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.1f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024) return String.format("%.1f MB", size / (1024.0 * 1024));
        return String.format("%.1f GB", size / (1024.0 * 1024 * 1024));
    }
    
    // Statistics class
    public static class LaporanStats {
        private final long total;
        private final long draft;
        private final long dalamProses;
        private final long selesai;
        private final long ditolak;
        
        public LaporanStats(long total, long draft, long dalamProses, long selesai, long ditolak) {
            this.total = total;
            this.draft = draft;
            this.dalamProses = dalamProses;
            this.selesai = selesai;
            this.ditolak = ditolak;
        }
        
        public long getTotal() { return total; }
        public long getDraft() { return draft; }
        public long getDalamProses() { return dalamProses; }
        public long getSelesai() { return selesai; }
        public long getDitolak() { return ditolak; }
    }
}

package com.shadcn.backend.service;

import com.shadcn.backend.dto.DetailLaporanRequest;
import com.shadcn.backend.dto.DetailLaporanResponse;
import com.shadcn.backend.dto.PaginatedResponse;
import com.shadcn.backend.model.*;
import com.shadcn.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionLaporanService {

    @Autowired
    private SubmissionLaporanRepository submissionLaporanRepository;
    
    @Autowired
    private SubmissionLampiranRepository submissionLampiranRepository;
    
    @Autowired
    private PegawaiRepository pegawaiRepository;
    
    @Autowired
    private TahapanLaporanRepository tahapanLaporanRepository;
    
    @Autowired
    private JenisLaporanRepository jenisLaporanRepository;
    
    @Autowired
    private LaporanRepository laporanRepository;
    
    @Autowired
    private PemilihanRepository pemilihanRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadsDirectory;
    
    @Value("${app.upload.temp-dir:/storage/temp}")
    private String tempDirectory;
    
    @Value("${app.upload.document-dir:/storage/documents}")
    private String documentsDirectory;

    @Transactional
    public DetailLaporanResponse createSubmission(DetailLaporanRequest request) {
        try {
            // First, try to find a Pegawai with the provided userId
            Pegawai pegawai = null;
            Optional<Pegawai> pegawaiOpt = pegawaiRepository.findById(request.getUserId().longValue());
            
            if (pegawaiOpt.isPresent()) {
                pegawai = pegawaiOpt.get();
            } else {
                // If Pegawai not found, this might be a User ID (admin user)
                // In this case, we'll use the first available Pegawai as a fallback
                List<Pegawai> allPegawai = pegawaiRepository.findAll();
                if (!allPegawai.isEmpty()) {
                    // Use the first Pegawai as a fallback for admin submissions
                    pegawai = allPegawai.get(0);
                } else {
                    throw new RuntimeException("Tidak ada Pegawai yang tersedia untuk membuat submission");
                }
            }

            TahapanLaporan tahapan = tahapanLaporanRepository.findById(request.getTahapanLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Tahapan laporan tidak ditemukan"));

            JenisLaporan jenis = jenisLaporanRepository.findById(request.getJenisLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Jenis laporan tidak ditemukan"));

            Laporan laporan = laporanRepository.findById(request.getLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));

            Pemilihan pemilihan = pemilihanRepository.findById(request.getPemilihanId().longValue())
                .orElseThrow(() -> new RuntimeException("Pemilihan tidak ditemukan"));

            // Create submission
            SubmissionLaporan submission = new SubmissionLaporan();
            submission.setJudul(request.getJudul());
            submission.setKonten(request.getKonten());
            submission.setLokasi(request.getLokasi());
            submission.setTanggalLaporan(request.getTanggalLaporan());
            submission.setPegawai(pegawai);
            submission.setTahapanLaporan(tahapan);
            submission.setJenisLaporan(jenis);
            submission.setLaporan(laporan);
            submission.setPemilihan(pemilihan);
            submission.setStatus(SubmissionLaporan.StatusLaporan.SUBMITTED);

            submission = submissionLaporanRepository.save(submission);

            // Process temp files
            List<String> permanentFiles = new ArrayList<>();
            if (request.getTempFiles() != null && !request.getTempFiles().isEmpty()) {
                permanentFiles = moveTempFilesToPermanent(request.getTempFiles(), submission);
            }

            // Create response
            DetailLaporanResponse response = new DetailLaporanResponse();
            response.setId(submission.getId().intValue());
            response.setJudul(submission.getJudul());
            response.setKonten(submission.getKonten());
            response.setLokasi(submission.getLokasi());
            response.setTanggalLaporan(submission.getTanggalLaporan());
            response.setStatus(submission.getStatus().toString());
            response.setFiles(permanentFiles);
            response.setTanggalBuat(submission.getTanggalBuat());
            response.setTahapanLaporanId(submission.getTahapanLaporan().getTahapanLaporanId().intValue());
            response.setJenisLaporanId(submission.getJenisLaporan().getJenisLaporanId().intValue());
            response.setLaporanId(submission.getLaporan().getLaporanId().intValue());
            response.setPemilihanId(submission.getPemilihan().getPemilihanId().intValue());
            response.setUserId(submission.getPegawai().getId().intValue());
            response.setUserName(submission.getPegawai().getFullName());

            // Set related entity names
            response.setPemilihanJudul(submission.getPemilihan().getNamaPemilihan());
            response.setLaporanNama(submission.getLaporan().getNamaLaporan());
            response.setJenisLaporanNama(submission.getJenisLaporan().getNama());
            response.setTahapanLaporanNama(submission.getTahapanLaporan().getNama());

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat submission: " + e.getMessage(), e);
        }
    }

    private List<String> moveTempFilesToPermanent(List<String> tempFiles, SubmissionLaporan submission) {
        List<String> permanentFiles = new ArrayList<>();
        
        for (String tempFileName : tempFiles) {
            try {
                Path tempPath = Paths.get(tempDirectory, tempFileName);
                // Store in uploads/documents directory for consistency with FileController
                Path permanentPath = Paths.get(uploadsDirectory, "documents", tempFileName);
                
                if (Files.exists(tempPath)) {
                    // Create documents directory if it doesn't exist
                    Files.createDirectories(permanentPath.getParent());
                    
                    // Move file from temp to permanent
                    Files.move(tempPath, permanentPath, StandardCopyOption.REPLACE_EXISTING);
                    
                    // Create lampiran record
                    SubmissionLampiran lampiran = new SubmissionLampiran();
                    lampiran.setNamaFile(tempFileName);
                    lampiran.setPathFile(permanentPath.toString());
                    lampiran.setTipeFile(getFileExtension(tempFileName));
                    lampiran.setUkuranFile(Files.size(permanentPath));
                    lampiran.setSubmissionLaporan(submission);
                    
                    submissionLampiranRepository.save(lampiran);
                    permanentFiles.add(tempFileName);
                    
                    System.out.println("Successfully moved file: " + tempFileName + " to " + permanentPath);
                }
            } catch (IOException e) {
                System.err.println("Error moving file " + tempFileName + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return permanentFiles;
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1).toLowerCase();
        }
        return "";
    }

    public PaginatedResponse<DetailLaporanResponse> getSubmissionsByUserPaginated(
            Long userId, 
            int page, 
            int size, 
            String search,
            Integer pemilihanId, 
            Integer laporanId, 
            Integer jenisLaporanId, 
            Integer tahapanLaporanId,
            Long pegawaiId,
            String startDate,
            String endDate) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("tanggalBuat").descending());
        Page<SubmissionLaporan> submissionPage;
        
        // If pegawaiId is null or "all" (represented as null in Long), show all submissions
        // This should only happen for admin users
        if (pegawaiId == null) {
            submissionPage = submissionLaporanRepository.findAllByOrderByTanggalBuatDesc(pageable);
        } else {
            submissionPage = submissionLaporanRepository.findByPegawaiIdOrderByTanggalBuatDesc(pegawaiId, pageable);
        }
        
        List<DetailLaporanResponse> filteredSubmissions = submissionPage.getContent().stream()
            .filter(submission -> {
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase();
                    return submission.getJudul().toLowerCase().contains(searchLower) ||
                           submission.getKonten().toLowerCase().contains(searchLower) ||
                           submission.getLokasi().toLowerCase().contains(searchLower);
                }
                return true;
            })
            .filter(submission -> pemilihanId == null || 
                   submission.getPemilihan().getPemilihanId().equals(pemilihanId.longValue()))
            .filter(submission -> laporanId == null || 
                   submission.getLaporan().getLaporanId().equals(laporanId.longValue()))
            .filter(submission -> jenisLaporanId == null || 
                   submission.getJenisLaporan().getJenisLaporanId().equals(jenisLaporanId.longValue()))
            .filter(submission -> tahapanLaporanId == null || 
                   submission.getTahapanLaporan().getTahapanLaporanId().equals(tahapanLaporanId.longValue()))
            .filter(submission -> {
                // Date range filtering based on tanggalLaporan
                if (startDate != null || endDate != null) {
                    return isWithinDateRange(submission.getTanggalLaporan(), startDate, endDate);
                }
                return true;
            })
            .map(this::convertToResponse)
            .toList();
        
        PaginatedResponse.PageInfo pageInfo = new PaginatedResponse.PageInfo();
        pageInfo.setPage(page);
        pageInfo.setSize(size);
        pageInfo.setTotalPages(submissionPage.getTotalPages());
        pageInfo.setTotalElements(submissionPage.getTotalElements());
        
        PaginatedResponse<DetailLaporanResponse> response = new PaginatedResponse<>();
        response.setContent(filteredSubmissions);
        response.setPage(pageInfo);
        
        return response;
    }

    public List<DetailLaporanResponse> getSubmissionsByUser(Long userId) {
        List<SubmissionLaporan> submissions = submissionLaporanRepository.findByPegawaiIdOrderByTanggalBuatDesc(userId);
        return submissions.stream().map(this::convertToResponse).toList();
    }

    public List<DetailLaporanResponse> getSubmissionsByUser(Long userId, Integer pemilihanId, Integer laporanId, Integer jenisLaporanId, Integer tahapanLaporanId) {
        List<SubmissionLaporan> submissions = submissionLaporanRepository.findByPegawaiIdOrderByTanggalBuatDesc(userId);
        
        // Apply filters
        if (pemilihanId != null) {
            submissions = submissions.stream()
                .filter(s -> s.getPemilihan().getPemilihanId().equals(pemilihanId.longValue()))
                .toList();
        }
        
        if (laporanId != null) {
            submissions = submissions.stream()
                .filter(s -> s.getLaporan().getLaporanId().equals(laporanId.longValue()))
                .toList();
        }
        
        if (jenisLaporanId != null) {
            submissions = submissions.stream()
                .filter(s -> s.getJenisLaporan().getJenisLaporanId().equals(jenisLaporanId.longValue()))
                .toList();
        }
        
        if (tahapanLaporanId != null) {
            submissions = submissions.stream()
                .filter(s -> s.getTahapanLaporan().getTahapanLaporanId().equals(tahapanLaporanId.longValue()))
                .toList();
        }
        
        return submissions.stream().map(this::convertToResponse).toList();
    }

    public List<DetailLaporanResponse> getSubmissionsByUserAndStatus(Long userId, SubmissionLaporan.StatusLaporan status) {
        List<SubmissionLaporan> submissions = submissionLaporanRepository.findByPegawaiIdAndStatusOrderByTanggalBuatDesc(userId, status);
        return submissions.stream().map(this::convertToResponse).toList();
    }

    public Optional<DetailLaporanResponse> getSubmissionById(Long id, Long userId) {
        Optional<SubmissionLaporan> submission = submissionLaporanRepository.findById(id);
        if (submission.isPresent() && submission.get().getPegawai().getId().equals(userId)) {
            return Optional.of(convertToResponse(submission.get()));
        }
        return Optional.empty();
    }

    public Optional<DetailLaporanResponse> getSubmissionById(Long id, Long userId, boolean isAdmin) {
        Optional<SubmissionLaporan> submission = submissionLaporanRepository.findById(id);
        if (submission.isPresent()) {
            // If admin, allow access to any submission
            // If not admin, only allow access to own submissions
            if (isAdmin || submission.get().getPegawai().getId().equals(userId)) {
                return Optional.of(convertToResponse(submission.get()));
            }
        }
        return Optional.empty();
    }

    @Transactional
    public DetailLaporanResponse updateSubmission(Long id, Long userId, DetailLaporanRequest request) {
        return updateSubmission(id, userId, request, false);
    }

    @Transactional
    public DetailLaporanResponse updateSubmission(Long id, Long userId, DetailLaporanRequest request, boolean isAdmin) {
        try {
            // Find existing submission
            Optional<SubmissionLaporan> existingSubmissionOpt = submissionLaporanRepository.findById(id);
            if (existingSubmissionOpt.isEmpty()) {
                throw new RuntimeException("Submission tidak ditemukan");
            }

            SubmissionLaporan existingSubmission = existingSubmissionOpt.get();

            // Check access: admin can edit any submission, regular users can only edit their own
            if (!isAdmin && !existingSubmission.getPegawai().getId().equals(userId)) {
                throw new RuntimeException("Tidak memiliki akses untuk mengedit laporan ini");
            }

            // Check if submission can be edited (not approved)
            if (existingSubmission.getStatus() == SubmissionLaporan.StatusLaporan.APPROVED) {
                throw new RuntimeException("Laporan yang sudah disetujui tidak dapat diedit");
            }

            // Validate required entities
            Pegawai pegawai = pegawaiRepository.findById(request.getUserId().longValue())
                .orElseThrow(() -> new RuntimeException("Pegawai tidak ditemukan"));

            TahapanLaporan tahapan = tahapanLaporanRepository.findById(request.getTahapanLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Tahapan laporan tidak ditemukan"));

            JenisLaporan jenis = jenisLaporanRepository.findById(request.getJenisLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Jenis laporan tidak ditemukan"));

            Laporan laporan = laporanRepository.findById(request.getLaporanId().longValue())
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));

            Pemilihan pemilihan = pemilihanRepository.findById(request.getPemilihanId().longValue())
                .orElseThrow(() -> new RuntimeException("Pemilihan tidak ditemukan"));

            // Update submission
            existingSubmission.setJudul(request.getJudul());
            existingSubmission.setKonten(request.getKonten());
            existingSubmission.setLokasi(request.getLokasi());
            existingSubmission.setTanggalLaporan(request.getTanggalLaporan());
            existingSubmission.setPegawai(pegawai);
            
            existingSubmission.setTahapanLaporan(tahapan);
            existingSubmission.setJenisLaporan(jenis);
            existingSubmission.setLaporan(laporan);
            existingSubmission.setPemilihan(pemilihan);

            existingSubmission = submissionLaporanRepository.save(existingSubmission);

            // Handle file management
            List<String> permanentFiles = new ArrayList<>();
            List<String> filesToKeep = new ArrayList<>();
            
            // Get existing files
            List<SubmissionLampiran> existingLampiran = submissionLampiranRepository.findBySubmissionLaporanIdOrderByTanggalUploadDesc(existingSubmission.getId());
            
            // Add permanent files that should be kept (files that user wants to keep)
            if (request.getPermanentFiles() != null) {
                for (String filename : request.getPermanentFiles()) {
                    // Clean the filename - remove any 'documents/' prefix
                    String cleanFilename = filename.replace("documents/", "");
                    filesToKeep.add(cleanFilename);
                }
            }
            
            // Process temp files if provided
            if (request.getTempFiles() != null && !request.getTempFiles().isEmpty()) {
                permanentFiles = moveTempFilesToPermanent(request.getTempFiles(), existingSubmission);
                filesToKeep.addAll(permanentFiles);
            }
            
            // Delete files that are no longer needed (files not in filesToKeep list)
            for (SubmissionLampiran lampiran : existingLampiran) {
                String existingFilename = lampiran.getNamaFile();
                String cleanExistingFilename = existingFilename.replace("documents/", "");
                
                if (!filesToKeep.contains(existingFilename) && !filesToKeep.contains(cleanExistingFilename)) {
                    try {
                        // Delete physical file
                        Path filePath = Paths.get(uploadsDirectory, "documents", cleanExistingFilename);
                        Files.deleteIfExists(filePath);
                        System.out.println("Deleted unused file: " + cleanExistingFilename);
                        
                        // Delete from database
                        submissionLampiranRepository.delete(lampiran);
                    } catch (IOException e) {
                        System.err.println("Error deleting file " + cleanExistingFilename + ": " + e.getMessage());
                    }
                }
            }

            // Create response
            DetailLaporanResponse response = new DetailLaporanResponse();
            response.setId(existingSubmission.getId().intValue());
            response.setJudul(existingSubmission.getJudul());
            response.setKonten(existingSubmission.getKonten());
            response.setLokasi(existingSubmission.getLokasi());
            response.setTanggalLaporan(existingSubmission.getTanggalLaporan());
            response.setStatus(existingSubmission.getStatus().toString());
            response.setTanggalBuat(existingSubmission.getTanggalBuat());
            response.setTahapanLaporanId(existingSubmission.getTahapanLaporan().getTahapanLaporanId().intValue());
            response.setJenisLaporanId(existingSubmission.getJenisLaporan().getJenisLaporanId().intValue());
            response.setLaporanId(existingSubmission.getLaporan().getLaporanId().intValue());
            response.setPemilihanId(existingSubmission.getPemilihan().getPemilihanId().intValue());
            response.setUserId(existingSubmission.getPegawai().getId().intValue());
            response.setUserName(existingSubmission.getPegawai().getFullName());

            // Set related entity names
            response.setPemilihanJudul(existingSubmission.getPemilihan().getNamaPemilihan());
            response.setLaporanNama(existingSubmission.getLaporan().getNamaLaporan());
            response.setJenisLaporanNama(existingSubmission.getJenisLaporan().getNama());
            response.setTahapanLaporanNama(existingSubmission.getTahapanLaporan().getNama());

            // Get existing files
            List<SubmissionLampiran> lampiranList = submissionLampiranRepository.findBySubmissionLaporanIdOrderByTanggalUploadDesc(existingSubmission.getId());
            List<String> files = lampiranList.stream().map(SubmissionLampiran::getNamaFile).collect(java.util.stream.Collectors.toList());
            response.setFiles(files);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Gagal mengupdate submission: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteSubmission(Long id, Long userId) {
        Optional<SubmissionLaporan> submission = submissionLaporanRepository.findById(id);
        if (submission.isPresent() && submission.get().getPegawai().getId().equals(userId)) {
            SubmissionLaporan submissionEntity = submission.get();
            
            // Delete associated files first
            List<SubmissionLampiran> lampiranList = submissionLampiranRepository.findBySubmissionLaporanIdOrderByTanggalUploadDesc(submissionEntity.getId());
            for (SubmissionLampiran lampiran : lampiranList) {
                try {
                    // Delete physical file
                    Path filePath = Paths.get(uploadsDirectory, "documents", lampiran.getNamaFile());
                    Files.deleteIfExists(filePath);
                    System.out.println("Deleted file: " + lampiran.getNamaFile());
                } catch (IOException e) {
                    System.err.println("Error deleting file " + lampiran.getNamaFile() + ": " + e.getMessage());
                }
            }
            
            // Delete the submission (lampiran records will be deleted by cascade)
            submissionLaporanRepository.delete(submissionEntity);
        } else {
            throw new RuntimeException("Submission tidak ditemukan atau tidak memiliki akses");
        }
    }

    private DetailLaporanResponse convertToResponse(SubmissionLaporan submission) {
        DetailLaporanResponse response = new DetailLaporanResponse();
        response.setId(submission.getId().intValue());
        response.setJudul(submission.getJudul());
        response.setKonten(submission.getKonten());
        response.setLokasi(submission.getLokasi());
        response.setTanggalLaporan(submission.getTanggalLaporan());
        response.setStatus(submission.getStatus().toString());
        response.setTanggalBuat(submission.getTanggalBuat());
        response.setTahapanLaporanId(submission.getTahapanLaporan().getTahapanLaporanId().intValue());
        response.setJenisLaporanId(submission.getJenisLaporan().getJenisLaporanId().intValue());
        response.setLaporanId(submission.getLaporan().getLaporanId().intValue());
        response.setPemilihanId(submission.getPemilihan().getPemilihanId().intValue());
        response.setUserId(submission.getPegawai().getId().intValue());
        
        // Get the user name from Pegawai
        response.setUserName(submission.getPegawai().getFullName());

        // Set related entity names
        response.setPemilihanJudul(submission.getPemilihan().getNamaPemilihan());
        response.setLaporanNama(submission.getLaporan().getNamaLaporan());
        response.setJenisLaporanNama(submission.getJenisLaporan().getNama());
        response.setTahapanLaporanNama(submission.getTahapanLaporan().getNama());

        // Get files
        List<SubmissionLampiran> lampiranList = submissionLampiranRepository.findBySubmissionLaporanIdOrderByTanggalUploadDesc(submission.getId());
        List<String> files = lampiranList.stream().map(SubmissionLampiran::getNamaFile).toList();
        response.setFiles(files);

        return response;
    }
    
    /**
     * Helper method to check if a date string is within the specified date range
     * @param tanggalLaporan the date string from the submission (format: YYYY-MM-DD or DD/MM/YYYY)
     * @param startDate start date string (format: YYYY-MM-DD)
     * @param endDate end date string (format: YYYY-MM-DD)
     * @return true if the date is within range, false otherwise
     */
    private boolean isWithinDateRange(String tanggalLaporan, String startDate, String endDate) {
        if (tanggalLaporan == null || tanggalLaporan.trim().isEmpty()) {
            return false;
        }
        
        try {
            LocalDate laporanDate = parseDate(tanggalLaporan);
            if (laporanDate == null) {
                return false;
            }
            
            LocalDate start = null;
            LocalDate end = null;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE);
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                end = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
            }
            
            boolean afterStart = start == null || !laporanDate.isBefore(start);
            boolean beforeEnd = end == null || !laporanDate.isAfter(end);
            
            return afterStart && beforeEnd;
            
        } catch (DateTimeParseException e) {
            // If date parsing fails, exclude this record
            return false;
        }
    }
    
    /**
     * Helper method to parse date string in various formats
     * @param dateString the date string to parse
     * @return LocalDate object or null if parsing fails
     */
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        String cleanDate = dateString.trim();
        
        try {
            // Try ISO format first (YYYY-MM-DD)
            return LocalDate.parse(cleanDate, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e1) {
            try {
                // Try DD/MM/YYYY format
                return LocalDate.parse(cleanDate, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (DateTimeParseException e2) {
                try {
                    // Try DD-MM-YYYY format
                    return LocalDate.parse(cleanDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
                } catch (DateTimeParseException e3) {
                    // If all formats fail, return null
                    return null;
                }
            }
        }
    }
}

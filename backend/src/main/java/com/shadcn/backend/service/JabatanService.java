package com.shadcn.backend.service;

import com.shadcn.backend.model.Jabatan;
import com.shadcn.backend.repository.JabatanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JabatanService {
    
    private final JabatanRepository jabatanRepository;
    
    public Page<Jabatan> getAllJabatanPaged(String search, int page, int size, String sortBy, String sortDirection) {
        try {
            Sort.Direction direction = Sort.Direction.fromString(sortDirection);
            Sort sort = Sort.by(direction, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            return jabatanRepository.findBySearchTerm(search, pageable);
        } catch (Exception e) {
            log.error("Error fetching jabatan with pagination: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch jabatan data: " + e.getMessage());
        }
    }
    
    public List<Jabatan> getAllActiveJabatan() {
        try {
            return jabatanRepository.findByIsActiveTrueOrderBySortOrderAscNamaAsc();
        } catch (Exception e) {
            log.error("Error fetching active jabatan: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch active jabatan: " + e.getMessage());
        }
    }
    
    public List<Jabatan> getAllJabatan() {
        try {
            return jabatanRepository.findAllByOrderBySortOrderAscNamaAsc();
        } catch (Exception e) {
            log.error("Error fetching all jabatan: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch jabatan data: " + e.getMessage());
        }
    }
    
    public Optional<Jabatan> getJabatanById(Long id) {
        try {
            return jabatanRepository.findById(id);
        } catch (Exception e) {
            log.error("Error fetching jabatan by id {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch jabatan: " + e.getMessage());
        }
    }
    
    public Optional<Jabatan> getJabatanByNama(String nama) {
        try {
            return jabatanRepository.findByNamaIgnoreCase(nama);
        } catch (Exception e) {
            log.error("Error fetching jabatan by nama {}: {}", nama, e.getMessage());
            throw new RuntimeException("Failed to fetch jabatan: " + e.getMessage());
        }
    }
    
    public Jabatan createJabatan(Jabatan jabatan) {
        try {
            // Check if nama already exists
            if (jabatanRepository.existsByNamaIgnoreCase(jabatan.getNama())) {
                throw new RuntimeException("Jabatan dengan nama '" + jabatan.getNama() + "' sudah ada");
            }
            
            log.info("Creating new jabatan: {}", jabatan.getNama());
            return jabatanRepository.save(jabatan);
        } catch (Exception e) {
            log.error("Error creating jabatan: {}", e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to create jabatan: " + e.getMessage());
        }
    }
    
    public Jabatan updateJabatan(Long id, Jabatan updatedJabatan) {
        try {
            Jabatan existingJabatan = jabatanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jabatan tidak ditemukan dengan ID: " + id));
            
            // Check if nama already exists for other records
            if (jabatanRepository.existsByNamaIgnoreCaseAndIdNot(updatedJabatan.getNama(), id)) {
                throw new RuntimeException("Jabatan dengan nama '" + updatedJabatan.getNama() + "' sudah ada");
            }
            
            existingJabatan.setNama(updatedJabatan.getNama());
            existingJabatan.setDeskripsi(updatedJabatan.getDeskripsi());
            existingJabatan.setIsActive(updatedJabatan.getIsActive());
            existingJabatan.setSortOrder(updatedJabatan.getSortOrder());
            
            log.info("Updating jabatan: {}", existingJabatan.getNama());
            return jabatanRepository.save(existingJabatan);
        } catch (Exception e) {
            log.error("Error updating jabatan with id {}: {}", id, e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to update jabatan: " + e.getMessage());
        }
    }
    
    public void deleteJabatan(Long id) {
        try {
            Jabatan jabatan = jabatanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jabatan tidak ditemukan dengan ID: " + id));
            
            log.info("Deleting jabatan: {}", jabatan.getNama());
            jabatanRepository.delete(jabatan);
        } catch (Exception e) {
            log.error("Error deleting jabatan with id {}: {}", id, e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to delete jabatan: " + e.getMessage());
        }
    }
    
    public Jabatan toggleJabatanStatus(Long id) {
        try {
            Jabatan jabatan = jabatanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jabatan tidak ditemukan dengan ID: " + id));
            
            jabatan.setIsActive(!jabatan.getIsActive());
            
            log.info("Toggling jabatan status: {} to {}", jabatan.getNama(), jabatan.getIsActive());
            return jabatanRepository.save(jabatan);
        } catch (Exception e) {
            log.error("Error toggling jabatan status with id {}: {}", id, e.getMessage());
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to toggle jabatan status: " + e.getMessage());
        }
    }
}

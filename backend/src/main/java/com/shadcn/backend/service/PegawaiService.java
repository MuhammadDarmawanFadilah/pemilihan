package com.shadcn.backend.service;

import com.shadcn.backend.model.Pegawai;
import com.shadcn.backend.model.Pemilihan;
import com.shadcn.backend.dto.PegawaiRequest;
import com.shadcn.backend.dto.UpdatePegawaiRequest;
import com.shadcn.backend.dto.PegawaiResponse;
import com.shadcn.backend.repository.PegawaiRepository;
import com.shadcn.backend.repository.PemilihanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PegawaiService {

    private final PegawaiRepository pegawaiRepository;
    private final PemilihanRepository pemilihanRepository;
    private final PasswordEncoder passwordEncoder;
    private final WilayahCacheService wilayahCacheService;

    public List<PegawaiResponse> getAllPegawai() {
        log.info("Fetching all pegawai");
        return pegawaiRepository.findAll().stream()
                .map(this::createPegawaiResponseWithLocationNames)
                .collect(Collectors.toList());
    }

    public Page<PegawaiResponse> getPegawaiWithPaging(int page, int size, String sortBy, String sortDir) {
        log.info("Fetching pegawai with paging - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Pegawai> pegawaiPage = pegawaiRepository.findAll(pageable);
        return pegawaiPage.map(this::createPegawaiResponseWithLocationNames);
    }

    public Optional<PegawaiResponse> getPegawaiById(Long id) {
        log.info("Fetching pegawai by id: {}", id);
        return pegawaiRepository.findById(id)
                .map(this::createPegawaiResponseWithLocationNames);
    }

    public Optional<PegawaiResponse> getPegawaiByUsername(String username) {
        log.info("Fetching pegawai by username: {}", username);
        return pegawaiRepository.findByUsername(username)
                .map(this::createPegawaiResponseWithLocationNames);
    }

    public List<PegawaiResponse> searchPegawai(String keyword) {
        log.info("Searching pegawai with keyword: {}", keyword);
        List<Pegawai> pegawaiList = pegawaiRepository.findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword, keyword);
        return pegawaiList.stream()
                .map(this::createPegawaiResponseWithLocationNames)
                .collect(Collectors.toList());
    }

    public Page<PegawaiResponse> searchPegawaiWithPaging(String keyword, int page, int size) {
        log.info("Searching pegawai with paging - keyword: {}, page: {}, size: {}", keyword, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        Page<Pegawai> pegawaiPage = pegawaiRepository.findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword, keyword, pageable);
        
        return pegawaiPage.map(this::createPegawaiResponseWithLocationNames);
    }

    public Page<PegawaiResponse> getPegawaiWithFilters(String search, String nama, String email, String phoneNumber, 
                                                       String status, String jabatan, int page, int size, String sortBy, String sortDir) {
        log.info("Fetching pegawai with filters - search: {}, nama: {}, email: {}, phoneNumber: {}, status: {}, jabatan: {}, page: {}, size: {}", 
                search, nama, email, phoneNumber, status, jabatan, page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // If no filters are applied, return all pegawai
        if ((search == null || search.trim().isEmpty()) && 
            (nama == null || nama.trim().isEmpty()) &&
            (email == null || email.trim().isEmpty()) &&
            (phoneNumber == null || phoneNumber.trim().isEmpty()) &&
            (status == null || status.trim().isEmpty()) && 
            (jabatan == null || jabatan.trim().isEmpty())) {
            Page<Pegawai> pegawaiPage = pegawaiRepository.findAll(pageable);
            return pegawaiPage.map(this::createPegawaiResponseWithLocationNames);
        }
        
        // Apply filters using custom repository method
        Page<Pegawai> pegawaiPage = pegawaiRepository.findPegawaiWithFilters(search, nama, email, phoneNumber, status, jabatan, pageable);
        return pegawaiPage.map(this::createPegawaiResponseWithLocationNames);
    }

    public PegawaiResponse createPegawai(PegawaiRequest request) {
        log.info("Creating new pegawai: {}", request.getUsername());
        
        // Check if username already exists
        if (pegawaiRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        
        // Check if email already exists
        if (request.getEmail() != null && pegawaiRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        Pegawai pegawai = Pegawai.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .jabatan(request.getJabatan())
                .status(request.getStatus() != null ? 
                    Pegawai.PegawaiStatus.valueOf(request.getStatus()) : 
                    Pegawai.PegawaiStatus.AKTIF)
                .alamat(request.getAlamat())
                .provinsi(request.getProvinsi())
                .kota(request.getKota())
                .kecamatan(request.getKecamatan())
                .kelurahan(request.getKelurahan())
                .kodePos(request.getKodePos())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .photoUrl(request.getPhotoUrl())
                .totalTps(request.getTotalTps())
                .build();

        // Add pemilihan if provided
        if (request.getSelectedPemilihanIds() != null && !request.getSelectedPemilihanIds().isEmpty()) {
            Set<Pemilihan> pemilihanSet = request.getSelectedPemilihanIds().stream()
                    .map(id -> pemilihanRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Pemilihan not found: " + id)))
                    .collect(Collectors.toSet());
            pegawai.setPemilihanList(pemilihanSet);
        }

        Pegawai savedPegawai = pegawaiRepository.save(pegawai);
        log.info("Pegawai created successfully with id: {}", savedPegawai.getId());
        
        return createPegawaiResponseWithLocationNames(savedPegawai);
    }

    public PegawaiResponse updatePegawai(Long id, UpdatePegawaiRequest request) {
        log.info("Updating pegawai with id: {}", id);
        
        Pegawai pegawai = pegawaiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pegawai not found with id: " + id));

        // Check if username is being changed and already exists
        if (request.getUsername() != null && !request.getUsername().equals(pegawai.getUsername())) {
            if (pegawaiRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists: " + request.getUsername());
            }
            pegawai.setUsername(request.getUsername());
        }

        // Check if email is being changed and already exists
        if (request.getEmail() != null && !request.getEmail().equals(pegawai.getEmail())) {
            if (pegawaiRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
            pegawai.setEmail(request.getEmail());
        }

        // Update other fields
        if (request.getFullName() != null) {
            pegawai.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            pegawai.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getJabatan() != null) {
            pegawai.setJabatan(request.getJabatan());
        }
        if (request.getStatus() != null) {
            pegawai.setStatus(Pegawai.PegawaiStatus.valueOf(request.getStatus()));
        }
        if (request.getAlamat() != null) {
            pegawai.setAlamat(request.getAlamat());
        }
        if (request.getProvinsi() != null) {
            pegawai.setProvinsi(request.getProvinsi());
        }
        if (request.getKota() != null) {
            pegawai.setKota(request.getKota());
        }
        if (request.getKecamatan() != null) {
            pegawai.setKecamatan(request.getKecamatan());
        }
        if (request.getKelurahan() != null) {
            pegawai.setKelurahan(request.getKelurahan());
        }
        if (request.getKodePos() != null) {
            pegawai.setKodePos(request.getKodePos());
        }
        if (request.getLatitude() != null) {
            pegawai.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            pegawai.setLongitude(request.getLongitude());
        }
        if (request.getTotalTps() != null) {
            pegawai.setTotalTps(request.getTotalTps());
        }
        if (request.getPhotoUrl() != null) {
            pegawai.setPhotoUrl(request.getPhotoUrl());
        }

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            pegawai.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update pemilihan if provided
        if (request.getSelectedPemilihanIds() != null) {
            Set<Pemilihan> pemilihanSet = request.getSelectedPemilihanIds().stream()
                    .map(pemilihanId -> pemilihanRepository.findById(pemilihanId)
                            .orElseThrow(() -> new RuntimeException("Pemilihan not found: " + pemilihanId)))
                    .collect(Collectors.toSet());
            pegawai.setPemilihanList(pemilihanSet);
        }

        pegawai.setUpdatedAt(LocalDateTime.now());
        Pegawai updatedPegawai = pegawaiRepository.save(pegawai);
        
        log.info("Pegawai updated successfully with id: {}", updatedPegawai.getId());
        return createPegawaiResponseWithLocationNames(updatedPegawai);
    }

    public void deletePegawai(Long id) {
        log.info("Deleting pegawai with id: {}", id);
        
        Pegawai pegawai = pegawaiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pegawai not found with id: " + id));
        
        pegawaiRepository.delete(pegawai);
        log.info("Pegawai deleted successfully with id: {}", id);
    }

    public List<PegawaiResponse> getPegawaiByStatus(Pegawai.PegawaiStatus status) {
        log.info("Fetching pegawai by status: {}", status);
        return pegawaiRepository.findByStatus(status).stream()
                .map(this::createPegawaiResponseWithLocationNames)
                .collect(Collectors.toList());
    }

    public List<PegawaiResponse> getPegawaiByJabatan(String jabatan) {
        log.info("Fetching pegawai by jabatan: {}", jabatan);
        return pegawaiRepository.findByJabatan(jabatan).stream()
                .map(this::createPegawaiResponseWithLocationNames)
                .collect(Collectors.toList());
    }

    public PegawaiResponse assignPemilihanToPegawai(Long pegawaiId, Long pemilihanId) {
        log.info("Assigning pemilihan {} to pegawai {}", pemilihanId, pegawaiId);
        
        Pegawai pegawai = pegawaiRepository.findById(pegawaiId)
                .orElseThrow(() -> new RuntimeException("Pegawai not found with id: " + pegawaiId));
        
        Pemilihan pemilihan = pemilihanRepository.findById(pemilihanId)
                .orElseThrow(() -> new RuntimeException("Pemilihan not found with id: " + pemilihanId));
        
        pegawai.addPemilihan(pemilihan);
        Pegawai savedPegawai = pegawaiRepository.save(pegawai);
        
        log.info("Pemilihan assigned successfully");
        return createPegawaiResponseWithLocationNames(savedPegawai);
    }

    public PegawaiResponse removePemilihanFromPegawai(Long pegawaiId, Long pemilihanId) {
        log.info("Removing pemilihan {} from pegawai {}", pemilihanId, pegawaiId);
        
        Pegawai pegawai = pegawaiRepository.findById(pegawaiId)
                .orElseThrow(() -> new RuntimeException("Pegawai not found with id: " + pegawaiId));
        
        Pemilihan pemilihan = pemilihanRepository.findById(pemilihanId)
                .orElseThrow(() -> new RuntimeException("Pemilihan not found with id: " + pemilihanId));
        
        pegawai.removePemilihan(pemilihan);
        Pegawai savedPegawai = pegawaiRepository.save(pegawai);
        
        log.info("Pemilihan removed successfully");
        return createPegawaiResponseWithLocationNames(savedPegawai);
    }

    public Long getTotalPegawai() {
        return pegawaiRepository.count();
    }

    public Long getTotalActivePegawai() {
        return pegawaiRepository.countByStatus(Pegawai.PegawaiStatus.AKTIF);
    }

    public boolean existsByUsername(String username) {
        return pegawaiRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return pegawaiRepository.existsByEmail(email);
    }

    public Map<String, Boolean> checkDuplicateData(String username, String email, String phoneNumber, Integer excludeId) {
        log.info("Checking duplicate data for username: {}, email: {}, phone: {}, excludeId: {}", 
                username, email, phoneNumber, excludeId);
        
        Map<String, Boolean> result = new HashMap<>();
        Long excludeIdLong = excludeId != null ? excludeId.longValue() : null;
        
        // Check username
        boolean usernameExists = false;
        if (username != null && !username.trim().isEmpty()) {
            if (excludeIdLong != null) {
                usernameExists = pegawaiRepository.existsByUsernameAndIdNot(username.trim(), excludeIdLong);
            } else {
                usernameExists = pegawaiRepository.existsByUsername(username.trim());
            }
        }
        
        // Check email
        boolean emailExists = false;
        if (email != null && !email.trim().isEmpty()) {
            if (excludeIdLong != null) {
                emailExists = pegawaiRepository.existsByEmailAndIdNot(email.trim(), excludeIdLong);
            } else {
                emailExists = pegawaiRepository.existsByEmail(email.trim());
            }
        }
        
        // Check phone number
        boolean phoneExists = false;
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            if (excludeIdLong != null) {
                phoneExists = pegawaiRepository.existsByPhoneNumberAndIdNot(phoneNumber.trim(), excludeIdLong);
            } else {
                phoneExists = pegawaiRepository.existsByPhoneNumber(phoneNumber.trim());
            }
        }
        
        result.put("usernameExists", usernameExists);
        result.put("emailExists", emailExists);
        result.put("phoneExists", phoneExists);
        
        log.info("Duplicate check result: {}", result);
        return result;
    }

    private PegawaiResponse createPegawaiResponseWithLocationNames(Pegawai pegawai) {
        PegawaiResponse response = PegawaiResponse.from(pegawai);
        
        // Add location names using WilayahCacheService
        if (pegawai.getProvinsi() != null) {
            response.setProvinsiNama(wilayahCacheService.getNamaByKode(pegawai.getProvinsi()));
        }
        if (pegawai.getKota() != null) {
            response.setKotaNama(wilayahCacheService.getNamaByKode(pegawai.getKota()));
        }
        if (pegawai.getKecamatan() != null) {
            response.setKecamatanNama(wilayahCacheService.getNamaByKode(pegawai.getKecamatan()));
        }
        if (pegawai.getKelurahan() != null) {
            response.setKelurahanNama(wilayahCacheService.getNamaByKode(pegawai.getKelurahan()));
        }
        
        return response;
    }
}

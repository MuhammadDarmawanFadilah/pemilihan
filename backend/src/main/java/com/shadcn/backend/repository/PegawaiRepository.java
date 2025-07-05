package com.shadcn.backend.repository;

import com.shadcn.backend.model.Pegawai;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PegawaiRepository extends JpaRepository<Pegawai, Long> {
    
    Optional<Pegawai> findByUsername(String username);
    
    Optional<Pegawai> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    // Duplicate check methods for phone number
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Duplicate check methods excluding specific ID (for edit operations)
    boolean existsByUsernameAndIdNot(String username, Long id);
    
    boolean existsByEmailAndIdNot(String email, Long id);
    
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);
    
    List<Pegawai> findByStatus(Pegawai.PegawaiStatus status);
    
    List<Pegawai> findByJabatan(String jabatan);
    
    Long countByStatus(Pegawai.PegawaiStatus status);
    
    // Search methods
    List<Pegawai> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName, String username, String email);
    
    Page<Pegawai> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName, String username, String email, Pageable pageable);
    
    // Query methods for wilayah
    List<Pegawai> findByProvinsi(String provinsi);
    
    List<Pegawai> findByProvinsiAndKota(String provinsi, String kota);
    
    List<Pegawai> findByProvinsiAndKotaAndKecamatan(String provinsi, String kota, String kecamatan);
    
    List<Pegawai> findByProvinsiAndKotaAndKecamatanAndKelurahan(
            String provinsi, String kota, String kecamatan, String kelurahan);
    
    // Query for pegawai with pemilihan
    @Query("SELECT DISTINCT p FROM Pegawai p LEFT JOIN FETCH p.pemilihanList")
    List<Pegawai> findAllWithPemilihan();
    
    @Query("SELECT DISTINCT p FROM Pegawai p LEFT JOIN FETCH p.pemilihanList WHERE p.id = :id")
    Optional<Pegawai> findByIdWithPemilihan(@Param("id") Long id);
    
    @Query("SELECT p FROM Pegawai p JOIN p.pemilihanList pm WHERE pm.pemilihanId = :pemilihanId")
    List<Pegawai> findByPemilihanId(@Param("pemilihanId") Long pemilihanId);
    
    // Advanced filtering query
    @Query("SELECT p FROM Pegawai p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.jabatan) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:nama IS NULL OR :nama = '' OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :nama, '%'))) AND " +
           "(:email IS NULL OR :email = '' OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:phoneNumber IS NULL OR :phoneNumber = '' OR LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :phoneNumber, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR p.status = :status) AND " +
           "(:jabatan IS NULL OR :jabatan = '' OR LOWER(p.jabatan) LIKE LOWER(CONCAT('%', :jabatan, '%')))")
    Page<Pegawai> findPegawaiWithFilters(@Param("search") String search,
                                        @Param("nama") String nama,
                                        @Param("email") String email,
                                        @Param("phoneNumber") String phoneNumber,
                                        @Param("status") String status, 
                                        @Param("jabatan") String jabatan, 
                                        Pageable pageable);
}

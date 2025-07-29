package com.shadcn.backend.repository;

import com.shadcn.backend.model.SubmissionLaporan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionLaporanRepository extends JpaRepository<SubmissionLaporan, Long> {
    
    List<SubmissionLaporan> findByPegawaiIdOrderByTanggalBuatDesc(Long pegawaiId);
    
    Page<SubmissionLaporan> findByPegawaiIdOrderByTanggalBuatDesc(Long pegawaiId, Pageable pageable);
    
    List<SubmissionLaporan> findByPegawaiIdAndStatusOrderByTanggalBuatDesc(Long pegawaiId, SubmissionLaporan.StatusLaporan status);
    
    @Query("SELECT s FROM SubmissionLaporan s WHERE s.pemilihan.pemilihanId = :pemilihanId AND s.pegawai.id = :pegawaiId ORDER BY s.tanggalBuat DESC")
    List<SubmissionLaporan> findByPemilihanAndPegawaiOrderByTanggalBuatDesc(@Param("pemilihanId") Long pemilihanId, @Param("pegawaiId") Long pegawaiId);
    
    @Query("SELECT s FROM SubmissionLaporan s WHERE s.pegawai.id = :pegawaiId AND s.tahapanLaporan.tahapanLaporanId = :tahapanId AND s.jenisLaporan.jenisLaporanId = :jenisId")
    List<SubmissionLaporan> findByPegawaiAndTahapanAndJenis(@Param("pegawaiId") Long pegawaiId, @Param("tahapanId") Long tahapanId, @Param("jenisId") Long jenisId);
    
    @Query("SELECT COUNT(s) FROM SubmissionLaporan s WHERE s.pegawai.id = :pegawaiId")
    Long countByPegawaiId(@Param("pegawaiId") Long pegawaiId);
    
    @Query("SELECT COUNT(s) FROM SubmissionLaporan s WHERE s.pegawai.id = :pegawaiId AND s.status = :status")
    Long countByPegawaiIdAndStatus(@Param("pegawaiId") Long pegawaiId, @Param("status") SubmissionLaporan.StatusLaporan status);
    
    // Find all submissions for all employees (for admin)
    Page<SubmissionLaporan> findAllByOrderByTanggalBuatDesc(Pageable pageable);
}

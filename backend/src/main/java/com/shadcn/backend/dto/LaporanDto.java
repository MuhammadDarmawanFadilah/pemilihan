package com.shadcn.backend.dto;

import com.shadcn.backend.model.Laporan;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaporanDto {
    private Long laporanId;
    
    @NotBlank(message = "Nama laporan tidak boleh kosong")
    @Size(max = 200, message = "Nama laporan maksimal 200 karakter")
    private String namaLaporan;
    
    private String deskripsi;
    
    @NotBlank(message = "Nama pelapor tidak boleh kosong")
    @Size(max = 100, message = "Nama pelapor maksimal 100 karakter")
    private String namaPelapor;
    
    @NotBlank(message = "Alamat pelapor tidak boleh kosong")
    @Size(max = 500, message = "Alamat pelapor maksimal 500 karakter")
    private String alamatPelapor;
    
    private Long userId;
    
    private Laporan.StatusLaporan status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @NotNull(message = "ID jenis laporan tidak boleh kosong")
    private Long jenisLaporanId;
    
    private String jenisLaporanNama;
    
    private List<DetailLaporanDto> detailLaporanList;
    
    private Integer progressPercentage;
    
    private Integer totalTahapan;
    
    private Integer tahapanSelesai;
}

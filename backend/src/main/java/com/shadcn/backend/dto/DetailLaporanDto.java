package com.shadcn.backend.dto;

import com.shadcn.backend.model.DetailLaporan;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailLaporanDto {
    private Long detailLaporanId;
    
    private String konten;
    
    private DetailLaporan.StatusDetailLaporan status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Long laporanId;
    
    private Long tahapanLaporanId;
    
    private String tahapanNama;
    
    private String tahapanDeskripsi;
    
    private String templateTahapan;
    
    private Integer urutanTahapan;
    
    private List<String> jenisFileIzin;
    
    private List<LampiranLaporanDto> lampiranList;
    
    private Integer jumlahLampiran;
}

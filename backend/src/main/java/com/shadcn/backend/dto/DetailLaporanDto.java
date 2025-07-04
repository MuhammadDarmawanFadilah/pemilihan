package com.shadcn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.shadcn.backend.model.DetailLaporan;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailLaporanDTO {
    private Long detailLaporanId;
    private Long laporanId;
    private String konten;
    private DetailLaporan.StatusDetailLaporan status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // TahapanLaporan fields
    private Long tahapanLaporanId;
    private String tahapanNama;
    private String tahapanDeskripsi;
    private String templateTahapan;
    private Integer urutanTahapan;
    
    // File and attachment fields
    private List<String> jenisFileIzin;
    private List<LampiranLaporanDto> lampiranList;
    private Integer jumlahLampiran;
}

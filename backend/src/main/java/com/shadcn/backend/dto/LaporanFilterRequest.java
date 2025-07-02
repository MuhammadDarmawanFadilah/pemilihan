package com.shadcn.backend.dto;

import com.shadcn.backend.model.Laporan;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaporanFilterRequest {
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
    
    private String namaLaporan;
    private String namaPelapor;
    private Long jenisLaporanId;
    private Laporan.StatusLaporan status;
    private Long userId; // For filtering by specific user
}

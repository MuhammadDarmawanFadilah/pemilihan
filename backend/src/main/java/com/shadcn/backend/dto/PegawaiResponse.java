package com.shadcn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.shadcn.backend.model.Pegawai;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PegawaiResponse {
    
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String jabatan;
    private String status;
    
    // Location information
    private String alamat;
    private String provinsi;
    private String provinsiNama;
    private String kota;
    private String kotaNama;
    private String kecamatan;
    private String kecamatanNama;
    private String kelurahan;
    private String kelurahanNama;
    private String kodePos;
    private Double latitude;
    private Double longitude;
    
    // Photo URL
    private String photoUrl;
    
    // TPS and Pemilihan information
    private Integer totalTps;
    private Integer totalPemilihan;
    private List<PemilihanSummary> pemilihanList;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PemilihanSummary {
        private Long id;
        private String judulPemilihan;
        private String deskripsi;
        private String status;
        private String tingkatPemilihan;
        private Integer totalLaporan;
        private Integer totalJenisLaporan;
        private String provinsiNama;
        private String kotaNama;
        private String kecamatanNama;
        private String kelurahanNama;
        private LocalDateTime createdAt;
    }
    
    // Constructor from Pegawai entity
    public PegawaiResponse(Pegawai pegawai) {
        this.id = pegawai.getId();
        this.username = pegawai.getUsername();
        this.fullName = pegawai.getFullName();
        this.email = pegawai.getEmail();
        this.phoneNumber = pegawai.getPhoneNumber();
        this.jabatan = pegawai.getJabatan();
        this.status = pegawai.getStatus().name();
        
        this.alamat = pegawai.getAlamat();
        this.provinsi = pegawai.getProvinsi();
        this.kota = pegawai.getKota();
        this.kecamatan = pegawai.getKecamatan();
        this.kelurahan = pegawai.getKelurahan();
        this.kodePos = pegawai.getKodePos();
        this.latitude = pegawai.getLatitude();
        this.longitude = pegawai.getLongitude();
        
        this.photoUrl = pegawai.getPhotoUrl();
        
        this.totalTps = pegawai.getTotalTps();
        this.totalPemilihan = pegawai.getTotalPemilihan();
        
        // Convert pemilihan set to list of summaries
        if (pegawai.getPemilihanList() != null) {
            this.pemilihanList = pegawai.getPemilihanList().stream()
                .map(pemilihan -> PemilihanSummary.builder()
                    .id(pemilihan.getPemilihanId())
                    .judulPemilihan(pemilihan.getNamaPemilihan())
                    .deskripsi(pemilihan.getDeskripsiPemilihan())
                    .status(pemilihan.getStatus().name())
                    .tingkatPemilihan(pemilihan.getTingkatPemilihan().name())
                    .totalLaporan(pemilihan.getDetailPemilihanList() != null ? pemilihan.getDetailPemilihanList().size() : 0)
                    .totalJenisLaporan(pemilihan.getDetailPemilihanList() != null ? pemilihan.getDetailPemilihanList().size() : 0)
                    .provinsiNama(pemilihan.getProvinsiNama())
                    .kotaNama(pemilihan.getKotaNama())
                    .kecamatanNama(pemilihan.getKecamatanNama())
                    .kelurahanNama(pemilihan.getKelurahanNama())
                    .createdAt(pemilihan.getCreatedAt())
                    .build())
                .collect(Collectors.toList());
        }
        
        this.createdAt = pegawai.getCreatedAt();
        this.updatedAt = pegawai.getUpdatedAt();
    }
    
    // Static factory method
    public static PegawaiResponse from(Pegawai pegawai) {
        return new PegawaiResponse(pegawai);
    }
    
    // Convert to Map for simple responses
    public Map<String, Object> toMap() {
        return Map.of(
            "id", this.id,
            "username", this.username,
            "fullName", this.fullName,
            "email", this.email,
            "phoneNumber", this.phoneNumber != null ? this.phoneNumber : "",
            "jabatan", this.jabatan,
            "status", this.status,
            "totalTps", this.totalTps != null ? this.totalTps : 0,
            "totalPemilihan", this.totalPemilihan != null ? this.totalPemilihan : 0,
            "createdAt", this.createdAt
        );
    }
}

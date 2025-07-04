package com.shadcn.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "pemilihan", indexes = {
    @Index(name = "idx_pemilihan_nama", columnList = "namaPemilihan"),
    @Index(name = "idx_pemilihan_tahun", columnList = "tahun"),
    @Index(name = "idx_pemilihan_tingkat", columnList = "tingkatPemilihan"),
    @Index(name = "idx_pemilihan_status", columnList = "status"),
    @Index(name = "idx_pemilihan_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"detailPemilihanList"})
@ToString(exclude = {"detailPemilihanList"})
public class Pemilihan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pemilihanId;
    
    @Column(nullable = false)
    @NotBlank(message = "Nama pemilihan tidak boleh kosong")
    @Size(max = 200)
    private String namaPemilihan;
    
    @Column(nullable = false)
    private Integer tahun;
    
    @Column(columnDefinition = "TEXT")
    private String deskripsiPemilihan;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TingkatPemilihan tingkatPemilihan;
    
    // Lokasi dan Wilayah
    private String provinsiId;
    private String provinsiNama;
    private String kotaId;
    private String kotaNama;
    private String kecamatanId;
    private String kecamatanNama;
    private String kelurahanId;
    private String kelurahanNama;
    private String rt;
    private String rw;
    
    // Koordinat peta
    private Double latitude;
    private Double longitude;
    private String alamatLokasi;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPemilihan status = StatusPemilihan.DRAFT;
    
    @Column(nullable = false)
    private Long userId; // ID user yang membuat pemilihan
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // One-to-many relationship dengan DetailPemilihan (laporan yang dipilih)
    @OneToMany(mappedBy = "pemilihan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailPemilihan> detailPemilihanList = new ArrayList<>();
    
    public enum TingkatPemilihan {
        PROVINSI,
        KOTA,
        KABUPATEN,
        KECAMATAN,
        KELURAHAN
    }
    
    public enum StatusPemilihan {
        DRAFT,
        AKTIF,
        SELESAI,
        DIBATALKAN
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

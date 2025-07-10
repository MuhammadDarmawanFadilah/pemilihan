package com.shadcn.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "pegawai")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pegawai implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "nip")
    private String nip;
    
    @Column(name = "pendidikan")
    private String pendidikan;
    
    @Column(nullable = false)
    private String role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jabatan_id")
    private Jabatan jabatan;
    
    // Convenience field for backward compatibility and API responses
    @Transient
    private String namaJabatan;
    
    @PostLoad
    private void populateTransientFields() {
        if (jabatan != null) {
            this.namaJabatan = jabatan.getNama();
        }
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PegawaiStatus status;
    
    // Location fields
    private String alamat;
    private String provinsi;
    private String kota;
    private String kecamatan;
    private String kelurahan;
    
    @Column(name = "kode_pos")
    private String kodePos;
    
    private Double latitude;
    private Double longitude;
    
    // Photo field
    @Column(name = "photo_url")
    private String photoUrl;
    
    // TPS and Pemilihan related fields
    @Column(name = "total_tps")
    private Integer totalTps;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "pegawai_pemilihan",
        joinColumns = @JoinColumn(name = "pegawai_id"),
        inverseJoinColumns = @JoinColumn(name = "pemilihan_id")
    )
    @Builder.Default
    private Set<Pemilihan> pemilihanList = new HashSet<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PegawaiStatus {
        AKTIF, TIDAK_AKTIF, SUSPEND
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PegawaiStatus.AKTIF;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Pegawai always has PEGAWAI role
        return List.of(new SimpleGrantedAuthority("ROLE_PEGAWAI"));
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return status != PegawaiStatus.SUSPEND;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return status == PegawaiStatus.AKTIF;
    }
    
    // Helper methods
    public Integer getTotalPemilihan() {
        return pemilihanList != null ? pemilihanList.size() : 0;
    }
    
    public void addPemilihan(Pemilihan pemilihan) {
        if (pemilihanList == null) {
            pemilihanList = new HashSet<>();
        }
        pemilihanList.add(pemilihan);
        // Automatically update totalTps
        this.totalTps = pemilihanList.size();
    }
    
    public void removePemilihan(Pemilihan pemilihan) {
        if (pemilihanList != null) {
            pemilihanList.remove(pemilihan);
            // Automatically update totalTps
            this.totalTps = pemilihanList.size();
        }
    }
    
    public void clearPemilihan() {
        if (pemilihanList != null) {
            pemilihanList.clear();
            // Automatically update totalTps
            this.totalTps = 0;
        }
    }
    
    public void setPemilihanList(Set<Pemilihan> pemilihanList) {
        this.pemilihanList = pemilihanList;
        // Automatically update totalTps when pemilihanList is set
        this.totalTps = pemilihanList != null ? pemilihanList.size() : 0;
    }
}

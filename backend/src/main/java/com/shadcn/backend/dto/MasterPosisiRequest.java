package com.shadcn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterPosisiRequest {
    
    @NotBlank(message = "Nama posisi tidak boleh kosong")
    @Size(max = 100, message = "Nama posisi maksimal 100 karakter")
    private String nama;
    
    @Size(max = 50, message = "Kategori maksimal 50 karakter")
    private String kategori;
    
    @Size(max = 255, message = "Deskripsi maksimal 255 karakter")
    private String deskripsi;
    
    private Boolean isActive = true;
    
    private Integer sortOrder = 0;
}

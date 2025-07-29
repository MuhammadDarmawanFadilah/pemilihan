"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Filter, X, ArrowRight, FileText, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast-simple";
import { pemilihanApi, PemilihanDTO } from "@/lib/pemilihan-api";
import { useAuth } from "@/contexts/AuthContext";
import { PegawaiSearchDropdown } from "@/components/PegawaiSearchDropdown";
import { ProvinsiSearchDropdown } from "@/components/ProvinsiSearchDropdown";
import { KotaSearchDropdown } from "@/components/KotaSearchDropdown";
import { KecamatanSearchDropdown } from "@/components/KecamatanSearchDropdown";

interface PaginatedResponse {
  content: PemilihanDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function LaporanPengawasPage() {
  const { user, isAuthenticated } = useAuth();
  const [pemilihan, setPemilihan] = useState<PemilihanDTO[]>([]);
  
  // Filter states
  const [namaFilter, setNamaFilter] = useState("");
  const [provinsiFilter, setProvinsiFilter] = useState("");
  const [kotaFilter, setKotaFilter] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [provinsiKode, setProvinsiKode] = useState(""); // Track provinsi kode
  const [kotaKode, setKotaKode] = useState(""); // Track kota kode for kecamatan filtering
  const [kecamatanKode, setKecamatanKode] = useState(""); // Track kecamatan kode
  const [selectedTingkat, setSelectedTingkat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPegawai, setSelectedPegawai] = useState("all");
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set default pegawai filter for non-admin users
    if (user && user.role?.roleName !== 'ADMIN') {
      setSelectedPegawai(user.fullName || "");
      setSelectedPegawaiId(user.id?.toString() || "");
      setIsInitialized(true);
    } else if (user) {
      // For admin or other roles, mark as initialized
      setIsInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    // Load data only after initialization is complete
    if (isInitialized) {
      loadData();
    }
  }, [currentPage, pageSize, selectedPegawaiId, isInitialized]);

  const loadData = async () => {
    const apiStatusFilter = selectedStatus === "all" ? "" : selectedStatus;
    const apiTingkatFilter = selectedTingkat === "all" ? "" : selectedTingkat;
    const apiPegawaiFilter = selectedPegawaiId === "all" ? "" : selectedPegawaiId;
    
    // Use codes for filtering instead of names
    const params = {
      keyword: namaFilter,
      provinsiId: provinsiKode,
      kotaId: kotaKode,
      kecamatanId: kecamatanKode,
      tingkat: apiTingkatFilter,
      status: apiStatusFilter,
      pegawaiId: apiPegawaiFilter,
      page: currentPage,
      size: pageSize
    };
    
    await loadDataWithParams(params);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadData();
  };

  const handleClearFilters = async () => {
    setNamaFilter("");
    setProvinsiFilter("");
    setKotaFilter("");
    setKecamatanFilter("");
    setProvinsiKode("");
    setKotaKode("");
    setKecamatanKode("");
    setSelectedTingkat("all");
    setSelectedStatus("all");
    if (user?.role?.roleName === 'ADMIN') {
      setSelectedPegawai("all");
      setSelectedPegawaiId("all");
    }
    setCurrentPage(0);
    
    // Clear applied filters immediately
    await loadDataWithParams({
      keyword: "",
      provinsiId: "",
      kotaId: "",
      kecamatanId: "",
      tingkat: "",
      status: "",
      pegawaiId: "",
      page: 0,
      size: pageSize
    });
  };

  const loadDataWithParams = async (params: any) => {
    setLoading(true);
    try {
      const response = await pemilihanApi.searchPaged(params);
      if (response.success && response.data) {
        setPemilihan(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        console.error("Error loading data:", response.message);
        toast({
          title: "Error",
          description: response.message || "Gagal memuat data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AKTIF: { color: "bg-green-100 text-green-800", label: "Aktif" },
      TIDAK_AKTIF: { color: "bg-red-100 text-red-800", label: "Tidak Aktif" },
      DRAFT: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: "bg-muted text-muted-foreground", label: status };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatTingkat = (tingkat: string) => {
    const tingkatMap: { [key: string]: string } = {
      'provinsi': 'Provinsi',
      'kota': 'Kota/Kabupaten',
      'kecamatan': 'Kecamatan',
      'kelurahan': 'Kelurahan/Desa'
    };
    return tingkatMap[tingkat] || tingkat;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Laporan Pengawas</h1>
                  <p className="text-muted-foreground mt-1">
                    Kelola dan pantau laporan pengawasan pemilihan
                  </p>
                </div>
              </div>
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="font-medium text-primary">Laporan Pengawas</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="text-muted-foreground">Daftar Pemilihan</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-primary hover:bg-primary/90" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Tutup Filter' : 'Buka Filter'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Filter & Pencarian</h2>
                  <p className="text-sm text-muted-foreground">Gunakan filter untuk mempersempit hasil pencarian</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Filter Nama Pemilihan</label>
                  <Input
                    placeholder="Cari nama pemilihan..."
                    value={namaFilter}
                    onChange={(e) => setNamaFilter(e.target.value)}
                    className="bg-background border-input focus:border-ring focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Filter Provinsi</label>
                  <ProvinsiSearchDropdown
                    value={provinsiFilter}
                    onValueChange={(value) => {
                      setProvinsiFilter(value);
                      setKotaFilter("");
                      setKecamatanFilter("");
                      setKotaKode("");
                      setKecamatanKode("");
                    }}
                    onProvinsiKodeChange={(provinsiId: string) => {
                      setProvinsiKode(provinsiId);
                      setKotaKode("");
                      setKecamatanKode("");
                    }}
                    placeholder="Pilih provinsi..."
                    className="bg-background border-input focus:border-ring focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Filter Kota/Kabupaten</label>
                  <KotaSearchDropdown
                    value={kotaFilter}
                    onValueChange={(value) => {
                      setKotaFilter(value);
                      setKecamatanFilter("");
                      setKecamatanKode("");
                    }}
                    onKotaKodeChange={(kotaId: string) => {
                      setKotaKode(kotaId);
                      setKecamatanKode("");
                    }}
                    provinsiFilter={provinsiKode}
                    placeholder="Pilih kota/kabupaten..."
                    disabled={!provinsiKode}
                    className="bg-background border-input focus:border-ring focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Filter Kecamatan</label>
                  <KecamatanSearchDropdown
                    value={kecamatanFilter}
                    onValueChange={(value) => setKecamatanFilter(value)}
                    onKecamatanKodeChange={(kecamatanId: string) => setKecamatanKode(kecamatanId)}
                    kotaKode={kotaKode}
                    placeholder="Pilih kecamatan..."
                    disabled={!kotaKode}
                    className="bg-background border-input focus:border-ring focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Tingkat Pemilihan</label>
                  <Select value={selectedTingkat} onValueChange={(value) => setSelectedTingkat(value)}>
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 Semua Tingkat</SelectItem>
                      <SelectItem value="provinsi">🏛️ Provinsi</SelectItem>
                      <SelectItem value="kota">🏙️ Kota/Kabupaten</SelectItem>
                      <SelectItem value="kecamatan">🏘️ Kecamatan</SelectItem>
                      <SelectItem value="kelurahan">🏠 Kelurahan/Desa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Status Pemilihan</label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔍 Semua Status</SelectItem>
                      <SelectItem value="AKTIF">✅ Aktif</SelectItem>
                      <SelectItem value="TIDAK_AKTIF">❌ Tidak Aktif</SelectItem>
                      <SelectItem value="DRAFT">📝 Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Pegawai</label>
                  <PegawaiSearchDropdown
                    value={selectedPegawai}
                    onValueChange={(value) => setSelectedPegawai(value)}
                    onPegawaiIdChange={(pegawaiId) => setSelectedPegawaiId(pegawaiId)}
                    placeholder="Pilih pegawai..."
                    disabled={user?.role?.roleName !== 'ADMIN'}
                    includeAllOption={user?.role?.roleName === 'ADMIN'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Items per Halaman</label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(parseInt(value));
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per halaman</SelectItem>
                      <SelectItem value="25">25 per halaman</SelectItem>
                      <SelectItem value="50">50 per halaman</SelectItem>
                      <SelectItem value="100">100 per halaman</SelectItem>
                      <SelectItem value="1000">1000 per halaman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button 
                  onClick={handleSearch} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-8 py-2"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Cari Data
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters} 
                  className="border-border hover:bg-accent hover:text-accent-foreground px-8 py-2"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Daftar Pemilihan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Menampilkan {pemilihan.length} dari {totalElements} total data
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="font-semibold text-foreground py-4">Judul Pemilihan</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Tingkat</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Wilayah</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Total Laporan</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Tanggal Mulai</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 w-[100px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <span className="text-muted-foreground font-medium">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pemilihan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Tidak ada data pemilihan</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                          Belum ada data pemilihan yang tersedia atau data tidak sesuai dengan filter yang diterapkan
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pemilihan.map((item, index) => (
                    <TableRow key={item.pemilihanId} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <TableCell className="py-4">
                        <div className="max-w-xs">
                          <div className="font-semibold text-foreground mb-1">{item.judulPemilihan}</div>
                          {item.deskripsi && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {item.deskripsi.length > 60 
                                ? item.deskripsi.substring(0, 60) + "..." 
                                : item.deskripsi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-medium">
                          {formatTingkat(item.tingkatPemilihan || "")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-foreground font-medium">
                          {item.wilayahTingkat || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {item.totalLaporan || 0}
                          </Badge>
                          <span className="text-xs text-muted-foreground">laporan</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-muted-foreground font-medium">
                          {(item.tanggalMulai || item.tanggalAktif) ? new Date(item.tanggalMulai || item.tanggalAktif!).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/laporan-pengawas/${item.pemilihanId}`}
                          className="text-primary hover:text-primary/90 hover:bg-accent"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Halaman <span className="font-medium text-foreground">{currentPage + 1}</span> dari{' '}
                  <span className="font-medium text-foreground">{totalPages}</span> | 
                  Total <span className="font-medium text-foreground">{totalElements}</span> data
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={!hasPrevious}
                    className="px-3 border-border"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!hasPrevious}
                    className="px-3"
                  >
                    Previous
                  </Button>
                  
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-primary hover:bg-primary/90 px-3" : "px-3 border-border"}
                    >
                      {page + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasNext}
                    className="px-3 border-border"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={!hasNext}
                    className="px-3 border-border"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

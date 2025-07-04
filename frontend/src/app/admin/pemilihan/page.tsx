"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast-simple";
import { pemilihanApi, PemilihanDTO } from "@/lib/pemilihan-api";

interface PemilihanStats {
  totalPemilihan: number;
  statusAktif: number;
  statusTidakAktif: number;
  statusDraft: number;
  totalLaporan: number;
  tingkatProvinsi: number;
  tingkatKota: number;
  tingkatKecamatan: number;
  tingkatKelurahan: number;
}

interface PaginatedResponse {
  content: PemilihanDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function PemilihanPage() {
  const [pemilihan, setPemilihan] = useState<PemilihanDTO[]>([]);
  const [stats, setStats] = useState<PemilihanStats>({
    totalPemilihan: 0,
    statusAktif: 0,
    statusTidakAktif: 0,
    statusDraft: 0,
    totalLaporan: 0,
    tingkatProvinsi: 0,
    tingkatKota: 0,
    tingkatKecamatan: 0,
    tingkatKelurahan: 0,
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [tingkatFilter, setTingkatFilter] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, searchQuery, statusFilter, tingkatFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Convert filter values for API call
      const apiStatusFilter = statusFilter === "ALL" ? "" : statusFilter;
      const apiTingkatFilter = tingkatFilter === "ALL" ? "" : tingkatFilter;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      console.log("API URL:", apiUrl);
      console.log("Filters:", { searchQuery, statusFilter, tingkatFilter, apiStatusFilter, apiTingkatFilter });
      
      // Load pemilihan with pagination
      const pemilihanUrl = `${apiUrl}/pemilihan/search-paged?keyword=${encodeURIComponent(searchQuery)}&tingkat=${encodeURIComponent(apiTingkatFilter)}&status=${encodeURIComponent(apiStatusFilter)}&page=${currentPage}&size=${pageSize}`;
      console.log("Pemilihan URL:", pemilihanUrl);
      
      const pemilihanResponse = await fetch(pemilihanUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!pemilihanResponse.ok) {
        throw new Error(`HTTP error! status: ${pemilihanResponse.status}`);
      }
      
      const pemilihanData: PaginatedResponse = await pemilihanResponse.json();
      
      setPemilihan(pemilihanData.content);
      setTotalElements(pemilihanData.totalElements);
      setTotalPages(pemilihanData.totalPages);
      setHasNext(pemilihanData.hasNext);
      setHasPrevious(pemilihanData.hasPrevious);
      
      // Load statistics
      const statsUrl = `${apiUrl}/pemilihan/statistics?keyword=${encodeURIComponent(searchQuery)}&tingkat=${encodeURIComponent(apiTingkatFilter)}&status=${encodeURIComponent(apiStatusFilter)}`;
      console.log("Stats URL:", statsUrl);
      
      const statsResponse = await fetch(statsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      
      const statsData: PemilihanStats = await statsResponse.json();
      setStats(statsData);
      
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTingkatFilter("ALL");
    setCurrentPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pemilihan ini?")) {
      return;
    }

    try {
      await pemilihanApi.delete(id);
      toast({
        title: "Sukses",
        description: "Pemilihan berhasil dihapus",
      });
      loadData(); // Reload data
    } catch (error: any) {
      console.error("Error deleting pemilihan:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus pemilihan",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AKTIF: { color: "bg-green-100 text-green-800", label: "Aktif" },
      TIDAK_AKTIF: { color: "bg-red-100 text-red-800", label: "Tidak Aktif" },
      DRAFT: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: "bg-gray-100 text-gray-800", label: status };
    
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
    <div className="min-h-screen bg-gray-50/30">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Manajemen Pemilihan</h1>
                  <p className="text-gray-600 mt-1">
                    Kelola dan pantau proses pemilihan alumni secara terpusat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Total: {stats.totalPemilihan} Pemilihan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Aktif: {stats.statusAktif}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Draft: {stats.statusDraft}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/admin/pemilihan/create">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pemilihan
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid gap-6">
          {/* Main Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ringkasan Statistik</h2>
              <div className="text-sm text-gray-500">Data Real-time</div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-6 border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Pemilihan</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalPemilihan}</p>
                    <p className="text-xs text-blue-600/70 mt-1">Keseluruhan data</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-6 border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Status Aktif</p>
                    <p className="text-3xl font-bold text-green-900">{stats.statusAktif}</p>
                    <p className="text-xs text-green-600/70 mt-1">Sedang berjalan</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-6 border border-yellow-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 mb-1">Status Draft</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.statusDraft}</p>
                    <p className="text-xs text-yellow-600/70 mt-1">Belum dipublikasi</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-6 border border-red-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Tidak Aktif</p>
                    <p className="text-3xl font-bold text-red-900">{stats.statusTidakAktif}</p>
                    <p className="text-xs text-red-600/70 mt-1">Non-aktif</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Statistics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan & Aktivitas</h3>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-6 border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Total Laporan</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalLaporan}</p>
                    <p className="text-xs text-purple-600/70 mt-1">Laporan masuk</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Tingkatan</h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Provinsi</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.tingkatProvinsi}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Kota/Kabupaten</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.tingkatKota}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Kecamatan</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.tingkatKecamatan}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Kelurahan/Desa</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.tingkatKelurahan}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Filter & Pencarian</h2>
                  <p className="text-sm text-gray-500">Gunakan filter untuk mempersempit hasil pencarian</p>
                </div>
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Tutup Filter' : 'Buka Filter'}
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Main Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cari berdasarkan nama pemilihan, deskripsi, atau wilayah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-11 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 shadow-sm"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Cari
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-200/50">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Status Pemilihan</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">🔍 Semua Status</SelectItem>
                          <SelectItem value="AKTIF">✅ Aktif</SelectItem>
                          <SelectItem value="TIDAK_AKTIF">❌ Tidak Aktif</SelectItem>
                          <SelectItem value="DRAFT">📝 Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Tingkat Wilayah</label>
                      <Select value={tingkatFilter} onValueChange={setTingkatFilter}>
                        <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">🌐 Semua Tingkat</SelectItem>
                          <SelectItem value="provinsi">🏛️ Provinsi</SelectItem>
                          <SelectItem value="kota">🏙️ Kota/Kabupaten</SelectItem>
                          <SelectItem value="kecamatan">🏘️ Kecamatan</SelectItem>
                          <SelectItem value="kelurahan">🏠 Kelurahan/Desa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={handleClearFilters} 
                        className="w-full border-gray-300 hover:bg-gray-50"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Bersihkan Filter
                      </Button>
                    </div>
                  </div>
                  
                  {(searchQuery || statusFilter !== "ALL" || tingkatFilter !== "ALL") && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-600">Filter aktif:</span>
                        {searchQuery && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Pencarian: "{searchQuery}"
                          </span>
                        )}
                        {statusFilter !== "ALL" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Status: {statusFilter}
                          </span>
                        )}
                        {tingkatFilter !== "ALL" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Tingkat: {tingkatFilter}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Daftar Pemilihan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Menampilkan {pemilihan.length} dari {totalElements} total data
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Tampilkan:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(0);
                }}>
                  <SelectTrigger className="w-20 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">data per halaman</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-200/50">
                  <TableHead className="font-semibold text-gray-700 py-4">Judul Pemilihan</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Tingkat</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Wilayah</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Total Laporan</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Tanggal Dibuat</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 w-[100px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <span className="text-gray-600 font-medium">Memuat data...</span>
                        <span className="text-sm text-gray-400">Harap tunggu sebentar</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pemilihan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data pemilihan</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                          Belum ada data pemilihan yang tersedia atau data tidak sesuai dengan filter yang diterapkan
                        </p>
                        <div className="mt-4">
                          <Link href="/admin/pemilihan/create">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="mr-2 h-4 w-4" />
                              Buat Pemilihan Pertama
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pemilihan.map((item, index) => (
                    <TableRow key={item.pemilihanId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                      <TableCell className="py-4">
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 mb-1">{item.judulPemilihan}</div>
                          {item.deskripsi && (
                            <div className="text-sm text-gray-500 line-clamp-2">
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
                        <span className="text-gray-700 font-medium">
                          {item.wilayahTingkat || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {item.totalLaporan || 0}
                          </Badge>
                          <span className="text-xs text-gray-500">laporan</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-600 font-medium">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <Link href={`/admin/pemilihan/${item.pemilihanId}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/pemilihan/${item.pemilihanId}/edit`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(item.pemilihanId!)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Halaman <span className="font-medium">{currentPage + 1}</span> dari{' '}
                  <span className="font-medium">{totalPages}</span> | 
                  Total <span className="font-medium">{totalElements}</span> data
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={!hasPrevious}
                    className="px-3"
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
                  
                  {/* Page Numbers */}
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-blue-600 hover:bg-blue-700 px-3" : "px-3"}
                    >
                      {page + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasNext}
                    className="px-3"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={!hasNext}
                    className="px-3"
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

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Filter,
  MoreHorizontal,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { laporanAPI, jenisLaporanAPI, Laporan, JenisLaporan, LaporanFilterRequest, LaporanRequest, LaporanStats } from '@/lib/api';

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'DALAM_PROSES':
      return 'bg-yellow-100 text-yellow-800';
    case 'SELESAI':
      return 'bg-green-100 text-green-800';
    case 'DITOLAK':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Status display names
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'DALAM_PROSES':
      return 'Dalam Proses';
    case 'SELESAI':
      return 'Selesai';
    case 'DITOLAK':
      return 'Ditolak';
    default:
      return status;
  }
};

export default function AdminLaporanPage() {
  // State management
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [jenisLaporanList, setJenisLaporanList] = useState<JenisLaporan[]>([]);
  const [stats, setStats] = useState<LaporanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedJenisLaporan, setSelectedJenisLaporan] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<LaporanRequest>({
    namaLaporan: '',
    deskripsi: '',
    namaPelapor: '',
    alamatPelapor: '',
    jenisLaporanId: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data functions
  const loadStats = useCallback(async () => {
    try {
      const statsData = await laporanAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const loadJenisLaporan = useCallback(async () => {
    try {
      const jenisLaporanData = await jenisLaporanAPI.getActive();
      setJenisLaporanList(jenisLaporanData);
    } catch (error) {
      console.error('Error loading jenis laporan:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data jenis laporan",
        variant: "destructive",
      });
    }
  }, []);

  const loadLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const filters: LaporanFilterRequest = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      if (searchQuery) {
        filters.namaLaporan = searchQuery;
        filters.namaPelapor = searchQuery;
      }
      if (selectedStatus && selectedStatus !== 'ALL') {
        filters.status = selectedStatus as any;
      }
      if (selectedJenisLaporan && selectedJenisLaporan !== 'ALL') {
        filters.jenisLaporanId = parseInt(selectedJenisLaporan);
      }

      const response = await laporanAPI.search(filters);
      setLaporan(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading laporan:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedStatus, selectedJenisLaporan]);

  // Effects
  useEffect(() => {
    loadStats();
    loadJenisLaporan();
  }, [loadStats, loadJenisLaporan]);

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      loadLaporan();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter change handlers
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(0);
  };

  const handleJenisLaporanChange = (value: string) => {
    setSelectedJenisLaporan(value);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedJenisLaporan('ALL');
    setCurrentPage(0);
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!formData.namaLaporan || !formData.jenisLaporanId || !formData.namaPelapor) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await laporanAPI.create(formData);
      
      toast({
        title: "Sukses",
        description: "Laporan berhasil dibuat",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      loadLaporan();
      loadStats();
    } catch (error: any) {
      console.error('Error creating laporan:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat laporan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedLaporan || !formData.namaLaporan || !formData.jenisLaporanId || !formData.namaPelapor) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await laporanAPI.update(selectedLaporan.laporanId, formData);
      
      toast({
        title: "Sukses",
        description: "Laporan berhasil diperbarui",
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      loadLaporan();
    } catch (error: any) {
      console.error('Error updating laporan:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui laporan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLaporan) return;

    try {
      setIsSubmitting(true);
      await laporanAPI.delete(selectedLaporan.laporanId);
      
      toast({
        title: "Sukses",
        description: "Laporan berhasil dihapus",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedLaporan(null);
      loadLaporan();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting laporan:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus laporan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (laporan: Laporan, newStatus: string) => {
    try {
      await laporanAPI.updateStatus(laporan.laporanId, newStatus as any);
      
      toast({
        title: "Sukses",
        description: `Status laporan berhasil diubah menjadi ${getStatusDisplay(newStatus)}`,
      });
      
      loadLaporan();
      loadStats();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui status laporan",
        variant: "destructive",
      });
    }
  };

  // Dialog handlers
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (laporan: Laporan) => {
    setSelectedLaporan(laporan);
    setFormData({
      namaLaporan: laporan.namaLaporan,
      deskripsi: laporan.deskripsi,
      namaPelapor: laporan.namaPelapor,
      alamatPelapor: laporan.alamatPelapor,
      jenisLaporanId: laporan.jenisLaporanId,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (laporan: Laporan) => {
    setSelectedLaporan(laporan);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (laporan: Laporan) => {
    setSelectedLaporan(laporan);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      namaLaporan: '',
      deskripsi: '',
      namaPelapor: '',
      alamatPelapor: '',
      jenisLaporanId: 0,
    });
    setSelectedLaporan(null);
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Laporan</h1>
          <p className="text-muted-foreground">
            Kelola dan monitor semua laporan dalam sistem
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Laporan
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Laporan</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Dalam Proses</p>
                  <p className="text-2xl font-bold">{stats.dalamProses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                  <p className="text-2xl font-bold">{stats.selesai}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Ditolak</p>
                  <p className="text-2xl font-bold">{stats.ditolak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Laporan</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nama laporan atau pelapor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="DALAM_PROSES">Dalam Proses</SelectItem>
                  <SelectItem value="SELESAI">Selesai</SelectItem>
                  <SelectItem value="DITOLAK">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Jenis Laporan</Label>
              <Select value={selectedJenisLaporan} onValueChange={handleJenisLaporanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenis</SelectItem>
                  {jenisLaporanList.map((jenis) => (
                    <SelectItem key={jenis.jenisLaporanId} value={jenis.jenisLaporanId.toString()}>
                      {jenis.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Reset Filter
                </Button>
                <Button variant="outline" onClick={loadLaporan}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Laporan</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Jenis Laporan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laporan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Tidak ada data laporan
                      </TableCell>
                    </TableRow>
                  ) : (
                    laporan.map((item) => (
                      <TableRow key={item.laporanId}>
                        <TableCell className="font-medium">
                          {item.namaLaporan}
                        </TableCell>
                        <TableCell>{item.namaPelapor}</TableCell>
                        <TableCell>{item.jenisLaporanNama}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusDisplay(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.tahapanSelesai}/{item.totalTahapan}</span>
                              <span>{item.progressPercentage}%</span>
                            </div>
                            <Progress value={item.progressPercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openViewDialog(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(item, 'DRAFT')}
                                disabled={item.status === 'DRAFT'}
                              >
                                Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(item, 'DALAM_PROSES')}
                                disabled={item.status === 'DALAM_PROSES'}
                              >
                                Dalam Proses
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(item, 'SELESAI')}
                                disabled={item.status === 'SELESAI'}
                              >
                                Selesai
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(item, 'DITOLAK')}
                                disabled={item.status === 'DITOLAK'}
                              >
                                Ditolak
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(item)}
                                className="text-red-600"
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

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0}
                    >
                      {'<<'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      {'<'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      {'>'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      {'>>'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Tambah Laporan' : 'Edit Laporan'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen ? 'Buat laporan baru dalam sistem.' : 'Perbarui informasi laporan.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="namaLaporan">Nama Laporan *</Label>
              <Input
                id="namaLaporan"
                value={formData.namaLaporan}
                onChange={(e) => setFormData({ ...formData, namaLaporan: e.target.value })}
                placeholder="Masukkan nama laporan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jenisLaporanId">Jenis Laporan *</Label>
              <Select 
                value={formData.jenisLaporanId.toString()} 
                onValueChange={(value) => setFormData({ ...formData, jenisLaporanId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis laporan" />
                </SelectTrigger>
                <SelectContent>
                  {jenisLaporanList.map((jenis) => (
                    <SelectItem key={jenis.jenisLaporanId} value={jenis.jenisLaporanId.toString()}>
                      {jenis.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="namaPelapor">Nama Pelapor *</Label>
              <Input
                id="namaPelapor"
                value={formData.namaPelapor}
                onChange={(e) => setFormData({ ...formData, namaPelapor: e.target.value })}
                placeholder="Masukkan nama pelapor"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamatPelapor">Alamat Pelapor</Label>
              <Textarea
                id="alamatPelapor"
                value={formData.alamatPelapor}
                onChange={(e) => setFormData({ ...formData, alamatPelapor: e.target.value })}
                placeholder="Masukkan alamat pelapor"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi laporan"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={isCreateDialogOpen ? handleCreate : handleEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isCreateDialogOpen ? 'Membuat...' : 'Memperbarui...'}
                </>
              ) : (
                isCreateDialogOpen ? 'Buat Laporan' : 'Perbarui Laporan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang laporan
            </DialogDescription>
          </DialogHeader>
          
          {selectedLaporan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nama Laporan</Label>
                  <p className="mt-1">{selectedLaporan.namaLaporan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Jenis Laporan</Label>
                  <p className="mt-1">{selectedLaporan.jenisLaporanNama}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nama Pelapor</Label>
                  <p className="mt-1">{selectedLaporan.namaPelapor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedLaporan.status)}`}>
                    {getStatusDisplay(selectedLaporan.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tahapan Selesai: {selectedLaporan.tahapanSelesai}/{selectedLaporan.totalTahapan}</span>
                    <span>{selectedLaporan.progressPercentage}%</span>
                  </div>
                  <Progress value={selectedLaporan.progressPercentage} />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Alamat Pelapor</Label>
                <p className="mt-1">{selectedLaporan.alamatPelapor || '-'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Deskripsi</Label>
                <p className="mt-1">{selectedLaporan.deskripsi || '-'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</Label>
                  <p className="mt-1">{new Date(selectedLaporan.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</Label>
                  <p className="mt-1">{new Date(selectedLaporan.updatedAt).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus laporan "{selectedLaporan?.namaLaporan}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, Filter, X, FileText, List, Edit } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast-simple";
import { jenisLaporanAPI, JenisLaporan } from "@/lib/jenis-laporan-api";
import { tahapanLaporanAPI, TahapanLaporan } from "@/lib/tahapan-laporan-api";

// Helper function to get display name for file
const getDisplayName = (fileName: string) => {
  // Check if it's a temp file or permanent file
  const isTempFile = /^\d{8}_\d{6}_/.test(fileName);
  
  if (isTempFile) {
    // Extract original name from temp file format: YYYYMMDD_HHMMSS_UUID_originalName.ext
    const parts = fileName.split('_');
    if (parts.length >= 3) {
      return parts.slice(2).join('_'); // Join back the original name parts
    }
  } else {
    // For permanent files, remove the documents/ prefix and extract original name
    const cleanFileName = fileName.replace('documents/', '');
    const parts = cleanFileName.split('_');
    if (parts.length >= 3) {
      return parts.slice(2).join('_'); // Join back the original name parts
    }
    return cleanFileName; // Fallback to filename without prefix
  }
  return fileName; // Fallback to server filename
};

export default function JenisLaporanTahapanPage() {
  const params = useParams();
  const router = useRouter();
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan | null>(null);
  const [tahapan, setTahapan] = useState<TahapanLaporan[]>([]);
  
  // Filter states
  const [namaTahapanFilter, setNamaTahapanFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const pemilihanId = params?.id as string;
  const laporanId = params?.laporanId as string;
  const jenisLaporanId = params?.jenisId as string;

  useEffect(() => {
    if (jenisLaporanId) {
      loadJenisLaporan();
      loadTahapan();
    }
  }, [jenisLaporanId]);

  const loadJenisLaporan = async () => {
    try {
      const response = await jenisLaporanAPI.getById(parseInt(jenisLaporanId));
      setJenisLaporan(response);
    } catch (error: any) {
      console.error("Error loading jenis laporan:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data jenis laporan",
        variant: "destructive",
      });
    }
  };

  const loadTahapan = async () => {
    setLoading(true);
    try {
      const filters = {
        nama: namaTahapanFilter
      };

      const tahapanList = await tahapanLaporanAPI.getActiveByJenisLaporan(parseInt(jenisLaporanId), filters);
      setTahapan(tahapanList);
    } catch (error: any) {
      console.error('Error loading tahapan:', error);
      setTahapan([]);
      toast({
        title: "Error",
        description: "Gagal memuat data tahapan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTahapan();
  };

  const handleClearFilter = () => {
    setNamaTahapanFilter("");
    loadTahapan();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => router.push(`/laporan-pengawas/${pemilihanId}/laporan/${laporanId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <List className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Detail Tahapan</h1>
                  <p className="text-muted-foreground mt-1">
                    {jenisLaporan?.nama || 'Memuat...'}
                  </p>
                </div>
              </div>
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/laporan-pengawas')}
                    className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                  >
                    Laporan Pengawas
                  </Button>
                  <span className="mx-2 text-muted-foreground/60">→</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/laporan-pengawas/${pemilihanId}`)}
                    className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                  >
                    Daftar Laporan
                  </Button>
                  <span className="mx-2 text-muted-foreground/60">→</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/laporan-pengawas/${pemilihanId}/laporan/${laporanId}`)}
                    className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                  >
                    Jenis Laporan
                  </Button>
                  <span className="mx-2 text-muted-foreground/60">→</span>
                  <span className="text-foreground font-medium">{jenisLaporan?.nama || 'Detail Tahapan'}</span>
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
                  <h2 className="text-lg font-semibold text-foreground">Filter Tahapan</h2>
                  <p className="text-sm text-muted-foreground">Cari tahapan berdasarkan nama</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-foreground block mb-2">Nama Tahapan</label>
                  <Input
                    placeholder="Cari nama tahapan..."
                    value={namaTahapanFilter}
                    onChange={(e) => setNamaTahapanFilter(e.target.value)}
                    className="bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Cari
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilter}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset
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
                <h2 className="text-lg font-semibold text-foreground">Daftar Tahapan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Menampilkan {tahapan.length} tahapan
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="font-semibold text-foreground py-4">Urutan</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Nama Tahapan</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Template Lampiran</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 w-[140px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <span className="text-muted-foreground font-medium">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tahapan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <List className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Tidak ada tahapan</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                          Belum ada tahapan yang tersedia untuk jenis laporan ini
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tahapan.map((item, index) => (
                    <TableRow key={item.tahapanLaporanId} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <TableCell className="py-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {item.urutanTahapan}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-semibold text-foreground">{item.nama}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs">
                          {item.deskripsi && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {item.deskripsi.length > 80 
                                ? item.deskripsi.substring(0, 80) + "..." 
                                : item.deskripsi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs">
                          {item.templateTahapan ? (
                            <div className="flex items-center gap-2">
                              <a 
                                href="#"
                                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Check if it's a temp file or permanent file
                                  const isTempFile = /^\d{8}_\d{6}_/.test(item.templateTahapan!);
                                  
                                  let downloadUrl;
                                  if (isTempFile) {
                                    // Use temp file download endpoint
                                    downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/temp-files/download/${item.templateTahapan}`;
                                  } else {
                                    // Use permanent file download endpoint
                                    const fileName = item.templateTahapan!.replace('documents/', '');
                                    downloadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/download/documents/${fileName}`;
                                  }
                                  
                                  // Force download using fetch and blob
                                  fetch(downloadUrl)
                                    .then(response => {
                                      if (!response.ok) throw new Error('Download failed');
                                      return response.blob();
                                    })
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      const fileName = item.templateTahapan!;
                                      if (fileName) {
                                        link.download = getDisplayName(fileName);
                                      }
                                      link.style.display = 'none';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                      
                                      toast({
                                        title: "Download berhasil",
                                        description: `File berhasil didownload`,
                                      });
                                    })
                                    .catch(error => {
                                      console.error('Download error:', error);
                                      toast({
                                        title: "Download gagal",
                                        description: "Gagal mendownload file",
                                        variant: "destructive",
                                      });
                                    });
                                }}
                              >
                                <FileText className="w-4 h-4" />
                                {(() => {
                                  const displayName = getDisplayName(item.templateTahapan);
                                  return displayName.length > 30 
                                    ? displayName.substring(0, 30) + "..." 
                                    : displayName;
                                })()}
                              </a>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Tidak ada template</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={
                          item.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => router.push(`/laporan-pengawas/${pemilihanId}/laporan/${laporanId}/jenis/${jenisLaporanId}/buat-laporan/${item.tahapanLaporanId}`)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Laporan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

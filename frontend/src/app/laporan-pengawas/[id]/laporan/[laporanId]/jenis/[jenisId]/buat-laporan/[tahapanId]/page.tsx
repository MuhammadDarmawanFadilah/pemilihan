"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save, FileText, MapPin, Calendar, User, Download, ChevronRight, Check, Eye, X, RefreshCw, ImageIcon, Video, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast-simple";
import { useAuth } from "@/contexts/AuthContext";
import { tahapanLaporanAPI, TahapanLaporan } from "@/lib/tahapan-laporan-api";
import { getApiUrl } from "@/lib/config";

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

interface CreateLaporanForm {
  judulLaporan: string;
  deskripsiLaporan: string;
  lokasi: string;
  tanggalLaporan: string;
  uploadedFiles: string[]; // Changed to store server filenames
}

export default function BuatLaporanPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tahapan, setTahapan] = useState<TahapanLaporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<CreateLaporanForm>({
    judulLaporan: "",
    deskripsiLaporan: "",
    lokasi: "",
    tanggalLaporan: today,
    uploadedFiles: []
  });

  const pemilihanId = params?.id as string;
  const laporanId = params?.laporanId as string;
  const jenisLaporanId = params?.jenisId as string;
  const tahapanId = params?.tahapanId as string;

  useEffect(() => {
    if (tahapanId) {
      loadTahapan();
    }
    
    // Auto-populate location from user data
    const loadLocationData = async () => {
      try {
        const response = await fetch(getApiUrl('auth/me/location'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const locationData = await response.json();
          const locationParts = [];
          
          if (locationData.kelurahan) locationParts.push(locationData.kelurahan);
          if (locationData.kecamatan) locationParts.push(locationData.kecamatan);
          if (locationData.kota) locationParts.push(locationData.kota);
          if (locationData.provinsi) locationParts.push(locationData.provinsi);
          
          const autoLocation = locationParts.length > 0 ? locationParts.join(', ') : locationData.alamat || "";
          
          setFormData(prev => ({
            ...prev,
            lokasi: autoLocation
          }));
        }
      } catch (error) {
        console.error('Error loading location data:', error);
        // Fallback to biografi data if API fails
        if (user?.biografi) {
          const locationParts = [];
          if (user.biografi.kelurahanNama) locationParts.push(user.biografi.kelurahanNama);
          if (user.biografi.kecamatanNama) locationParts.push(user.biografi.kecamatanNama);
          if (user.biografi.kotaNama) locationParts.push(user.biografi.kotaNama);
          if (user.biografi.provinsiNama) locationParts.push(user.biografi.provinsiNama);
          
          const autoLocation = locationParts.length > 0 ? locationParts.join(', ') : user.biografi.alamat || "";
          
          setFormData(prev => ({
            ...prev,
            lokasi: autoLocation
          }));
        }
      }
    };
    
    if (user) {
      loadLocationData();
    }
  }, [tahapanId, user]);

  const loadTahapan = async () => {
    try {
      const response = await tahapanLaporanAPI.getById(parseInt(tahapanId));
      setTahapan(response);
      
      // Keep judul laporan empty for user input
    } catch (error: any) {
      console.error("Error loading tahapan:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data tahapan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateLaporanForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;
    
    console.log('Starting file upload for files:', fileArray.map(f => f.name));
    
    setUploading(true);
    
    // Upload each file to server sequentially
    for (const file of fileArray) {
      try {
        // Validate file size (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast({
            title: "Error",
            description: `File ${file.name} terlalu besar. Maksimal 10MB per file.`,
            variant: "destructive",
          });
          continue;
        }
        
        // Validate file type based on allowed extensions
        const allowedTypes = tahapan?.jenisFileIzin || [];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        // Check if file extension is directly allowed
        const isAllowedType = allowedTypes.includes(fileExtension || '');
        
        if (!isAllowedType) {
          toast({
            title: "Error",
            description: `File ${file.name} tidak sesuai tipe yang diizinkan. Tipe yang diizinkan: ${allowedTypes.map(t => t.toUpperCase()).join(', ')}`,
            variant: "destructive",
          });
          continue;
        }
        
        console.log(`File ${file.name} extension: ${fileExtension} - allowed by category: ${allowedTypes.join(', ')}`);
        console.log(`Allowed types:`, tahapan?.jenisFileIzin);
        
        console.log(`Uploading file: ${file.name}, size: ${file.size}`);
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch(getApiUrl('temp-files/upload'), {
          method: 'POST',
          body: uploadFormData,
        });

        console.log('Upload response status:', response.status);

        if (!response.ok) {
          let errorMessage = 'Gagal mengupload file';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.success && result.data && result.data.fileName) {
          const serverFileName = result.data.fileName;

          // Add to uploaded files list
          setFormData(prev => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, serverFileName]
          }));

          toast({
            title: "Upload berhasil",
            description: `File ${file.name} berhasil diupload`,
          });
        } else {
          throw new Error('Response tidak valid dari server');
        }

      } catch (error: any) {
        console.error('Upload error for file:', file.name, error);
        toast({
          title: "Upload gagal",
          description: `Gagal mengupload file ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = async (index: number) => {
    const fileName = formData.uploadedFiles[index];
    
    console.log('Removing file:', fileName);
    
    // Delete from server
    try {
      const response = await fetch(getApiUrl(`temp-files/${fileName}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('File deleted from server:', fileName);
        toast({
          title: "File dihapus",
          description: "File berhasil dihapus dari server",
        });
      } else {
        console.error('Failed to delete file from server:', fileName);
      }
    } catch (error) {
      console.error('Error deleting file from server:', error);
    }

    // Remove from local state
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const downloadAttachment = (filename: string) => {
    console.log('Downloading file:', filename);
    
    // Check if it's a temp file or permanent file
    const isTempFile = /^\d{8}_\d{6}_/.test(filename);
    
    let downloadUrl;
    if (isTempFile) {
      // Use temp file download endpoint
      downloadUrl = getApiUrl(`temp-files/download/${filename}`);
    } else {
      // Use permanent file download endpoint
      const fileName = filename.replace('documents/', '');
      downloadUrl = getApiUrl(`files/download/documents/${fileName}`);
    }
    
    console.log('Download URL:', downloadUrl);
    
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
        link.download = getDisplayName(filename);
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
  };

  const previewFile = (filename: string) => {
    console.log('Previewing file:', filename);
    
    // Check if it's a temp file or permanent file
    const isTempFile = /^\d{8}_\d{6}_/.test(filename);
    
    let previewUrl;
    if (isTempFile) {
      // Use temp file preview endpoint
      previewUrl = getApiUrl(`temp-files/preview/${filename}`);
    } else {
      // Use permanent file preview endpoint
      const fileName = filename.replace('documents/', '');
      previewUrl = getApiUrl(`files/preview/documents/${fileName}`);
    }
    
    console.log('Preview URL:', previewUrl);
    
    // Open preview in new tab
    window.open(previewUrl, '_blank');
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="h-5 w-5 text-purple-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-orange-600" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const canPreviewFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'].includes(extension || '');
  };

  const getDisplayName = (fileName: string) => {
    if (typeof fileName === 'string') {
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
    }
    return fileName;
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push(`/laporan-pengawas/${pemilihanId}/laporan/${laporanId}/jenis/${jenisLaporanId}`);
    } else {
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.judulLaporan.trim()) {
        throw new Error('Judul laporan wajib diisi');
      }
      
      if (!formData.deskripsiLaporan.trim()) {
        throw new Error('Deskripsi laporan wajib diisi');
      }

      // Prepare submission data
      const submitData = {
        judul: formData.judulLaporan,
        konten: formData.deskripsiLaporan,
        lokasi: formData.lokasi,
        tanggalLaporan: formData.tanggalLaporan,
        tempFiles: formData.uploadedFiles, // Temp files yang akan dipindah ke permanent
        tahapanLaporanId: parseInt(tahapanId),
        jenisLaporanId: parseInt(jenisLaporanId),
        laporanId: parseInt(laporanId),
        pemilihanId: parseInt(pemilihanId),
        userId: user?.id || 1 // ID user yang submit
      };

      console.log('Submitting laporan data:', submitData);
      
      // Call API to create detail laporan
      const response = await fetch(getApiUrl('detail-laporan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan laporan');
      }

      const result = await response.json();
      console.log('Submit result:', result);
      
      // Show professional success notification
      toast({
        title: "✅ Laporan Berhasil Dibuat",
        description: "Laporan pengawasan telah disimpan dengan sukses dan akan diproses oleh tim terkait.",
        variant: "default",
      });
      
      // Navigate to laporan-saya with delay to show toast
      setTimeout(() => {
        router.push('/laporan-saya');
      }, 1000);
      
    } catch (error: any) {
      console.error("Error creating laporan:", error);
      
      // Show professional error notification
      toast({
        title: "❌ Gagal Menyimpan Laporan",
        description: error.message || "Terjadi kesalahan saat menyimpan laporan. Silakan coba lagi atau hubungi administrator.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <span className="text-muted-foreground">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Buat Laporan</h1>
                  <p className="text-muted-foreground mt-1">
                    {tahapan?.nama || 'Memuat...'}
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/laporan-pengawas/${pemilihanId}/laporan/${laporanId}/jenis/${jenisLaporanId}`)}
                    className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                  >
                    Detail Tahapan
                  </Button>
                  <span className="mx-2 text-muted-foreground/60">→</span>
                  <span className="text-foreground font-medium">Buat Laporan</span>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 1 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    Informasi Tahapan
                  </span>
                </div>
                
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= 2 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    Detail Laporan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Informasi Tahapan */}
        {currentStep === 1 && tahapan && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informasi Tahapan</h2>
            
            <div className="space-y-4">
              {/* Nama Tahapan */}
              <div>
                <Label className="text-sm font-semibold text-foreground">Nama Tahapan</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-foreground font-medium">{tahapan.nama}</p>
                </div>
              </div>

              {/* Deskripsi Tahapan */}
              {tahapan.deskripsi && (
                <div>
                  <Label className="text-sm font-semibold text-foreground">Deskripsi Tahapan</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">{tahapan.deskripsi}</p>
                  </div>
                </div>
              )}

              {/* Template Lampiran */}
              {tahapan.templateTahapan && (
                <div>
                  <Label className="text-sm font-semibold text-foreground">Template Lampiran</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{getDisplayName(tahapan.templateTahapan)}</p>
                        <p className="text-sm text-muted-foreground">Klik untuk mengunduh template</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAttachment(tahapan.templateTahapan!)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Jenis File yang Diizinkan */}
              {tahapan.jenisFileIzin && tahapan.jenisFileIzin.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-foreground">Jenis File yang Diizinkan</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Group file types by category */}
                      {(() => {
                        const FILE_TYPE_CATEGORIES = {
                          'PDF': ['pdf'],
                          'Word': ['doc', 'docx'],
                          'Excel': ['xlsx', 'xls', 'csv'],
                          'Image': ['jpg', 'jpeg', 'png', 'gif'],
                          'Video': ['mp4', 'avi', 'mov'],
                          'Other': ['txt', 'zip', 'rar']
                        };

                        const groupedTypes: { [key: string]: string[] } = {};
                        const ungroupedTypes: string[] = [];

                        // Group the allowed file types by category
                        tahapan.jenisFileIzin.forEach(type => {
                          let found = false;
                          for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
                            if (types.includes(type.toLowerCase())) {
                              if (!groupedTypes[category]) {
                                groupedTypes[category] = [];
                              }
                              groupedTypes[category].push(type);
                              found = true;
                              break;
                            }
                          }
                          if (!found) {
                            ungroupedTypes.push(type);
                          }
                        });

                        return (
                          <>
                            {/* Display grouped categories */}
                            {Object.entries(groupedTypes).map(([category, types]) => (
                              <div key={category} className="border border-border rounded-lg p-3 bg-card">
                                <div className="font-medium text-sm text-foreground mb-2">{category}</div>
                                <div className="flex flex-wrap gap-1">
                                  {types.map((type, index) => (
                                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary text-xs">
                                      {type.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Display ungrouped types */}
                            {ungroupedTypes.length > 0 && (
                              <div className="border border-border rounded-lg p-3 bg-card">
                                <div className="font-medium text-sm text-foreground mb-2">Lainnya</div>
                                <div className="flex flex-wrap gap-1">
                                  {ungroupedTypes.map((type, index) => (
                                    <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                      {type.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Summary text */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Total {tahapan.jenisFileIzin.length} jenis file diizinkan: {tahapan.jenisFileIzin.map(type => type.toUpperCase()).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Button onClick={handleNext}>
                Lanjut
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Detail Laporan */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Laporan Form */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Detail Laporan</h2>
              
              <div className="space-y-6">
                {/* Metadata Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-foreground">Informasi Laporan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Dibuat oleh</p>
                        <p className="font-medium text-foreground">{user?.fullName || user?.username || 'User'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Tanggal Laporan</p>
                        <p className="font-medium text-foreground">{formData.tanggalLaporan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Lokasi</p>
                        <p className="font-medium text-foreground">{formData.lokasi || 'Belum diatur'}</p>
                        {/* Hidden input untuk menyimpan lokasi */}
                        <input
                          type="hidden"
                          value={formData.lokasi}
                          onChange={(e) => handleInputChange('lokasi', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="judulLaporan">Judul Laporan *</Label>
                    <Input
                      id="judulLaporan"
                      value={formData.judulLaporan}
                      onChange={(e) => handleInputChange('judulLaporan', e.target.value)}
                      placeholder="Masukkan judul laporan"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deskripsiLaporan">Deskripsi Laporan *</Label>
                    <Textarea
                      id="deskripsiLaporan"
                      value={formData.deskripsiLaporan}
                      onChange={(e) => handleInputChange('deskripsiLaporan', e.target.value)}
                      placeholder="Jelaskan detail laporan pengawasan..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Upload File Pendukung</Label>
                  <div className="mt-2">
                    {!uploading ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                          isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-border/60'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          multiple
                          accept={tahapan?.jenisFileIzin?.map(ext => `.${ext}`).join(',') || '*/*'}
                          onChange={handleFileInputChange}
                        />
                        <Upload className={`h-8 w-8 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`}>
                          <span className="font-semibold">
                            {isDragOver ? 'Lepaskan file di sini' : 'Klik untuk upload'}
                          </span>
                          {!isDragOver && ' atau drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {tahapan?.jenisFileIzin && tahapan.jenisFileIzin.length > 0 ? (
                            `File yang diizinkan: ${tahapan.jenisFileIzin.map(ext => ext.toUpperCase()).join(', ')} (Max 10MB per file)`
                          ) : (
                            'Semua jenis file diizinkan (Max 10MB per file)'
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted">
                        <RefreshCw className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
                        <p className="text-sm text-primary">
                          <span className="font-semibold">Mengupload file...</span>
                        </p>
                      </div>
                    )}

                    {/* Uploaded Files List */}
                    {formData.uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">File yang diupload:</Label>
                        {formData.uploadedFiles.map((fileName, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              {getFileIcon(getDisplayName(fileName))}
                              <div>
                                <p className="text-sm font-medium text-foreground">{getDisplayName(fileName)}</p>
                                <p className="text-xs text-muted-foreground">File tersimpan di server</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {canPreviewFile(getDisplayName(fileName)) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => previewFile(fileName)}
                                  className="h-8 w-8 p-0"
                                  title="Preview file"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadAttachment(fileName)}
                                className="h-8 w-8 p-0"
                                title="Download file"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                                title="Hapus file"
                                disabled={uploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={uploading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || uploading || !formData.judulLaporan || !formData.deskripsiLaporan}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Laporan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

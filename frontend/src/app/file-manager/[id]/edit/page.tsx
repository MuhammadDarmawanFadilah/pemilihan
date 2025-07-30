'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast-utils"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Upload, ArrowLeft, FileText, Eye, Download, File, X, ImageIcon, 
  FolderOpen, ChevronRight, Save, Edit, User, Calendar, CheckCircle, 
  AlertCircle, FileVideo, FileArchive, FileCode, Folder, Check, Trash2
} from 'lucide-react'
import { getApiUrl } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { SearchableSelectObject } from "@/components/ui/searchable-select-object"
import ProtectedRoute from "@/components/ProtectedRoute"
import { ThemeToggle } from "@/components/theme-toggle"

interface FileData {
  id: number
  judul: string
  deskripsi: string
  fileName: string
  fileType: string
  fileSize: number
  pegawaiId: number
  pegawaiNama: string
  kategoriId: number
  kategoriNama: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface KategoriOption {
  id: number
  nama: string
}

interface PegawaiOption {
  id: number
  fullName: string
}

// File Preview Modal Component untuk temp files
function TempFilePreviewModal({ 
  tempFileName,
  originalName,
  isOpen, 
  onClose 
}: { 
  tempFileName: string | null;
  originalName: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tempFileName) {
      setIsLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      
      // Create a function to load the preview with proper error handling
      const loadPreview = async () => {
        try {
          const previewUrl = `${API_BASE_URL}/api/temp-files/preview/${tempFileName}`;
          const response = await fetch(previewUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setBlobUrl(blobUrl);
          } else {
            throw new Error(`Failed to load preview: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error('Preview error:', err);
          setError(err instanceof Error ? err.message : 'Gagal memuat preview');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadPreview();
    } else {
      setBlobUrl(null);
      setIsLoading(false);
      setError(null);
    }
    
    // Cleanup function to revoke blob URL
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [tempFileName]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!tempFileName || !isOpen) return null;

  const fileExtension = originalName?.split('.').pop()?.toLowerCase() || '';

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground bg-background">
          <X className="h-16 w-16 mb-4 text-destructive" />
          <p className="text-lg mb-2">Gagal memuat preview</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (isLoading || !blobUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground bg-background">
          <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-lg">Memuat preview...</p>
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={blobUrl}
            alt={originalName || 'Preview'} 
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onError={() => setError('Gagal memuat gambar')}
          />
        </div>
      );
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <video 
            src={blobUrl}
            controls 
            className="max-w-full max-h-full"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onError={() => setError('Gagal memuat video')}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      );
    } else if (['pdf'].includes(fileExtension)) {
      return (
        <div className="h-full">
          <iframe 
            src={blobUrl}
            className="w-full h-full border-0"
            title={originalName || 'PDF Preview'}
            onError={() => setError('Gagal memuat PDF')}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-foreground bg-background">
            <File className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg mb-2">Preview tidak tersedia</p>
            <p className="text-sm text-muted-foreground">File: {originalName}</p>
            <p className="text-xs text-muted-foreground mt-2">Format file tidak didukung untuk preview</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black dark:bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-lg">
            <Eye className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{originalName}</h3>
            <p className="text-sm text-muted-foreground">Preview File • {fileExtension?.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onClose} 
            variant="secondary" 
            size="sm"
            className="hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 pt-20">
        {renderPreview()}
      </div>
    </div>
  );
}

// File Preview Modal Component
function FilePreviewModal({ 
  fileName, 
  isOpen, 
  onClose 
}: { 
  fileName: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileName) {
      setIsLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      
      // Create a function to load the preview with proper error handling
      const loadPreview = async () => {
        try {
          // Check if this is a new temp file (has datetime pattern: YYYYMMDD_HHMMSS_)
          const isTempFile = /^\d{8}_\d{6}_[a-f0-9]{8}_/.test(fileName);
          
          let previewUrl;
          if (isTempFile) {
            // For temp files, use temp-files preview endpoint
            previewUrl = `${API_BASE_URL}/api/temp-files/preview/${fileName}`;
          } else {
            // For permanent files, use admin file-pegawai preview endpoint
            previewUrl = `${API_BASE_URL}/api/admin/file-pegawai/preview/${fileName}`;
          }
          
          const response = await fetch(previewUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setBlobUrl(blobUrl);
          } else {
            throw new Error(`Failed to load preview: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error('Preview error:', err);
          setError(err instanceof Error ? err.message : 'Gagal memuat preview');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadPreview();
    } else {
      setBlobUrl(null);
      setIsLoading(false);
      setError(null);
    }
    
    // Cleanup function to revoke blob URL
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileName]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!fileName || !isOpen) return null;

  const fileExtension = fileName?.split('.').pop()?.toLowerCase() || '';

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground bg-background">
          <X className="h-16 w-16 mb-4 text-destructive" />
          <p className="text-lg mb-2">Gagal memuat preview</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (isLoading || !blobUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-foreground bg-background">
          <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-lg">Memuat preview...</p>
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={blobUrl} 
            alt={fileName || 'Preview'} 
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onError={() => setError('Gagal memuat gambar')}
          />
        </div>
      );
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <video 
            src={blobUrl} 
            controls 
            className="max-w-full max-h-full"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onError={() => setError('Gagal memuat video')}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      );
    } else if (['pdf'].includes(fileExtension)) {
      return (
        <div className="h-full">
          <iframe 
            src={blobUrl} 
            className="w-full h-full border-0"
            title={fileName || 'PDF Preview'}
            onError={() => setError('Gagal memuat PDF')}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-foreground bg-background">
            <File className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg mb-2">Preview tidak tersedia</p>
            <p className="text-sm text-muted-foreground">File: {fileName}</p>
            <p className="text-xs text-muted-foreground mt-2">Format file tidak didukung untuk preview</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black dark:bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm border-b border-border p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-lg">
            <Eye className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{fileName}</h3>
            <p className="text-sm text-muted-foreground">Preview File • {fileExtension?.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onClose} 
            variant="secondary" 
            size="sm"
            className="hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 pt-20">
        {renderPreview()}
      </div>
    </div>
  );
}

export default function FileEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [file, setFile] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isTempPreviewOpen, setIsTempPreviewOpen] = useState(false)
  
  // Step 1 data (Kategori)
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null)
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
  const [selectedPegawai, setSelectedPegawai] = useState<number | null>(null)
  const [pegawaiOptions, setPegawaiOptions] = useState<PegawaiOption[]>([])
  const isAdmin = user?.role?.roleName === 'ADMIN' || user?.role?.roleName === 'MODERATOR'
  
  // Step 2 data (File Edit)
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategoriId: null as number | null
  })
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newFileTempName, setNewFileTempName] = useState<string | null>(null)
  const [newFileLoading, setNewFileLoading] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ tempFileName: string; originalName: string } | null>(null)

  const fileId = params.id as string

  useEffect(() => {
    setMounted(true)
    if (fileId) {
      fetchFileDetail()
      loadKategoriOptions()
    }
  }, [fileId])
  
  useEffect(() => {
    // Load pegawai options when user data is loaded and admin status is determined
    if (user && isAdmin) {
      console.log('Loading pegawai options for admin user')
      loadPegawaiOptions()
    }
  }, [user, isAdmin])
  
  useEffect(() => {
    // For non-admin users, auto-select current user as pegawai if not already set
    if (user && !isAdmin && !selectedPegawai) {
      console.log('Auto-selecting current user as pegawai for non-admin:', user.id)
      setSelectedPegawai(user.id)
    }
  }, [user, isAdmin, selectedPegawai])

  const fetchFileDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl(`api/admin/file-pegawai/${fileId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('File detail loaded:', data)
        setFile(data)
        setFormData({
          judul: data.judul || '',
          deskripsi: data.deskripsi || '',
          kategoriId: data.kategoriId || null
        })
        setSelectedKategori(data.kategoriId || null)
        
        // Set selected pegawai from file data
        if (data.pegawaiId) {
          console.log('Setting selectedPegawai to:', data.pegawaiId, typeof data.pegawaiId)
          setSelectedPegawai(data.pegawaiId)
        }
      } else {
        showErrorToast('Gagal memuat detail file')
        router.push('/file-manager')
      }
    } catch (error) {
      console.error('Error fetching file detail:', error)
      showErrorToast('Gagal memuat detail file')
      router.push('/file-manager')
    } finally {
      setLoading(false)
    }
  }

  const loadKategoriOptions = async () => {
    try {
      const response = await fetch(getApiUrl('api/admin/master-data/file-kategori/active'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setKategoriOptions(data)
      }
    } catch (error) {
      console.error('Error loading kategori options:', error)
      showErrorToast('Gagal memuat kategori file')
    }
  }
  
  const loadPegawaiOptions = async () => {
    if (!isAdmin) {
      console.log('Skipping pegawai options load - not admin')
      return
    }
    
    console.log('Loading pegawai options...')
    try {
      const response = await fetch(getApiUrl('api/pegawai/active'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      console.log('Pegawai API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Pegawai data received:', data.length, 'items')
        const mappedOptions = data.map((pegawai: any) => ({
          id: pegawai.id,
          fullName: pegawai.fullName
        }))
        console.log('Mapped pegawai options:', mappedOptions)
        setPegawaiOptions(mappedOptions)
      } else {
        console.error('Failed to load pegawai data:', response.status)
      }
    } catch (error) {
      console.error('Error loading pegawai options:', error)
    }
  }

  const handleStep1Next = () => {
    // Check pegawai selection
    if (!selectedPegawai) {
      showErrorToast(isAdmin ? 'Pegawai harus dipilih' : 'Terjadi kesalahan: pegawai tidak teridentifikasi')
      return
    }
    
    if (!selectedKategori) {
      showErrorToast('Kategori file harus dipilih')
      return
    }
    
    setFormData(prev => ({ ...prev, kategoriId: selectedKategori }))
    setStep(2)
  }

  const uploadFileToTemp = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(getApiUrl('api/temp-files/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Gagal upload file')
    }

    const data = await response.json()
    return data.data?.fileName || data.fileName
  }

  const handleFileSelect = async (file: File) => {
    try {
      setNewFileLoading(true)
      setNewFile(file)
      
      const tempFileName = await uploadFileToTemp(file)
      setNewFileTempName(tempFileName)
    } catch (error) {
      console.error('Error uploading file:', error)
      showErrorToast(error instanceof Error ? error.message : 'Gagal mengupload file')
      setNewFile(null)
      setNewFileTempName(null)
    } finally {
      setNewFileLoading(false)
    }
  }

  const handleFilePreview = (tempFileName: string, originalName: string) => {
    setPreviewFile({ tempFileName, originalName })
    setIsTempPreviewOpen(true)
  }

  const handleFileDownload = async (tempFileName: string, originalName: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const downloadUrl = `${API_BASE_URL}/api/temp-files/download/${tempFileName}`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessToast(`File ${originalName} berhasil didownload`);
    } catch (error) {
      console.error('Download error:', error);
      showErrorToast(error instanceof Error ? error.message : 'Gagal mendownload file');
    }
  }

  const handleSubmit = async () => {
    // Validate
    if (!formData.judul.trim()) {
      showErrorToast('Judul file harus diisi')
      return
    }

    if (!formData.kategoriId) {
      showErrorToast('Kategori file harus dipilih')
      return
    }
    
    // Check pegawai selection
    if (!selectedPegawai) {
      showErrorToast(isAdmin ? 'Pegawai harus dipilih' : 'Terjadi kesalahan: pegawai tidak teridentifikasi')
      return
    }

    try {
      setSaving(true)
      
      let updateData: any = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        kategoriId: formData.kategoriId,
        pegawaiId: selectedPegawai || file?.pegawaiId,
        fileName: file?.fileName,
        fileType: file?.fileType,
        fileSize: file?.fileSize,
        isActive: file?.isActive
      }
      
      console.log('Sending update data:', updateData)
      
      // If new file is selected, upload it first
      if (newFile && newFileTempName) {
        updateData.fileName = newFileTempName
        updateData.fileType = newFile.type
        updateData.fileSize = newFile.size
      }
      
      const response = await fetch(getApiUrl(`api/admin/file-pegawai/${fileId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        showSuccessToast('File berhasil diperbarui')
        router.push(`/file-manager/${fileId}`)
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.message || 'Gagal memperbarui file')
      }
    } catch (error) {
      console.error('Error updating file:', error)
      showErrorToast(error instanceof Error ? error.message : 'Gagal memperbarui file')
    } finally {
      setSaving(false)
    }
  }

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || fileType?.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-green-600" />;
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension) || fileType?.startsWith('video/')) {
      return (
        <div className="relative">
          <FileText className="h-6 w-6 text-blue-600" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">▶</span>
          </div>
        </div>
      );
    } else if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
      return (
        <div className="relative">
          <FileText className="h-6 w-6 text-red-600" />
          <div className="absolute -top-1 -right-1 text-[8px] font-bold text-red-600">PDF</div>
        </div>
      );
    } else {
      return <File className="h-6 w-6 text-muted-foreground" />;
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    if (!file) return

    try {
      // Check if this is a new temp file (has datetime pattern: YYYYMMDD_HHMMSS_)
      const isTempFile = /^\d{8}_\d{6}_[a-f0-9]{8}_/.test(file.fileName);
      
      let downloadUrl;
      if (isTempFile) {
        // For temp files, use temp-files download endpoint
        downloadUrl = getApiUrl(`api/temp-files/download/${file.fileName}`);
      } else {
        // For permanent files, use admin file-pegawai download endpoint
        downloadUrl = getApiUrl(`api/admin/file-pegawai/download/${file.fileName}`);
      }

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        showSuccessToast(`File ${file.fileName} berhasil diunduh`)
      } else {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      showErrorToast(error instanceof Error ? error.message : 'Gagal mengunduh file')
    }
  }

  if (!mounted) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-muted-foreground">Memuat halaman...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner />
            <span className="text-muted-foreground">Memuat file...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!file) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">File tidak ditemukan</h3>
            <p className="text-muted-foreground mb-4">File yang Anda cari tidak ada atau telah dihapus</p>
            <Button onClick={() => router.push('/file-manager')}>
              Kembali ke File Manager
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => step === 1 ? router.push(`/file-manager/${fileId}`) : setStep(1)}
                  className="h-12 px-4 shadow-md border-border hover:bg-muted transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {step === 1 ? 'Kembali' : 'Kembali ke Step 1'}
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Edit File
                  </h1>
                  <p className="text-muted-foreground mt-1 font-medium">
                    Step {step} dari 2: {step === 1 ? 'Pilih Kategori File' : 'Edit File'}
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="h-12 px-6 shadow-md border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  className="h-12 px-6 shadow-md border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 transition-all duration-200"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                {/* Step 1 Circle */}
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ${
                  step >= 1 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <FolderOpen className="w-6 h-6" />
                  {step >= 1 && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
                
                {/* Progress Line */}
                <div className="relative mx-8">
                  <div className="h-1 w-32 bg-muted rounded-full"></div>
                  <div className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-700 ${
                    step >= 2 ? 'w-full bg-gradient-to-r from-blue-600 to-indigo-600' : 'w-0'
                  }`}></div>
                </div>
                
                {/* Step 2 Circle */}
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ${
                  step >= 2 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-110' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Upload className="w-6 h-6" />
                  {step >= 2 && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center justify-between w-80">
                <div className="text-center">
                  <div className={`text-sm font-semibold transition-colors duration-300 ${
                    step >= 1 ? 'text-blue-600' : 'text-muted-foreground'
                  }`}>
                    Pilih Kategori
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Kategori File</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-semibold transition-colors duration-300 ${
                    step >= 2 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    Upload File
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Dokumen & Detail</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Select Kategori */}
          {step === 1 && (
            <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <FolderOpen className="w-5 h-5" />
                  Pilih Kategori File
                  <span className="text-blue-200 text-sm font-normal">(1/2)</span>
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">
                  Tentukan kategori untuk file yang akan diupload
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <div className="max-w-md mx-auto space-y-8">
                  
                  {/* Pegawai Selection for Admin */}
                  {isAdmin && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Label htmlFor="pegawai" className="text-lg font-semibold text-foreground">
                          Pegawai
                        </Label>
                        <span className="text-destructive text-sm">*</span>
                      </div>
                      <div className="relative">
                        <SearchableSelectObject
                          options={pegawaiOptions.map(pegawai => ({
                            id: pegawai.id,
                            label: pegawai.fullName
                          }))}
                          value={selectedPegawai}
                          placeholder="👤 Cari dan pilih pegawai..."
                          searchPlaceholder="Ketik nama pegawai..."
                          emptyText="Tidak ada pegawai ditemukan"
                          onValueChange={setSelectedPegawai}
                          className="h-14 text-base border-2 border-border focus:border-blue-500 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Label htmlFor="kategori" className="text-lg font-semibold text-foreground">
                        Kategori File
                      </Label>
                      <span className="text-destructive text-sm">*</span>
                    </div>
                    <div className="relative">
                      <SearchableSelectObject
                        options={kategoriOptions.map(kategori => ({
                          id: kategori.id,
                          label: kategori.nama
                        }))}
                        value={selectedKategori}
                        placeholder="📁 Cari dan pilih kategori..."
                        searchPlaceholder="Ketik nama kategori..."
                        emptyText="Tidak ada kategori ditemukan"
                        onValueChange={setSelectedKategori}
                        className="h-14 text-base border-2 border-border focus:border-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleStep1Next}
                      size="lg"
                      className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                    >
                      Lanjut ke Upload File
                      <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload Files */}
          {step === 2 && (
            <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <Upload className="w-5 h-5" />
                  Upload File Baru
                  <span className="text-green-200 text-sm font-normal">(2/2)</span>
                </CardTitle>
                <CardDescription className="text-green-100 text-sm mt-1">
                  Kategori: {kategoriOptions.find(k => k.id === selectedKategori)?.nama}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-10">
                <div className="space-y-10">
                  {/* File Upload Section */}
                  <div className="bg-gradient-to-br from-background to-muted/50 border-2 border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
                        <Edit className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Edit File
                        </h3>
                        <p className="text-sm text-muted-foreground">Perbarui dokumen dan detail</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="judul" className="text-base font-semibold text-foreground">
                            Judul File
                          </Label>
                          <span className="text-destructive text-sm">*</span>
                        </div>
                        <Input
                          id="judul"
                          value={formData.judul}
                          onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                          placeholder="Masukkan judul file yang deskriptif..."
                          className="h-14 text-base border-2 border-border focus:border-green-500 rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="newFile" className="text-base font-semibold text-foreground">
                            Upload File
                          </Label>
                        </div>
                        <div className="space-y-4">
                          <div className="relative">
                            <Input
                              id="newFile"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileSelect(file)
                                }
                              }}
                              className="h-14 text-base border-2 border-dashed border-border focus:border-green-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-950 dark:file:text-green-400 dark:hover:file:bg-green-900"
                            />
                          </div>
                          
                          {/* File Upload Status */}
                          {newFileLoading && (
                            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-inner">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-card rounded-xl shadow-sm border border-blue-200">
                                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground text-lg">
                                    Mengupload file...
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    📤 Mohon tunggu, file sedang diproses
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Current File Info */}
                    <div className="mt-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-inner">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground">File Sebelum</h4>
                        {/^\d{8}_\d{6}_[a-f0-9]{8}_/.test(file.fileName) ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
                            🔄 Temp File
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                            💾 Permanent
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative p-4 bg-card rounded-xl shadow-md border-2 border-blue-200 dark:border-blue-800">
                            {getFileIcon(file.fileName)}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-lg truncate mb-1">
                              {file.fileName}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              📊 {formatFileSize(file.fileSize)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 bg-muted rounded-lg px-3 py-1 inline-block">
                              {/^\d{8}_\d{6}_[a-f0-9]{8}_/.test(file.fileName) 
                                ? "🔄 File temporary yang baru diupload" 
                                : "💾 File yang sudah tersimpan permanent"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg', 'avi', 'mov'].includes(
                            file.fileName.split('.').pop()?.toLowerCase() || ''
                          ) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsPreviewOpen(true)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950 dark:border-blue-800 rounded-lg h-10 px-4"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 dark:border-green-800 rounded-lg h-10 px-4"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* New File Upload Result */}
                    {newFile && newFileTempName && !newFileLoading && (
                      <div className="mt-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-inner">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-lg">
                            <Upload className="w-4 h-4" />
                          </div>
                          <h4 className="text-lg font-bold text-foreground">File Sesudah</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                            ✨ File Baru
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative p-4 bg-card rounded-xl shadow-md border-2 border-green-200 dark:border-green-800">
                              {getFileIcon(newFile.name)}
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-lg truncate mb-1">
                                {newFile.name}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                📊 {newFile.size ? `${(newFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-1 inline-block">
                                ✨ File pengganti yang akan disimpan setelah submit
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            {['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg', 'avi', 'mov'].includes(
                              newFile.name.split('.').pop()?.toLowerCase() || ''
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilePreview(newFileTempName!, newFile.name!)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950 dark:border-blue-800 rounded-lg h-10 px-4"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDownload(newFileTempName!, newFile.name!)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 dark:border-green-800 rounded-lg h-10 px-4"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Visual Transition Arrow - only show when there's a new file */}
                    {newFile && newFileTempName && !newFileLoading && (
                      <div className="flex justify-center my-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                          <span className="text-sm font-medium">Akan Diganti</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 space-y-4">
                      <Label htmlFor="deskripsi" className="text-base font-semibold text-foreground">
                        Deskripsi File
                      </Label>
                      <Textarea
                        id="deskripsi"
                        value={formData.deskripsi}
                        onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                        placeholder="Tambahkan deskripsi file untuk memudahkan pencarian dan identifikasi..."
                        className="h-24 resize-none text-base border-2 border-border focus:border-green-500 rounded-xl"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      size="lg"
                      className="px-8 py-4 text-lg border-2 border-border rounded-xl hover:bg-muted"
                    >
                      <ArrowLeft className="mr-2 h-6 w-6" />
                      Kembali
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={saving}
                      size="lg"
                      className="px-12 py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full mr-3" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-3 h-6 w-6" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* File Preview Modals */}
        <FilePreviewModal
          fileName={file?.fileName || null}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
        
        <TempFilePreviewModal
          tempFileName={previewFile?.tempFileName || null}
          originalName={previewFile?.originalName || null}
          isOpen={isTempPreviewOpen}
          onClose={() => {
            setIsTempPreviewOpen(false)
            setPreviewFile(null)
          }}
        />
      </div>
    </ProtectedRoute>
  )
}

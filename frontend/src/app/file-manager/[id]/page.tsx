'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast-utils"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, FileText, User, Calendar, Download, Edit, Trash2, 
  Eye, Share2, Clock, HardDrive, Tag, File, Image, Video,
  FileArchive, FileCode, AlertCircle, CheckCircle2, Copy,
  MoreHorizontal, ExternalLink
} from 'lucide-react'
import { useAuth } from "@/contexts/AuthContext"
import { getApiUrl } from "@/lib/config"
import ProtectedRoute from "@/components/ProtectedRoute"
import { cn } from "@/lib/utils"

interface FileItem {
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

export default function FileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [file, setFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const fileId = params.id as string

  useEffect(() => {
    setMounted(true)
    if (fileId) {
      fetchFileDetail()
    }
  }, [fileId])

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
        setFile(data)
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

  const handleDownload = async () => {
    if (!file) return

    try {
      const response = await fetch(getApiUrl(`api/files/download/documents/${file.fileName}`), {
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
        showErrorToast('Gagal mengunduh file')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      showErrorToast('Gagal mengunduh file')
    }
  }

  const handleEdit = () => {
    router.push(`/file-manager/${fileId}/edit`)
  }

  const handleDelete = () => {
    setIsDeleteOpen(true)
  }

  const submitDelete = async () => {
    if (!file) return

    try {
      setDeleteLoading(true)
      const response = await fetch(getApiUrl(`api/admin/file-pegawai/${file.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        showSuccessToast('File berhasil dihapus')
        router.push('/file-manager')
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.message || 'Gagal menghapus file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      showErrorToast('Gagal menghapus file')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || fileType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension) || fileType?.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />;
    } else if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <FileArchive className="h-8 w-8 text-orange-500" />;
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yml', 'yaml'].includes(extension)) {
      return <FileCode className="h-8 w-8 text-green-500" />;
    } else {
      return <File className="h-8 w-8 text-muted-foreground" />;
    }
  }

  const getFileTypeInfo = (fileName: string, fileType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || fileType?.startsWith('image/')) {
      return { category: 'Gambar', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension) || fileType?.startsWith('video/')) {
      return { category: 'Video', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    } else if (['pdf'].includes(extension) || fileType?.includes('pdf')) {
      return { category: 'Dokumen PDF', color: 'bg-red-50 text-red-700 border-red-200' };
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return { category: 'Arsip', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yml', 'yaml'].includes(extension)) {
      return { category: 'Kode', color: 'bg-green-50 text-green-700 border-green-200' };
    } else {
      return { category: 'File', color: 'bg-muted text-muted-foreground border-border' };
    }
  }

  const copyFileName = () => {
    if (file) {
      navigator.clipboard.writeText(file.fileName)
      showSuccessToast('Nama file berhasil disalin')
    }
  }

  const previewFile = () => {
    if (file) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const isTempFile = /^\d{8}_\d{6}_[a-f0-9]{8}_/.test(file.fileName);
      
      let previewUrl;
      if (isTempFile) {
        previewUrl = `${API_BASE_URL}/api/temp-files/preview/${file.fileName}`;
      } else {
        previewUrl = `${API_BASE_URL}/api/files/preview/documents/${file.fileName}`;
      }
      
      window.open(previewUrl, '_blank');
    }
  }

  if (!mounted) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!file) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">File tidak ditemukan</h2>
                <p className="text-muted-foreground mb-4">File yang Anda cari tidak dapat ditemukan.</p>
                <Button onClick={() => router.push('/file-manager')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke File Manager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Back Button & Title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/file-manager')}
                  className="hover:bg-accent/60"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    {getFileIcon(file.fileName, file.fileType)}
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground truncate max-w-md">
                      {file.judul}
                    </h1>
                    <p className="text-sm text-muted-foreground">{file.fileName}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previewFile}
                  className="hidden sm:flex hover:bg-blue-50 border-blue-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="hover:bg-green-50 border-green-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="hover:bg-orange-50 border-orange-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="hover:bg-red-50 border-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content - File Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* File Overview Card */}
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        {getFileIcon(file.fileName, file.fileType)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground mb-1">
                          {file.judul}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {file.deskripsi || 'Tidak ada deskripsi'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={file.isActive ? "default" : "secondary"}
                      className={cn(
                        "text-xs font-medium",
                        file.isActive 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {file.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Nonaktif
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* File Properties Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* File Name */}
                    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Nama File
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyFileName}
                          className="h-6 w-6 p-0 hover:bg-muted"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {file.fileName}
                      </p>
                    </div>

                    {/* File Size */}
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                      <label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2 block">
                        Ukuran File
                      </label>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-gray-900">
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>

                    {/* File Type */}
                    <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-lg p-4">
                      <label className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2 block">
                        Tipe File
                      </label>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-500" />
                        <Badge variant="outline" className={getFileTypeInfo(file.fileName, file.fileType).color}>
                          {getFileTypeInfo(file.fileName, file.fileType).category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Category & Additional Info */}
                  {file.kategoriNama && (
                    <div className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg p-4">
                      <label className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 block">
                        Kategori Dokumen
                      </label>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        {file.kategoriNama}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MoreHorizontal className="h-5 w-5" />
                    Aksi Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={previewFile}
                      className="h-auto flex-col gap-2 p-4 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium">Preview</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="h-auto flex-col gap-2 p-4 hover:bg-green-50 border-green-200"
                    >
                      <Download className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium">Download</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="h-auto flex-col gap-2 p-4 hover:bg-orange-50 border-orange-200"
                    >
                      <Edit className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-medium">Edit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/file-manager/${file.id}`, '_blank')}
                      className="h-auto flex-col gap-2 p-4 hover:bg-purple-50 border-purple-200"
                    >
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium">Buka Tab</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Metadata */}
            <div className="space-y-6">
              {/* Upload Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          Diupload Oleh
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {file.pegawaiNama}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">
                          Tanggal Upload
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>

                    {file.updatedAt !== file.createdAt && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                            Terakhir Diubah
                          </label>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(file.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* File Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Kelola File</CardTitle>
                  <CardDescription>
                    Aksi yang dapat dilakukan pada file ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleDownload} 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                  
                  <Button 
                    onClick={handleEdit} 
                    variant="outline" 
                    className="w-full hover:bg-orange-50 border-orange-200 text-orange-700"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Detail
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    onClick={handleDelete} 
                    variant="outline" 
                    className="w-full hover:bg-red-50 border-red-200 text-red-600"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus File
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Hapus File"
          description={`Apakah Anda yakin ingin menghapus file "${file.judul}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          cancelText="Batal"
          variant="destructive"
          onConfirm={submitDelete}
          loading={deleteLoading}
        />
      </div>
    </ProtectedRoute>
  )
}

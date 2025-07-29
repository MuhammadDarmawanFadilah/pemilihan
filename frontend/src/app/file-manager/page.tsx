'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast-utils"
import { SortableHeader } from '@/components/ui/sortable-header'
import { ServerPagination } from '@/components/ServerPagination'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PegawaiSearchDropdown } from '@/components/PegawaiSearchDropdown'
import { Plus, MoreHorizontal, Edit, FileText, Eye, Download, Upload, Trash2 } from 'lucide-react'
import { AdminPageHeader } from "@/components/AdminPageHeader"
import AdminFilters from "@/components/AdminFilters"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/config"
import ProtectedRoute from "@/components/ProtectedRoute"

interface FilePegawaiResponse {
  id: number
  judul: string
  deskripsi?: string
  fileName: string
  fileType?: string
  fileSize?: number
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

export default function FileManagerPage() {
  const { user, isAuthenticated } = useAuth()
  const [fileList, setFileList] = useState<FilePegawaiResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FilePegawaiResponse | null>(null)
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null)
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>('')
  
  const { toast } = useToast()
  const router = useRouter()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Load data from backend
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (mounted) {
      fetchFiles()
      loadKategoriOptions()
    }
  }, [mounted, currentPage, pageSize, searchTerm, selectedKategori, selectedPegawaiId, sortBy, sortDir])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy,
        sortDir
      })
      
      // For ADMIN role, show all files; for others, filter by current user's ID
      if (user?.role?.roleName !== 'ADMIN') {
        params.append('pegawaiId', user?.id?.toString() || '')
      } else if (selectedPegawaiId) {
        // Admin can filter by specific pegawai
        params.append('pegawaiId', selectedPegawaiId)
      }
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedKategori) params.append('kategoriId', selectedKategori.toString())
      
      const endpoint = `api/admin/file-pegawai?${params.toString()}`
      
      const response = await fetch(getApiUrl(endpoint), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data file')
      }

      const data = await response.json()
      
      setFileList(data.content || [])
      setTotalElements(data.totalElements || 0)
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('Error fetching files:', error)
      showErrorToast('Gagal mengambil data file')
    } finally {
      setLoading(false)
    }
  }

  const loadKategoriOptions = async () => {
    try {
      const response = await fetch(getApiUrl('admin/master-data/file-kategori/active'), {
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
    }
  }

  const handleSort = (newSortBy: string, newSortDir: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortDir(newSortDir)
    setCurrentPage(0) // Reset to first page when sorting
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0) // Reset to first page when changing page size
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0) // Reset to first page when searching
  }

  const handleCreate = () => {
    router.push('/file-manager/buat')
  }
  
  const handleEdit = (file: FilePegawaiResponse) => {
    router.push(`/file-manager/${file.id}/edit`)
  }
  
  const handleViewDetail = (file: FilePegawaiResponse) => {
    router.push(`/file-manager/${file.id}`)
  }

  const handleDelete = (file: FilePegawaiResponse) => {
    setSelectedFile(file)
    setIsDeleteOpen(true)
  }

  const handleDownload = async (file: FilePegawaiResponse) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(getApiUrl(`api/files/download/documents/${file.fileName}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Gagal mengunduh file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = file.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      showSuccessToast('File berhasil diunduh')
    } catch (error) {
      console.error('Error downloading file:', error)
      showErrorToast('Gagal mengunduh file')
    }
  }

  const submitDelete = async () => {
    if (!selectedFile) return

    try {
      setLoading(true)
      // Find the file-pegawai group ID that contains this file
      // For now, we'll use the file ID directly and assume it maps to the group
      const response = await fetch(getApiUrl(`api/admin/file-pegawai/${selectedFile.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        showSuccessToast('File berhasil dihapus')
        setIsDeleteOpen(false)
        setSelectedFile(null)
        fetchFiles()
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.message || 'Gagal menghapus file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      showErrorToast('Gagal menghapus file')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-muted-foreground">Memuat halaman...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-background">
        <AdminPageHeader
          title="File Manager"
          description={user?.role?.roleName === 'ADMIN' ? "Kelola file pegawai" : "Kelola file pribadi Anda"}
          icon={FileText}
          primaryAction={{
            label: "Upload File",
            onClick: handleCreate,
            icon: Upload
          }}
          stats={[
            {
              label: "Total File",
              value: totalElements,
              variant: "secondary"
            }
          ]}
        />

        <div className="container mx-auto p-6 space-y-6">
          {/* Filters */}
          <AdminFilters
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            searchPlaceholder="Cari judul atau deskripsi file..."
            totalItems={totalElements}
            currentItems={fileList.length}
          />

          {/* Additional Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.role?.roleName === 'ADMIN' ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pilih Pegawai</label>
                    <PegawaiSearchDropdown
                      value={selectedPegawaiId}
                      onValueChange={(value) => {
                        setSelectedPegawaiId(value)
                        setCurrentPage(0)
                      }}
                      onPegawaiIdChange={(pegawaiId) => {
                        setSelectedPegawaiId(pegawaiId)
                        setCurrentPage(0)
                      }}
                      placeholder="Pilih pegawai atau kosongkan untuk semua"
                      includeAllOption={true}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pegawai</label>
                    <input 
                      type="text"
                      className="w-full p-2 border rounded-md bg-muted cursor-not-allowed"
                      value={user?.fullName || user?.username || 'Tidak diketahui'}
                      disabled
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter Kategori</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedKategori || ''}
                    onChange={(e) => {
                      setSelectedKategori(e.target.value ? Number(e.target.value) : null)
                      setCurrentPage(0)
                    }}
                  >
                    <option value="">Semua Kategori</option>
                    {kategoriOptions.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {user?.role?.roleName === 'ADMIN' ? 'File Pegawai' : 'File Saya'}
              </CardTitle>
              <CardDescription>
                {user?.role?.roleName === 'ADMIN' 
                  ? 'File yang telah diupload oleh pegawai'
                  : 'File yang sudah diupload oleh Anda'
                }
              </CardDescription>
            </CardHeader>
          
          <CardContent>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader
                        sortKey="judul"
                        currentSort={{ sortBy, sortDir }}
                        onSort={handleSort}
                      >
                        Judul File
                      </SortableHeader>
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        sortKey="kategoriNama"
                        currentSort={{ sortBy, sortDir }}
                        onSort={handleSort}
                      >
                        Kategori
                      </SortableHeader>
                    </TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>
                      <SortableHeader
                        sortKey="createdAt"
                        currentSort={{ sortBy, sortDir }}
                        onSort={handleSort}
                      >
                        Tanggal Upload
                      </SortableHeader>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : fileList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {searchTerm ? 'Tidak ada file yang ditemukan' : 'Belum ada file yang diupload'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    fileList.map((file: FilePegawaiResponse) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {file.judul || 'Tanpa Judul'}
                            </div>
                            {file.deskripsi && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {file.deskripsi}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.kategoriNama}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{file.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {file.fileType} • {formatFileSize(file.fileSize)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(file.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={file.isActive ? "default" : "secondary"}>
                            {file.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetail(file)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className="mr-2 h-4 w-4" />
                                Unduh
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(file)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(file)}
                                className="text-destructive"
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-border">
                  <ServerPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Hapus File"
            description={`Apakah Anda yakin ingin menghapus file "${selectedFile?.judul}" dengan kategori "${selectedFile?.kategoriNama}"? Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Hapus"
            cancelText="Batal"
            variant="destructive"
            onConfirm={submitDelete}
            loading={loading}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

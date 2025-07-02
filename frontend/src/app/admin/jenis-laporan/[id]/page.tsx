"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Edit, 
  Trash2,
  RefreshCw,
  FileText,
  Loader,
  Clock,
  User,
  Calendar
} from 'lucide-react';
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
import { jenisLaporanAPI, JenisLaporan } from '@/lib/api';

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'AKTIF':
      return 'bg-green-100 text-green-800';
    case 'TIDAK_AKTIF':
      return 'bg-red-100 text-red-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'AKTIF':
      return 'Aktif';
    case 'TIDAK_AKTIF':
      return 'Tidak Aktif';
    case 'DRAFT':
      return 'Draft';
    default:
      return status;
  }
};

export default function JenisLaporanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadJenisLaporan = async () => {
      try {
        setLoading(true);
        const data = await jenisLaporanAPI.getById(parseInt(id));
        setJenisLaporan(data);
      } catch (error) {
        console.error('Error loading jenis laporan:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data jenis laporan",
          variant: "destructive",
        });
        router.push('/admin/jenis-laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJenisLaporan();
    }
  }, [id, router]);

  // Navigation functions
  const handleBack = () => {
    router.push('/admin/jenis-laporan');
  };

  const handleEdit = () => {
    router.push(`/admin/jenis-laporan/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!jenisLaporan) return;

    try {
      await jenisLaporanAPI.delete(jenisLaporan.jenisLaporanId);
      toast({
        title: "Sukses",
        description: "Jenis laporan berhasil dihapus",
      });
      router.push('/admin/jenis-laporan');
    } catch (error: any) {
      console.error('Error deleting jenis laporan:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus jenis laporan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat data jenis laporan...</p>
        </div>
      </div>
    );
  }

  if (!jenisLaporan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Jenis laporan tidak ditemukan</p>
          <Button onClick={handleBack} className="mt-4">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{jenisLaporan.nama}</h1>
              <p className="text-muted-foreground">
                Detail informasi jenis laporan dan tahapan-tahapannya
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nama Jenis Laporan</Label>
                  <p className="mt-1 text-lg font-semibold">{jenisLaporan.nama}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(jenisLaporan.status)} text-sm px-3 py-1`}>
                      {getStatusDisplay(jenisLaporan.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Deskripsi</Label>
                <p className="mt-1 text-gray-800 leading-relaxed">{jenisLaporan.deskripsi}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</Label>
                    <p className="text-sm font-medium">
                      {new Date(jenisLaporan.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</Label>
                    <p className="text-sm font-medium">
                      {new Date(jenisLaporan.updatedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Jumlah Tahapan</Label>
                    <p className="text-sm font-medium">
                      {jenisLaporan.tahapanList?.length || 0} tahapan
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tahapan Laporan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Tahapan Laporan ({jenisLaporan.tahapanList?.length || 0} tahapan)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jenisLaporan.tahapanList && jenisLaporan.tahapanList.length > 0 ? (
                <div className="space-y-6">
                  {/* Timeline View */}
                  <div className="relative">
                    {jenisLaporan.tahapanList
                      .sort((a, b) => (a.urutanTahapan || 0) - (b.urutanTahapan || 0))
                      .map((tahapan, index) => (
                        <div key={tahapan.tahapanLaporanId} className="relative">
                          {/* Connecting Line */}
                          {index < jenisLaporan.tahapanList!.length - 1 && (
                            <div className="absolute left-8 top-16 w-0.5 h-24 bg-blue-200"></div>
                          )}
                          
                          {/* Step Content */}
                          <div className="flex items-start gap-6 mb-8">
                            {/* Step Number */}
                            <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                              {tahapan.urutanTahapan}
                            </div>
                            
                            {/* Step Details */}
                            <Card className="flex-1 border-l-4 border-l-blue-500">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                      {tahapan.nama}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                      {tahapan.deskripsi}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="ml-4">
                                    ID: {tahapan.tahapanLaporanId}
                                  </Badge>
                                </div>

                                {/* File Types */}
                                {tahapan.jenisFileIzin && tahapan.jenisFileIzin.length > 0 && (
                                  <div className="mb-4">
                                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                      Tipe File yang Diizinkan:
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {tahapan.jenisFileIzin.map((type: string, typeIndex: number) => (
                                        <Badge key={typeIndex} variant="secondary" className="text-xs">
                                          {type.toUpperCase()}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Template */}
                                {tahapan.templateTahapan && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <Label className="text-sm font-medium text-blue-800 mb-1 block">
                                      Template Tersedia:
                                    </Label>
                                    <p className="text-sm text-blue-700">
                                      📄 {tahapan.templateTahapan}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Tidak ada tahapan</p>
                  <p className="text-sm">Jenis laporan ini belum memiliki tahapan yang ditentukan</p>
                  <Button onClick={handleEdit} className="mt-4">
                    Tambah Tahapan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Jenis laporan "{jenisLaporan.nama}" 
                dan semua tahapannya akan dihapus secara permanen dari sistem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Ya, Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

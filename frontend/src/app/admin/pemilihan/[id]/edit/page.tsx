"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast-simple";
import { pemilihanApi, PemilihanDTO, CreatePemilihanRequest } from "@/lib/pemilihan-api";

export default function EditPemilihanPage() {
  const params = useParams();
  const router = useRouter();
  const [pemilihan, setPemilihan] = useState<PemilihanDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const id = params?.id as string;

  // Form data
  const [formData, setFormData] = useState<CreatePemilihanRequest>({
    judulPemilihan: '',
    deskripsi: '',
    status: 'AKTIF',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    templateLayout: '3',
    jumlahPosisi: 3,
    detailPemilihan: []
  });

  useEffect(() => {
    if (id) {
      loadPemilihan();
    }
  }, [id]);

  const loadPemilihan = async () => {
    setLoading(true);
    try {
      const response = await pemilihanApi.getById(parseInt(id));
      const data = response.data;
      setPemilihan(data);
      
      // Populate form data
      setFormData({
        judulPemilihan: data.judulPemilihan || '',
        deskripsi: data.deskripsi || '',
        status: data.status || 'AKTIF',
        provinsi: data.provinsi || '',
        kota: data.kota || '',
        kecamatan: data.kecamatan || '',
        kelurahan: data.kelurahan || '',
        templateLayout: data.templateLayout || '3',
        jumlahPosisi: data.jumlahPosisi || 3,
        detailPemilihan: data.detailPemilihan || []
      });
    } catch (error: any) {
      console.error("Error loading pemilihan:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data pemilihan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.judulPemilihan.trim() || !formData.provinsi.trim() || !formData.kota.trim()) {
      toast({
        title: "Error",
        description: "Nama pemilihan, provinsi, dan kota harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await pemilihanApi.update(parseInt(id), formData);
      
      toast({
        title: "Sukses",
        description: "Pemilihan berhasil diupdate",
      });
      
      router.push('/admin/pemilihan');
    } catch (error: any) {
      console.error('Error updating pemilihan:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengupdate pemilihan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/pemilihan');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (!pemilihan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pemilihan tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Data pemilihan yang Anda cari tidak dapat ditemukan.</p>
          <Button onClick={() => router.push('/admin/pemilihan')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Pemilihan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Pemilihan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ubah informasi pemilihan alumni
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="judulPemilihan">Nama Pemilihan *</Label>
              <Input
                id="judulPemilihan"
                value={formData.judulPemilihan}
                onChange={(e) => setFormData({ ...formData, judulPemilihan: e.target.value })}
                placeholder="Masukkan nama pemilihan"
                className="h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Masukkan deskripsi pemilihan"
                rows={5}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateLayout">Template Layout</Label>
                <Select 
                  value={formData.templateLayout} 
                  onValueChange={(value) => 
                    setFormData({ ...formData, templateLayout: value, jumlahPosisi: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Pilih layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 per baris</SelectItem>
                    <SelectItem value="2">2 per baris</SelectItem>
                    <SelectItem value="3">3 per baris</SelectItem>
                    <SelectItem value="4">4 per baris</SelectItem>
                    <SelectItem value="5">5 per baris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jumlahPosisi">Jumlah Posisi</Label>
                <Input
                  id="jumlahPosisi"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.jumlahPosisi}
                  onChange={(e) => setFormData({ ...formData, jumlahPosisi: parseInt(e.target.value) || 1 })}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Wilayah */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Wilayah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provinsi">Provinsi *</Label>
                <Input
                  id="provinsi"
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  placeholder="Contoh: DKI Jakarta"
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kota">Kota/Kabupaten *</Label>
                <Input
                  id="kota"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan"
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kecamatan">Kecamatan (Opsional)</Label>
                <Input
                  id="kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  placeholder="Contoh: Kebayoran Baru"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kelurahan">Kelurahan (Opsional)</Label>
                <Input
                  id="kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  placeholder="Contoh: Senayan"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Pemilihan (Read-only for now) */}
        {formData.detailPemilihan && formData.detailPemilihan.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Laporan dalam Pemilihan ({formData.detailPemilihan.length})</CardTitle>
              <p className="text-sm text-gray-600">
                Detail laporan dapat diubah melalui wizard create pemilihan
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.detailPemilihan.map((detail, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {detail.namaCandidat}
                          </h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            #{detail.urutanTampil}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600">
                          {detail.jenisLaporan || "Tanpa jenis"}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Posisi: {detail.posisiLayout}</span>
                          <span className="text-gray-500">{detail.status}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Batal
              </Button>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

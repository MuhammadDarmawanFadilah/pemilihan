'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { 
  ArrowLeft, ArrowRight, Save, User, MapPin, 
  CheckCircle2, Camera, Upload, UserCircle, CheckCircle,
  Eye, EyeOff
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Form } from "@/components/ui/form"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { showErrorToast, showSuccessToast } from "@/components/ui/toast-utils"
import { useAuth } from "@/contexts/AuthContext"
import { getApiUrl } from "@/lib/config"
import ProtectedRoute from "@/components/ProtectedRoute"
import WilayahForm from "@/components/WilayahForm"
import MapLocationPicker from "@/components/MapLocationPicker"
import PhotoUpload from "@/components/PhotoUpload"
import { EducationSearchDropdown } from "@/components/EducationSearchDropdown"
import { JabatanSearchDropdown } from "@/components/JabatanSearchDropdown"

// Stepper configuration
const STEPS = [
  {
    id: 'personal',
    title: 'Data Pribadi',
    description: 'Informasi akun dan pribadi',
    icon: User,
  },
  {
    id: 'location',
    title: 'Lokasi & Alamat',
    description: 'Informasi tempat tinggal',
    icon: MapPin,
  },
  {
    id: 'review',
    title: 'Review & Konfirmasi',
    description: 'Tinjau data sebelum menyimpan',
    icon: CheckCircle2,
  }
]

interface Pegawai {
  id: number
  username: string
  email: string
  fullName: string
  phoneNumber: string
  nip?: string
  pendidikan?: string
  role: string
  jabatan?: string
  namaJabatan?: string
  status: string
  alamat?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  kodePos?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PegawaiFormData {
  username: string
  password: string
  fullName: string
  email: string
  phoneNumber: string
  nip: string
  pendidikan: string
  jabatan: string
  alamat?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  kodePos?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
}

// Stepper Component
function StepperComponent({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = STEPS;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
              ${index <= currentStep 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-muted text-muted-foreground border-border'
              }
            `}>
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <div className={`ml-3 text-left ${index <= currentStep ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                index < currentStep ? 'bg-blue-600' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-3" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Langkah {currentStep + 1} dari {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function EditPegawaiPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [pegawai, setPegawai] = useState<Pegawai | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<PegawaiFormData>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    nip: '',
    pendidikan: '',
    jabatan: '',
    alamat: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    kodePos: '',
    latitude: undefined,
    longitude: undefined,
    photoUrl: ''
  })

  // Location form for WilayahForm component
  const locationForm = useForm({
    defaultValues: {
      provinsi: '',
      kota: '',
      kecamatan: '',
      kelurahan: '',
      kodePos: ''
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user?.id) {
      loadPegawaiData()
    } else if (mounted && !user?.id) {
      showErrorToast('Silakan login terlebih dahulu')
      router.push('/login')
    }
  }, [mounted, user?.id])

  const loadPegawaiData = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl(`api/pegawai/${user?.id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPegawai(data)
        
        // Map the API response to form data correctly
        const mappedData: PegawaiFormData = {
          username: data.username || '',
          password: '', // Always empty for security
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          nip: data.nip || '',
          pendidikan: data.pendidikan || '',
          jabatan: data.jabatan || '',
          alamat: data.alamat || '',
          provinsi: data.provinsi || '',
          kota: data.kota || '',
          kecamatan: data.kecamatan || '',
          kelurahan: data.kelurahan || '',
          kodePos: data.kodePos || '',
          latitude: data.latitude,
          longitude: data.longitude,
          photoUrl: data.photoUrl || ''
        }
        
        setFormData(mappedData)

        // Also set the location form values
        locationForm.setValue('provinsi', data.provinsi || '')
        locationForm.setValue('kota', data.kota || '')
        locationForm.setValue('kecamatan', data.kecamatan || '')
        locationForm.setValue('kelurahan', data.kelurahan || '')
        locationForm.setValue('kodePos', data.kodePos || '')

      } else {
        showErrorToast('Gagal memuat data pegawai')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading pegawai data:', error)
      showErrorToast('Gagal memuat data pegawai')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep)
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    console.log('handlePrevious called, currentStep:', currentStep)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called, currentStep:', currentStep)
    e.preventDefault()
    
    if (!user?.id) {
      showErrorToast('User tidak ditemukan')
      return
    }

    try {
      setSaving(true)
      
      // Sync location form data with main form data
      const locationValues = locationForm.getValues()
      
      const submitData = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        nip: formData.nip,
        pendidikan: formData.pendidikan || null,
        jabatan: formData.jabatan || null,
        alamat: formData.alamat || null,
        provinsi: locationValues.provinsi || null,
        kota: locationValues.kota || null,
        kecamatan: locationValues.kecamatan || null,
        kelurahan: locationValues.kelurahan || null,
        kodePos: locationValues.kodePos || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        photoUrl: formData.photoUrl || null,
        // Only include password if it's provided
        ...(formData.password && { password: formData.password })
      }

      const response = await fetch(getApiUrl(`api/pegawai/${user.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        showSuccessToast('Data pegawai berhasil diperbarui')
        router.push('/')
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.message || 'Gagal memperbarui data pegawai')
      }
    } catch (error) {
      console.error('Error updating pegawai:', error)
      showErrorToast('Gagal memperbarui data pegawai')
    } finally {
      setSaving(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Data Pribadi
              </CardTitle>
              <CardDescription>
                Perbarui informasi akun dan data pribadi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload - Centered */}
              <div className="flex justify-center mb-8">
                <PhotoUpload
                  value={formData.photoUrl || ''}
                  onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nip">NIK *</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => {
                    const nikValue = e.target.value;
                    setFormData({ 
                      ...formData, 
                      nip: nikValue,
                      // Auto-fill username with NIK value if username is empty or same as previous NIK
                      username: !formData.username || formData.username === formData.nip ? nikValue : formData.username
                    });
                  }}
                  placeholder="Masukkan NIK"
                  className="h-12"
                />
                <p className="text-sm text-muted-foreground">
                  NIK akan otomatis mengisi username, namun username bisa diubah manual
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="h-12"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Masukkan username"
                    className="h-12"
                  />
                  <p className="text-sm text-muted-foreground">
                    Username otomatis terisi dari NIK, dapat diubah manual
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password (kosongkan jika tidak diubah)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Kosongkan jika tidak diubah"
                      className="h-12 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Masukkan email"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">No HP/WA *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Masukkan nomor HP/WA"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pendidikan">Pendidikan *</Label>
                  <EducationSearchDropdown
                    value={formData.pendidikan}
                    onValueChange={(value) => setFormData({ ...formData, pendidikan: value })}
                    placeholder="Pilih pendidikan terakhir"
                  />
                  <p className="text-sm text-muted-foreground">
                    Pilih jenjang pendidikan terakhir yang ditempuh
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan *</Label>
                  <JabatanSearchDropdown
                    value={formData.jabatan}
                    onValueChange={(value) => setFormData({ ...formData, jabatan: value })}
                    placeholder="Pilih jabatan"
                  />
                  <p className="text-sm text-muted-foreground">
                    Pilih jabatan sesuai dengan posisi di organisasi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Edit Lokasi & Alamat
              </CardTitle>
              <CardDescription>
                Perbarui informasi lokasi dan alamat (opsional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alamat Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Masukkan alamat lengkap (nama jalan, nomor rumah, RT/RW, dll.)"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Contoh: Jl. Merdeka No. 123, RT 001 RW 005, Perumahan Indah Blok A
                </p>
              </div>

              {/* Wilayah Form */}
              <div className="space-y-6">
                <Form {...locationForm}>
                  <div>
                    <WilayahForm 
                      control={locationForm.control}
                      setValue={locationForm.setValue}
                      watch={locationForm.watch}
                      onDataLoad={() => {
                        console.log('WilayahForm data loaded in PegawaiForm');
                        // Sync with main form data
                        const values = locationForm.getValues();
                        setFormData({
                          ...formData,
                          provinsi: values.provinsi,
                          kota: values.kota,
                          kecamatan: values.kecamatan,
                          kelurahan: values.kelurahan,
                          kodePos: values.kodePos
                        });
                      }}
                    />
                  </div>
                </Form>
              </div>

              {/* Map Location Picker */}
              <MapLocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => {
                  setFormData({
                    ...formData,
                    latitude: lat ?? undefined,
                    longitude: lng ?? undefined
                  });
                }}
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Review & Konfirmasi
              </CardTitle>
              <CardDescription>
                Tinjau semua informasi sebelum menyimpan perubahan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Pribadi Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">NIK</Label>
                    <p className="text-foreground font-semibold mt-1">{formData.nip}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                    <p className="text-foreground font-semibold mt-1">{formData.fullName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                    <p className="text-foreground font-semibold mt-1">{formData.username}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-foreground font-semibold mt-1">{formData.email}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">No HP/WA</Label>
                    <p className="text-foreground font-semibold mt-1">{formData.phoneNumber}</p>
                  </div>
                  {formData.pendidikan && (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Pendidikan</Label>
                      <p className="text-foreground font-semibold mt-1">{formData.pendidikan}</p>
                    </div>
                  )}
                  {formData.jabatan && (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Jabatan</Label>
                      <p className="text-foreground font-semibold mt-1">{formData.jabatan}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alamat Summary */}
              {(formData.alamat || locationForm.getValues().provinsi) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Lokasi & Alamat</h3>
                  <div className="space-y-3">
                    {formData.alamat && (
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</Label>
                        <p className="text-foreground mt-1">{formData.alamat}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(locationForm.getValues()).map(([key, value]) => {
                        if (!value) return null;
                        const labels: Record<string, string> = {
                          provinsi: 'Provinsi',
                          kota: 'Kota/Kabupaten', 
                          kecamatan: 'Kecamatan',
                          kelurahan: 'Kelurahan',
                          kodePos: 'Kode Pos'
                        };
                        return (
                          <div key={key} className="p-4 bg-muted rounded-lg">
                            <Label className="text-sm font-medium text-muted-foreground">{labels[key]}</Label>
                            <p className="text-foreground font-semibold mt-1">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                    {(formData.latitude && formData.longitude) && (
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Koordinat</Label>
                        <p className="text-foreground font-semibold mt-1">
                          {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-muted-foreground">Memuat data pegawai...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <User className="h-6 w-6" />
                Edit Profil Pegawai
              </h1>
              <p className="text-muted-foreground">
                Perbarui informasi profil Anda
              </p>
            </div>
          </div>

          {/* Stepper */}
          <StepperComponent currentStep={currentStep} totalSteps={STEPS.length} />

          {/* Form Content */}
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep !== STEPS.length - 1) {
                e.preventDefault()
                console.log('Enter key prevented on step:', currentStep)
              }
            }}
            noValidate
            className="space-y-6"
          >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handlePrevious()
                }}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Sebelumnya
              </Button>

              <div className="flex gap-4">
                {currentStep === STEPS.length - 1 ? (
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNext()
                    }}
                    className="flex items-center gap-2"
                  >
                    Selanjutnya
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

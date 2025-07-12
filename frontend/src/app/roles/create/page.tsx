"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/config";
import { 
  Shield, 
  ArrowLeft, 
  Save, 
  Plus,
  CheckSquare,
  Square,
  Users,
  Lock,
  Settings
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

interface RoleRequest {
  roleName: string;
  description: string;
  permissions: string[];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RoleRequest>({
    roleName: "",
    description: "",
    permissions: []
  });
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailablePermissions();
  }, []);

  const fetchAvailablePermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await fetch(getApiUrl('/api/roles/permissions'));
      if (response.ok) {
        const data = await response.json();
        setAvailablePermissions(data);
        
        // Auto-check Public and Menu Pegawai permissions
        const autoCheckedPermissions = data.filter((permission: string) => {
          // Public permissions (always accessible)
          if (permission.includes('home') || permission.includes('berita.read')) {
            return true;
          }
          // Basic Menu Pegawai permissions for authenticated users
          if (permission.includes('file-manager') || permission.includes('laporan-saya') || 
              permission.includes('pegawai.read') || permission.includes('documents.read')) {
            return true;
          }
          return false;
        });
        
        setFormData(prev => ({
          ...prev,
          permissions: autoCheckedPermissions
        }));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar permissions",
        variant: "destructive",
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/roles'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Role berhasil dibuat",
        });
        router.push('/roles');
      } else {
        const errorText = await response.text();
        toast({
          title: "Error",
          description: errorText || "Gagal membuat role",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  const toggleAllPermissions = () => {
    if (formData.permissions.length === availablePermissions.length) {
      // Unselect all
      setFormData(prev => ({ ...prev, permissions: [] }));
    } else {
      // Select all
      setFormData(prev => ({ ...prev, permissions: [...availablePermissions] }));
    }
  };

  const groupPermissions = (permissions: string[]) => {
    const groups: { [key: string]: string[] } = {
      'Menu Pegawai': [],
      'Administrasi Pegawai': [],
      'Administrasi Pemilihan': [],
      'Master Data': [],
      'Other': []
    };
    
    permissions.forEach(permission => {
      // Menu Pegawai permissions (for authenticated users)
      if (permission.includes('laporan-pengawas') || permission.includes('laporan-saya') || 
          permission.includes('file-manager') || permission.includes('home.access') ||
          permission.includes('dashboard.view')) {
        groups['Menu Pegawai'].push(permission);
      } 
      // Administrasi Pegawai permissions - exact match with sidebar order
      else if (permission.includes('pegawai.') || permission.includes('lokasi-pegawai.') || 
               permission.includes('roles.') || permission.includes('file-pegawai.')) {
        groups['Administrasi Pegawai'].push(permission);
      }
      // Administrasi Pemilihan permissions  
      else if (permission.includes('pemilihan.') || permission.includes('laporan.') ||
               permission.includes('jenis-laporan.') || permission.includes('lokasi-pemilihan.')) {
        groups['Administrasi Pemilihan'].push(permission);
      } 
      // Master Data permissions - exact match with sidebar order
      else if (permission.includes('kategori-file.') || permission.includes('jabatan.') ||
               permission.includes('wilayah-provinsi.') || permission.includes('wilayah-kota.') ||
               permission.includes('wilayah-kecamatan.') || permission.includes('wilayah-kelurahan.')) {
        groups['Master Data'].push(permission);
      } 
      // Everything else
      else {
        groups['Other'].push(permission);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  // Sort permissions within each group to match sidebar order
  const sortPermissions = (permissions: string[], group: string) => {
    if (group === 'Menu Pegawai') {
      const order = ['laporan-pengawas', 'laporan-saya', 'file-manager'];
      return permissions.sort((a, b) => {
        const aIndex = order.findIndex(o => a.includes(o));
        const bIndex = order.findIndex(o => b.includes(o));
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    if (group === 'Administrasi Pegawai') {
      const order = ['pegawai', 'lokasi-pegawai', 'roles', 'file-pegawai'];
      return permissions.sort((a, b) => {
        const aIndex = order.findIndex(o => a.includes(o));
        const bIndex = order.findIndex(o => b.includes(o));
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    if (group === 'Administrasi Pemilihan') {
      const order = ['pemilihan', 'laporan', 'jenis-laporan', 'lokasi-pemilihan'];
      return permissions.sort((a, b) => {
        const aIndex = order.findIndex(o => a.includes(o));
        const bIndex = order.findIndex(o => b.includes(o));
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    if (group === 'Master Data') {
      const order = ['kategori-file', 'jabatan', 'wilayah-provinsi', 'wilayah-kota', 'wilayah-kecamatan', 'wilayah-kelurahan'];
      return permissions.sort((a, b) => {
        const aIndex = order.findIndex(o => a.includes(o));
        const bIndex = order.findIndex(o => b.includes(o));
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    return permissions.sort();
  };

  const formatPermissionName = (permission: string) => {
    return permission
      .replace(/[_-]/g, ' ')
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' > ');
  };

  const groupedPermissions = groupPermissions(availablePermissions);

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header dengan navigasi yang clean */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/roles">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    Buat Role Baru
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Tambah role sistem dengan permissions yang sesuai</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Lock className="h-3 w-3 mr-1" />
                  {formData.permissions.length} permissions
                </Badge>
                <Button 
                  onClick={() => {
                    const form = document.getElementById('role-form') as HTMLFormElement;
                    form?.requestSubmit();
                  }}
                  disabled={loading || !formData.roleName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Simpan Role
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content area yang lebih compact */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Informasi Role
                  </CardTitle>
                  <CardDescription>
                    Atur detail dasar untuk role baru
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName" className="text-sm font-medium">
                        Nama Role <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="roleName"
                        value={formData.roleName}
                        onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value.toUpperCase() }))}
                        placeholder="contoh: ADMIN, MODERATOR"
                        className="uppercase"
                        required
                      />
                      <p className="text-xs text-gray-500">Nama role akan otomatis dalam huruf kapital</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Jelaskan fungsi dan tanggung jawab role ini..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Permissions</span>
                          <span className="font-medium">{availablePermissions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dipilih</span>
                          <span className="font-medium text-blue-600">{formData.permissions.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${availablePermissions.length ? (formData.permissions.length / availablePermissions.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="hidden">Submit</button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Permissions Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Kelola Permissions
                      </CardTitle>
                      <CardDescription>
                        Pilih hak akses yang akan diberikan untuk role ini
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant={formData.permissions.length === availablePermissions.length ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAllPermissions}
                      className="flex items-center gap-2"
                    >
                      {formData.permissions.length === availablePermissions.length ? (
                        <>
                          <CheckSquare className="h-4 w-4" />
                          Hapus Semua
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4" />
                          Pilih Semua
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {permissionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(groupedPermissions).map(([group, permissions]) => (
                        <div key={group} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                group === 'Menu Pegawai' ? 'bg-blue-500' :
                                group === 'Administrasi Pegawai' ? 'bg-red-500' :
                                group === 'Administrasi Pemilihan' ? 'bg-orange-500' :
                                group === 'Master Data' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}></div>
                              {group}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`group-${group}`}
                                checked={permissions.every(p => formData.permissions.includes(p))}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    // Add all permissions in this group
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: [...new Set([...prev.permissions, ...permissions])]
                                    }));
                                  } else {
                                    // Remove all permissions in this group
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => !permissions.includes(p))
                                    }));
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <Label
                                htmlFor={`group-${group}`}
                                className="text-xs cursor-pointer"
                              >
                                Semua
                              </Label>
                              <Badge variant="secondary" className="text-xs">
                                {permissions.filter(p => formData.permissions.includes(p)).length}/{permissions.length}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {sortPermissions(permissions, group).map((permission) => (
                              <div key={permission} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <Checkbox
                                  id={permission}
                                  checked={formData.permissions.includes(permission)}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(permission, checked as boolean)
                                  }
                                  className="mt-0.5"
                                />
                                <Label
                                  htmlFor={permission}
                                  className="text-xs font-normal cursor-pointer flex-1 leading-relaxed"
                                >
                                  {formatPermissionName(permission)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

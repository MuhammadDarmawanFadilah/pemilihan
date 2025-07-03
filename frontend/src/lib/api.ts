// API service untuk backend Java Spring Boot
import { config } from './config';

const API_BASE_URL = config.apiUrl;

// Clean API helper function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });

    if (!response.ok) {
      // Handle different error types
      if (response.status === 401) {
        // Token expired or invalid
        const errorData = await response.json().catch(() => ({ error: 'Unauthorized' }));
        
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Trigger logout by dispatching custom event
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        
        throw new Error(errorData.error || 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali.');
      } else {
        // Other errors
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${errorText}`;
        
        // Try to parse JSON error response
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Keep original error text if not JSON
        }
        
        throw new Error(errorMessage);
      }
    }

    // Handle empty responses (like DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }

    // For non-JSON responses, return null
    return null as T;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

// User API functions - Simple and Easy
export const userAPI = {
  // Get all users
  getAllUsers: (): Promise<User[]> => apiCall<User[]>('/users'),
  
  // Get user by ID
  getUserById: (id: number): Promise<User> => apiCall<User>(`/users/${id}`),
  
  // Get user by username
  getUserByUsername: (username: string): Promise<User> => apiCall<User>(`/users/username/${username}`),

  // Check if username exists
  checkUsernameExists: (username: string): Promise<boolean> => apiCall<boolean>(`/users/exists/username/${username}`),  
  // Check if email exists
  checkEmailExists: (email: string): Promise<boolean> => apiCall<boolean>(`/users/exists/email/${email}`),
  // Check if phone number exists
  checkPhoneExists: (phone: string): Promise<boolean> => apiCall<boolean>(`/users/exists/phone/${encodeURIComponent(phone)}`),
  
  // Reset password
  resetPassword: (id: number, currentPassword: string, newPassword: string): Promise<{ message: string; user: User }> =>
    apiCall<{ message: string; user: User }>(`/users/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};



// Biografi interfaces
export interface WorkExperience {
  id?: number;
  posisi: string;
  perusahaan: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  deskripsi?: string;
  masihBekerja?: boolean;
}

export interface Biografi {
  biografiId: number;
  namaLengkap: string;
  nim: string;
  alumniTahun: string;
  email: string;
  nomorHp?: string;
  nomorWa?: string;
  fotoProfil?: string;
  jurusan?: string;
  tanggalLulus?: string;
  ipk?: string;
  nomorTelepon?: string;
  tanggalLahir?: string;
  tempatLahir?: string;
  jenisKelamin?: string;
  agama?: string;
  foto?: string;
  programStudi?: string;
  pendidikanLanjutan?: string;
  posisiJabatan?: string;
  workExperiences?: WorkExperience[];
  academicRecords?: AcademicRecord[];
  tanggalMasukKerja?: string;
  tanggalKeluarKerja?: string;  pekerjaanSaatIni?: string;
  perusahaanSaatIni?: string;  alamat?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  kodePos?: string;
  latitude?: number;
  longitude?: number;
  // Location names for display
  provinsiNama?: string;
  kotaNama?: string;
  kecamatanNama?: string;
  kelurahanNama?: string;
  achievements?: Achievement[];
  spesialisasiKedokteran?: SpesialisasiKedokteran[];
  prestasi?: string;
  hobi?: string;  instagram?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  catatan?: string;
  status: BiografiStatus;
  createdAt: string;
  updatedAt: string;
}

export type BiografiStatus = 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';

export interface AcademicRecord {
  jenjangPendidikan: string;
  universitas: string;
  programStudi: string;
  ipk: string;
  tanggalLulus: string;
}

export interface Achievement {
  judul: string;
  penyelenggara: string;
  tahun: string;
  deskripsi: string;
}

export interface SpesialisasiKedokteran {
  spesialisasi: string;
  lokasiPenempatan: string;
  tanggalMulai: string;
  tanggalAkhir?: string;
  masihBekerja: boolean;
}

export interface BiografiRequest {
  // Mandatory fields
  namaLengkap: string;
  alumniTahun: string;
  email: string;
  nomorTelepon: string;
    // Optional fields
  nim?: string;
  tanggalLahir?: string;
  tempatLahir?: string;
  jenisKelamin?: string;
  agama?: string;  posisiJabatan?: string;
  role?: string;  workExperiences?: WorkExperience[];
  academicRecords?: AcademicRecord[];
  achievements?: Achievement[];
  spesialisasiKedokteran?: SpesialisasiKedokteran[];  tanggalMasukKerja?: string;
  tanggalKeluarKerja?: string;
  alamat?: string;
  provinsi?: string;
  kota?: string;  kecamatan?: string;
  kelurahan?: string;
  kodePos?: string;
  latitude?: number | null;
  longitude?: number | null;
  prestasi?: string;hobi?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  catatan?: string;
  foto?: string;
  status?: BiografiStatus;
}

export interface BiografiFilterRequest {
  nama?: string;
  nim?: string;
  email?: string;
  jurusan?: string;
  pekerjaan?: string;
  programStudi?: string;
  alumniTahun?: string;
  spesialisasi?: string; // Renamed from posisiJabatan
  nomorTelepon?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  provinsi?: string;
  status?: BiografiStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BiografiStats {
  total: number;
  aktif: number;
  tidakAktif: number;
  draft: number;
}

// Biografi API functions
export const biografiAPI = {
  // Get all biografi with pagination
  getAllBiografi: (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc'): Promise<PagedResponse<Biografi>> =>
    apiCall<PagedResponse<Biografi>>(`/biografi?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`),

  // Get biografi with filters
  getBiografiWithFilters: (filters: BiografiFilterRequest): Promise<PagedResponse<Biografi>> =>
    apiCall<PagedResponse<Biografi>>('/biografi/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),

  // Get biografi by ID
  getBiografiById: (id: number): Promise<Biografi> =>
    apiCall<Biografi>(`/biografi/${id}`),

  // Get biografi for editing with location details
  getBiografiForEdit: (id: number): Promise<Biografi> =>
    apiCall<Biografi>(`/biografi/${id}/edit`),

  // Get biografi by NIM
  getBiografiByNim: (nim: string): Promise<Biografi> =>
    apiCall<Biografi>(`/biografi/nim/${nim}`),

  // Get current user's biografi
  getMyBiografi: (): Promise<Biografi> =>
    apiCall<Biografi>('/biografi/my-biografi'),  // Create new biografi
  createBiografi: (biografi: BiografiRequest): Promise<Biografi> =>
    apiCall<Biografi>('/biografi', {
      method: 'POST',
      body: JSON.stringify(biografi),
    }),

  // Update biografi
  updateBiografi: (id: number, biografi: BiografiRequest): Promise<Biografi> =>
    apiCall<Biografi>(`/biografi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(biografi),
    }),  // Update biografi status
  updateBiografiStatus: async (id: number, status: BiografiStatus): Promise<Biografi> => {
    console.log(`Updating biografi ${id} status to ${status}`);
    
    // First, get the current biografi data
    const currentBiografi = await apiCall<Biografi>(`/biografi/${id}`, {
      method: 'GET',
    });
    
    // Create minimal update request with only status change
    const updateRequest = {
      // Required fields from the current biografi
      namaLengkap: currentBiografi.namaLengkap,
      nim: currentBiografi.nim,
      alumniTahun: currentBiografi.alumniTahun,
      email: currentBiografi.email,
      nomorTelepon: currentBiografi.nomorTelepon,
      tanggalLahir: currentBiografi.tanggalLahir,
      tempatLahir: currentBiografi.tempatLahir,
      jenisKelamin: currentBiografi.jenisKelamin,
      agama: currentBiografi.agama,
      programStudi: currentBiografi.programStudi,
      // Update only the status
      status: status,
      // Optional fields
      jurusan: currentBiografi.jurusan,
      tanggalLulus: currentBiografi.tanggalLulus,
      ipk: currentBiografi.ipk,
      fotoProfil: currentBiografi.fotoProfil,
    };
    
    console.log(`Sending status update request for biografi ${id}:`, updateRequest);
    
    try {
      const result = await apiCall<Biografi>(`/biografi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateRequest),
      });
      
      console.log(`Successfully updated biografi ${id} status to ${status}`);
      return result;
    } catch (error) {
      console.error(`Failed to update biografi ${id} status:`, error);
      throw error;
    }
  },

  // Delete biografi (soft delete)
  deleteBiografi: (id: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/biografi/${id}`, {
      method: 'DELETE',
    }),

  // Hard delete biografi
  hardDeleteBiografi: (id: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/biografi/${id}/permanent`, {
      method: 'DELETE',
    }),

  // Search biografi by name
  searchBiografiByName: (nama: string, page = 0, size = 10): Promise<PagedResponse<Biografi>> =>
    apiCall<PagedResponse<Biografi>>(`/biografi/search/name?nama=${encodeURIComponent(nama)}&page=${page}&size=${size}`),

  // Get biografi by exact name match (for comment author lookup)
  getBiografiByName: (nama: string): Promise<Biografi> =>
    apiCall<Biografi>(`/biografi/author/${encodeURIComponent(nama)}`),
  // Get biografi by status
  getBiografiByStatus: (status: BiografiStatus, page = 0, size = 10): Promise<PagedResponse<Biografi>> =>
    apiCall<PagedResponse<Biografi>>(`/biografi/status/${status}?page=${page}&size=${size}`),

  // Get distinct location values for dropdown filters
  getDistinctProvinsi: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/provinsi'),

  getDistinctKota: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/kota'),

  getDistinctKecamatan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/kecamatan'),
  getDistinctKelurahan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/kelurahan'),

  // Get distinct values for dropdown filters
  getDistinctJurusan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/jurusan'),

  getDistinctPekerjaan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/pekerjaan'),

  getDistinctSpesialisasi: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/spesialisasi'),

  getDistinctAlumniTahun: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/alumni-tahun'),

  // Get location mappings (name to code) for filter handling
  getProvinsiMappings: (): Promise<Record<string, string>> =>
    apiCall<Record<string, string>>('/biografi/filters/location-mappings/provinsi'),

  getKotaMappings: (): Promise<Record<string, string>> =>
    apiCall<Record<string, string>>('/biografi/filters/location-mappings/kota'),

  getKecamatanMappings: (): Promise<Record<string, string>> =>
    apiCall<Record<string, string>>('/biografi/filters/location-mappings/kecamatan'),

  getKelurahanMappings: (): Promise<Record<string, string>> =>
    apiCall<Record<string, string>>('/biografi/filters/location-mappings/kelurahan'),
};

// Image API functions
export const imageAPI = {
  // Upload image
  uploadImage: async (file: File): Promise<{success: string, filename: string, url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        // Don't set Content-Type header - let browser set it with boundary
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
  // Get image URL
  getImageUrl: (filename: string): string => {
    if (!filename) return '';
    
    // If filename already contains the full URL, return as is
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Otherwise, construct the URL
    return `${API_BASE_URL}/images/${filename}`;
  },

  // Delete image
  deleteImage: (filename: string): Promise<{success: string, message: string}> =>
    apiCall<{success: string, message: string}>(`/images/${filename}`, {
      method: 'DELETE',
    }),
};

// TypeScript interfaces sesuai dengan backend models
export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  permissions: string[];
  createdAt: string;  updatedAt: string;
}

// Master Data Types
export interface MasterSpesialisasiRequest {
  nama: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterSpesialisasiResponse {
  id: number;
  nama: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterPosisiRequest {
  nama: string;
  kategori?: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterPosisiResponse {
  id: number;
  nama: string;
  kategori?: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterHobiRequest {
  nama: string;
  kategori?: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterHobiResponse {
  id: number;
  nama: string;
  kategori?: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'WAITING_APPROVAL' | 'REJECTED';
  role?: Role;
  biografi?: Biografi;
  createdAt: string;
  updatedAt: string;
}



export interface PagedResponse<T> {
  content: T[];
  page?: number; // Frontend mapping
  number?: number; // Backend property for current page
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements?: number; // Backend property
}

// Utility functions
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

// React hooks untuk data fetching - MOVED to separate client component file
// See /src/hooks/useApiData.ts for client-side hooks

// Notification interfaces
export interface NotificationRequest {
  title: string;
  message: string;
  recipients: string[];
  type: 'text' | 'image';
  image?: File | null;
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Notification API functions
export const notifikasiAPI = {  // Send WhatsApp notification
  sendWhatsAppNotification: async (notification: NotificationRequest): Promise<WhatsAppResponse> => {
    const formData = new FormData();
    formData.append('title', notification.title);
    formData.append('message', notification.message);
    // Send recipients as comma-separated string instead of JSON
    formData.append('recipients', notification.recipients.join(','));
    formData.append('type', notification.type);
    
    if (notification.image && notification.type === 'image') {
      formData.append('image', notification.image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/whatsapp`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      throw error;
    }
  },

  // Get notification history
  getNotificationHistory: (page = 0, size = 10): Promise<PagedResponse<any>> =>
    apiCall<PagedResponse<any>>(`/notifications/history?page=${page}&size=${size}`),
};

// Optimized endpoint for recipient selection
export const getRecipientsForSelection = async (filterRequest: BiografiFilterRequest): Promise<PagedResponse<RecipientSummary>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/biografi/recipients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching recipients:', error);
    throw error;
  }
};

// Minimal recipient data interface for performance
export interface RecipientSummary {
  biografiId: number;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  jurusan: string;
  alumniTahun: string;
  spesialisasi: string;
}

// API functions for dropdown data
export const getFilterOptions = {
  jurusan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/jurusan'),
  
  pekerjaan: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/pekerjaan'),
  
  kota: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/kota'),
  
  provinsi: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/provinsi'),
  
  alumniTahun: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/alumni-tahun'),
  
  spesialisasi: (): Promise<string[]> =>
    apiCall<string[]>('/biografi/filters/spesialisasi'),
};

// Berita types and interfaces
export interface Berita {
  id: number;
  judul: string;
  ringkasan: string;
  ringkasanWordCount?: number;
  konten: string;
  penulis: string;
  penulisBiografiId?: number;
  gambarUrl: string;
  mediaLampiran?: string; // JSON string untuk array media
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  kategori: 'UMUM' | 'AKADEMIK' | 'KARIR' | 'ALUMNI' | 'TEKNOLOGI' | 'OLAHRAGA' | 'KEGIATAN';
  jumlahView: number;
  jumlahLike: number;
  createdAt: string;
  updatedAt: string;
}

export interface BeritaRequest {
  judul: string;
  ringkasan: string;
  ringkasanWordCount?: number;
  konten: string;
  penulis?: string;
  penulisBiografiId?: number;
  gambarUrl?: string;
  mediaLampiran?: string; // JSON string
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  kategori: 'UMUM' | 'AKADEMIK' | 'KARIR' | 'ALUMNI' | 'TEKNOLOGI' | 'OLAHRAGA' | 'KEGIATAN';
}

export interface BeritaPage {
  content: Berita[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Berita API functions - Complete news management integration
export const beritaAPI = {
  // Get all berita with pagination and filters
  getAllBerita: (params?: {
    page?: number;
    size?: number;
    kategori?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<BeritaPage> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.kategori) queryParams.append('kategori', params.kategori);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const endpoint = `/berita${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<BeritaPage>(endpoint);
  },
  // Get published berita only
  getPublishedBerita: (params?: {
    page?: number;
    size?: number;
    kategori?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<BeritaPage> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.kategori) {
      console.log(`API: Adding kategori filter: ${params.kategori}`);
      queryParams.append('kategori', params.kategori);
    }
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const endpoint = `/berita/published${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log(`Fetching berita with endpoint: ${endpoint}`);
    return apiCall<BeritaPage>(endpoint);
  },
  // Get berita by ID
  getBeritaById: (id: number): Promise<Berita> =>    apiCall<Berita>(`/berita/${id}`),

  // Get berita detail by ID (optimized, no N+1 queries)
  getBeritaDetailById: (id: number): Promise<Berita> => 
    apiCall<Berita>(`/berita/${id}/detail`),

  // Get berita by kategori
  getBeritaByKategori: (kategori: string, params?: {
    page?: number;
    size?: number;
  }): Promise<BeritaPage> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const endpoint = `/berita/kategori/${kategori}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall<BeritaPage>(endpoint);
  },

  // Get popular berita
  getPopularBerita: (limit = 5): Promise<Berita[]> =>
    apiCall<Berita[]>(`/berita/popular?limit=${limit}`),

  // Search berita
  searchBerita: (query: string, params?: {
    page?: number;
    size?: number;
  }): Promise<BeritaPage> => {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    return apiCall<BeritaPage>(`/berita/search?${queryParams.toString()}`);
  },

  // Create new berita
  createBerita: (berita: BeritaRequest): Promise<Berita> =>
    apiCall<Berita>('/berita', {
      method: 'POST',
      body: JSON.stringify(berita),
    }),

  // Update berita
  updateBerita: (id: number, berita: BeritaRequest): Promise<Berita> =>
    apiCall<Berita>(`/berita/${id}`, {
      method: 'PUT',
      body: JSON.stringify(berita),
    }),

  // Delete berita
  deleteBerita: (id: number): Promise<void> =>
    apiCall<void>(`/berita/${id}`, {
      method: 'DELETE',
    }),

  // Like berita
  likeBerita: (id: number): Promise<void> =>
    apiCall<void>(`/berita/${id}/like`, {
      method: 'POST',
    }),

  // Update berita status
  updateStatus: (id: number, status: string): Promise<Berita> =>
    apiCall<Berita>(`/berita/${id}/status?status=${status}`, {
      method: 'PUT',
    }),
};

// Helper function to map backend kategori to frontend display
export const getKategoriDisplay = (kategori: string): string => {
  const kategoriMap: Record<string, string> = {
    'UMUM': 'Umum',
    'AKADEMIK': 'Akademik',
    'KARIR': 'Karir',
    'ALUMNI': 'Alumni',
    'TEKNOLOGI': 'Teknologi',
    'OLAHRAGA': 'Olahraga',
    'KEGIATAN': 'Kegiatan'
  };
  return kategoriMap[kategori] || kategori;
};

// Helper function to get all available categories
export const getBeritaKategories = (): string[] => {
  return ['UMUM', 'AKADEMIK', 'KARIR', 'ALUMNI', 'TEKNOLOGI', 'OLAHRAGA', 'KEGIATAN'];
};

// Helper function to format berita date
export const formatBeritaDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Comment types and interfaces
export interface Comment {
  id: number;
  beritaId: number;
  nama: string;
  email?: string;
  konten: string;
  foto?: string; // Field foto pengguna
  parentId?: number;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  beritaId: number;
  nama: string;
  email?: string;
  konten: string;
  foto?: string; // Field foto pengguna
  parentId?: number;
}

export interface CommentReaction {
  commentId: number;
  type: 'LIKE' | 'DISLIKE';
}

// Comment API functions - Complete implementation
export const commentAPI = {
  // Get comments for a berita
  getCommentsByBeritaId: (beritaId: number): Promise<Comment[]> =>
    apiCall<Comment[]>(`/comments/berita/${beritaId}`),

  // Get paginated comments for a berita
  getPaginatedComments: (beritaId: number, page: number = 0, size: number = 10): Promise<{
    content: Comment[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> =>
    apiCall(`/comments/berita/${beritaId}/paginated?page=${page}&size=${size}`),

  // Create new comment
  createComment: (comment: CommentRequest): Promise<Comment> =>
    apiCall<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    }),

  // Reply to comment
  replyToComment: (parentId: number, comment: CommentRequest): Promise<Comment> =>
    apiCall<Comment>(`/comments/${parentId}/reply`, {
      method: 'POST',
      body: JSON.stringify(comment),
    }),

  // Get replies for a comment
  getReplies: (commentId: number): Promise<Comment[]> =>
    apiCall<Comment[]>(`/comments/${commentId}/replies`),

  // Get specific comment by ID
  getComment: (commentId: number): Promise<Comment> =>
    apiCall<Comment>(`/comments/${commentId}`),

  // Update comment
  updateComment: (commentId: number, comment: CommentRequest): Promise<Comment> =>
    apiCall<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(comment),
    }),  // Like comment
  likeComment: (commentId: number, biografiId: number, userName: string): Promise<void> =>
    apiCall<void>(`/comments/${commentId}/like`, {
      method: 'POST',
      body: JSON.stringify({
        biografiId: biografiId,
        userName: userName
      }),
    }),

  // Dislike comment
  dislikeComment: (commentId: number, biografiId: number, userName: string): Promise<void> =>
    apiCall<void>(`/comments/${commentId}/dislike`, {
      method: 'POST',
      body: JSON.stringify({
        biografiId: biografiId,
        userName: userName
      }),
    }),

  // Delete comment
  deleteComment: (commentId: number): Promise<void> =>
    apiCall<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Get comment count for berita
  getCommentCount: (beritaId: number): Promise<{ count: number }> =>
    apiCall<{ count: number }>(`/comments/berita/${beritaId}/count`),
};

// Helper function to format comment date
export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} hari yang lalu`;
  } else if (diffHours > 0) {
    return `${diffHours} jam yang lalu`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} menit yang lalu`;
  } else {
    return 'Baru saja';
  }
};

// Invitation interfaces
// Pagination and filtering interfaces
export interface PagedInvitationResponse {
  content: Invitation[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InvitationFilters {
  status?: string;
  nama?: string;
  phone?: string;
}

export interface Invitation {
  id: number;
  namaLengkap: string;
  nomorHp: string;
  invitationToken: string;
  status: 'PENDING' | 'SENT' | 'USED' | 'EXPIRED' | 'FAILED' | 'CANCELLED';
  sentAt: string;
  usedAt?: string;
  expiresAt: string;
  cancelledAt?: string;
  whatsappMessageId?: string;
  createdAt: string;
  updatedAt: string;
  createdUser?: User;
  hasBiografi?: boolean;
  userId?: number;
  userFullName?: string;
}

export interface InvitationRequest {
  namaLengkap: string;
  nomorHp: string;
}

export interface RegistrationFromInvitationRequest {
  invitationToken: string;
  username: string;
  password: string;
  email: string;
  biografiData: BiografiRequest;
}

export interface PublicInvitationLink {
  id: number;
  linkToken: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicRegistrationRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  publicInvitationToken: string;
  biografiData?: BiografiRequest;
}

// Invitation API functions
export const invitationAPI = {
  // Send invitation
  sendInvitation: (request: InvitationRequest): Promise<Invitation> =>
    apiCall<Invitation>('/invitations/send', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Get invitation history
  getInvitationHistory: (): Promise<Invitation[]> =>
    apiCall<Invitation[]>('/invitations/history'),

  // Get invitation by token
  getInvitationByToken: (token: string): Promise<Invitation> =>
    apiCall<Invitation>(`/invitations/token/${token}`),

  // Resend invitation
  resendInvitation: (id: number): Promise<{ message: string; invitation: Invitation }> =>
    apiCall<{ message: string; invitation: Invitation }>(`/invitations/${id}/resend`, {
      method: 'POST',
    }),

  // Cancel invitation
  cancelInvitation: (id: number): Promise<{ message: string; invitation: Invitation }> =>
    apiCall<{ message: string; invitation: Invitation }>(`/invitations/${id}/cancel`, {
      method: 'POST',
    }),
  // Get invitation statistics
  getInvitationStatistics: (): Promise<any> =>
    apiCall<any>('/invitations/statistics'),
  // Get paginated invitation history with filtering
  getInvitationHistoryPaginated: (
    page: number = 0,
    size: number = 10,
    filters?: InvitationFilters,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Promise<PagedInvitationResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('sortDirection', sortDirection);
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.nama) {
      params.append('nama', filters.nama);
    }
    if (filters?.phone) {
      params.append('phone', filters.phone);
    }    
    return apiCall<PagedInvitationResponse>(`/invitations/history/paginated?${params.toString()}`);
  },

  // Register from invitation
  registerFromInvitation: (request: RegistrationFromInvitationRequest): Promise<User> =>
    apiCall<User>('/invitations/register', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

// Public Invitation Link API functions
export const publicInvitationLinkAPI = {  // Generate public invitation link
  generatePublicLink: (
    description?: string,
    expiresAt?: string,
    maxUses?: number
  ): Promise<{ message: string; link: PublicInvitationLink; registrationUrl: string }> =>
    apiCall<{ message: string; link: PublicInvitationLink; registrationUrl: string }>('/public-invitation-links/generate', {
      method: 'POST',
      body: JSON.stringify({ description, expiresAt, maxUses }),
    }),

  // Get public link by token
  getPublicLinkByToken: (token: string): Promise<PublicInvitationLink> =>
    apiCall<PublicInvitationLink>(`/public-invitation-links/token/${token}`),

  // Validate public link
  validatePublicLink: (token: string): Promise<{ valid: boolean; message?: string }> =>
    apiCall<{ valid: boolean; message?: string }>(`/public-invitation-links/validate/${token}`),

  // Get all public links
  getAllPublicLinks: (): Promise<PublicInvitationLink[]> =>
    apiCall<PublicInvitationLink[]>('/public-invitation-links'),

  // Get active public links
  getActivePublicLinks: (): Promise<PublicInvitationLink[]> =>
    apiCall<PublicInvitationLink[]>('/public-invitation-links/active'),

  // Deactivate public link
  deactivatePublicLink: (id: number): Promise<{ message: string; link: PublicInvitationLink }> =>
    apiCall<{ message: string; link: PublicInvitationLink }>(`/public-invitation-links/${id}/deactivate`, {
      method: 'POST',
    }),

  // Activate public link
  activatePublicLink: (id: number): Promise<{ message: string; link: PublicInvitationLink }> =>
    apiCall<{ message: string; link: PublicInvitationLink }>(`/public-invitation-links/${id}/activate`, {
      method: 'POST',
    }),

  // Get public link statistics
  getPublicLinkStatistics: (): Promise<any> =>
    apiCall<any>('/public-invitation-links/statistics'),
};

// User Approval API functions
export const userApprovalAPI = {  // Get users waiting for approval
  getUsersWaitingApproval: (): Promise<User[]> =>
    apiCall<User[]>('/user-approvals/pending'),
  // Get users waiting for approval with pagination
  getUsersWaitingApprovalPaginated: (params: string): Promise<any> =>
    apiCall<any>(`/user-approvals/pending/paginated?${params}`),

  // Get approved users with pagination
  getApprovedUsersPaginated: (params: string): Promise<any> =>
    apiCall<any>(`/user-approvals/approved/paginated?${params}`),

  // Get rejected users with pagination
  getRejectedUsersPaginated: (params: string): Promise<any> =>
    apiCall<any>(`/user-approvals/rejected/paginated?${params}`),

  // Get all users with pagination
  getAllUsersPaginated: (params: string): Promise<any> =>
    apiCall<any>(`/user-approvals/all/paginated?${params}`),

  // Approve user
  approveUser: (userId: number): Promise<{ message: string; user: User }> =>
    apiCall<{ message: string; user: User }>(`/user-approvals/${userId}/approve`, {
      method: 'POST',
    }),

  // Reject user
  rejectUser: (userId: number, reason?: string): Promise<{ message: string; user: User }> =>
    apiCall<{ message: string; user: User }>(`/user-approvals/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Get approval statistics
  getApprovalStatistics: (): Promise<any> =>
    apiCall<any>('/user-approvals/statistics'),

  // Get count of users waiting approval
  getUsersWaitingApprovalCount: (): Promise<{ count: number }> =>
    apiCall<{ count: number }>('/user-approvals/pending/count'),
};

// Auth API - Add public registration
export const authAPI = {
  // ... existing auth functions ...

  // Register from public invitation link
  registerFromPublicLink: (request: PublicRegistrationRequest): Promise<{
    message: string;
    user: {
      id: number;
      username: string;
      fullName: string;
      email: string;
      status: string;
    };
  }> =>
    apiCall<{
      message: string;
      user: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        status: string;
      };
    }>('/auth/register/public', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

// Birthday notification interfaces
interface BirthdayNotification {
  id: number;
  biografiId: number;
  namaLengkap: string;
  nomorTelepon: string;
  email: string;
  tanggalLahir: string;
  notificationDate: string;
  year: number;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'EXCLUDED' | 'RESENT';
  statusDisplayName: string;
  message: string;
  sentAt?: string;
  errorMessage?: string;
  isExcluded: boolean;
  createdAt: string;
  updatedAt: string;
  age: number;
}

interface BirthdayStatistics {
  totalBirthdays: number;
  sent: number;
  pending: number;
  failed: number;
  excluded: number;
  year: number;
}

interface OldBirthdaySettings {
  enabled: boolean;
  time: string;
  timezone: string;
  message: string;
  daysAhead: number;
}

interface BirthdayNotificationFilter {
  year?: number;
  status?: string;
  isExcluded?: string;
  nama?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Birthday API functions
export const birthdayAPI = {
  // Get birthday notifications with pagination and filters
  getBirthdayNotifications: (filter: BirthdayNotificationFilter): Promise<PageResponse<BirthdayNotification>> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    return apiCall<PageResponse<BirthdayNotification>>(`/admin/birthday/notifications?${params}`);
  },

  // Get upcoming birthdays
  getUpcomingBirthdays: (days: number = 30): Promise<BirthdayNotification[]> =>
    apiCall<BirthdayNotification[]>(`/admin/birthday/upcoming?days=${days}`),

  // Get past birthdays
  getPastBirthdays: (days: number = 30): Promise<BirthdayNotification[]> =>
    apiCall<BirthdayNotification[]>(`/admin/birthday/past?days=${days}`),

  // Get birthday statistics
  getBirthdayStatistics: (year?: number): Promise<BirthdayStatistics> => {
    const params = year ? `?year=${year}` : '';
    return apiCall<BirthdayStatistics>(`/admin/birthday/statistics${params}`);
  },
  // Get birthday settings (old format)
  getBirthdaySettings: (): Promise<OldBirthdaySettings> =>
    apiCall<OldBirthdaySettings>('/admin/birthday/settings'),

  // Generate birthday notifications for a year
  generateBirthdayNotifications: (year: number): Promise<void> =>
    apiCall<void>(`/admin/birthday/generate/${year}`, {
      method: 'POST',
    }),

  // Resend birthday notification
  resendBirthdayNotification: (id: number): Promise<void> =>
    apiCall<void>(`/admin/birthday/resend/${id}`, {
      method: 'POST',
    }),
  // Exclude/include birthday notification
  toggleBirthdayExclusion: (id: number, exclude: boolean): Promise<void> =>
    apiCall<void>(`/admin/birthday/exclude/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ exclude }),
    }),

  // Exclude/include biografi birthday notification
  toggleBiografiBirthdayExclusion: (biografiId: number, exclude: boolean): Promise<void> =>
    apiCall<void>(`/admin/birthday/exclude-biografi/${biografiId}`, {
      method: 'PUT',
      body: JSON.stringify({ exclude }),
    }),// Reset biografi notification status to pending
  resetBiografiNotificationToPending: (biografiId: number): Promise<void> =>
    apiCall<void>(`/admin/birthday/reset-biografi-to-pending/${biografiId}`, {
      method: 'PUT',
    }),

  // Test birthday notification
  testBirthdayNotification: (biografiId: number): Promise<void> =>
    apiCall<void>(`/admin/birthday/test/${biografiId}`, {
      method: 'POST',
    }),

  // Send birthday notification for biografi (create notification and send)
  sendBirthdayNotificationForBiografi: (biografiId: number): Promise<void> =>
    apiCall<void>(`/admin/birthday/send-biografi/${biografiId}`, {
      method: 'POST',
    }),

  // Send today's birthday notifications
  sendTodayBirthdays: (): Promise<void> =>
    apiCall<void>('/admin/birthday/send-today', {
      method: 'POST',
    }),
};

// Birthday Settings API functions
export const birthdaySettingsAPI = {
  // Get current birthday settings
  getCurrentSettings: (): Promise<BirthdaySettings> => 
    apiCall<BirthdaySettings>('/birthday-settings'),
  
  // Update birthday settings
  updateSettings: (settings: Partial<BirthdaySettings>): Promise<BirthdaySettingsResponse> =>
    apiCall<BirthdaySettingsResponse>('/birthday-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  
  // Upload attachment image
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/birthday-settings/upload-image`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  },
  
  // Reset to default settings
  resetToDefaults: (): Promise<BirthdaySettingsResponse> =>
    apiCall<BirthdaySettingsResponse>('/birthday-settings/reset-defaults', {
      method: 'POST'
    }),
    // Test notification
  testNotification: (phoneNumber: string): Promise<{ success: boolean; message: string }> =>
    apiCall<{ success: boolean; message: string }>('/birthday-settings/test-notification', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    })
};

// Birthday Settings interfaces
export interface BirthdaySettings {
  id?: number;
  enabled: boolean;
  notificationTime: string; // Cron expression
  timezone: string;
  message: string;
  daysAhead: number;
  includeAge?: boolean;
  attachmentImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BirthdaySettingsResponse {
  success: boolean;
  message: string;
  data: BirthdaySettings;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

// Invitation interfaces
export interface Invitation {
  id: number;
  namaLengkap: string;
  nomorHp: string;
  invitationToken: string;
  status: 'PENDING' | 'SENT' | 'USED' | 'EXPIRED' | 'FAILED' | 'CANCELLED';
  sentAt: string;
  usedAt?: string;
  expiresAt: string;
  cancelledAt?: string;
  whatsappMessageId?: string;
  createdAt: string;
  updatedAt: string;
  createdUser?: User;
  hasBiografi?: boolean;
  userId?: number;
  userFullName?: string;
}

export interface InvitationRequest {
  namaLengkap: string;
  nomorHp: string;
}

export interface RegistrationFromInvitationRequest {
  invitationToken: string;
  username: string;
  password: string;
  email: string;
  biografiData: BiografiRequest;
}

export interface PublicInvitationLink {
  id: number;
  linkToken: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
}

// Location interfaces
export interface ProvinsiResponseDTO {
  id: number;
  kode: string;
  nama: string;
  kotaList: KotaResponseDTO[];
  kotaCount?: number;
}

export interface KotaResponseDTO {
  id: number;
  kode: string;
  nama: string;
  tipe: string;
  provinsiNama: string;
}

// Request DTOs for location CRUD
export interface ProvinsiRequest {
  kode: string;
  nama: string;
}

export interface KotaRequest {
  kode: string;
  nama: string;
  tipe: string; // KOTA, KABUPATEN
  provinsiId: number;
}

// Location API functions
export const locationAPI = {
  // ============ READ ENDPOINTS (PUBLIC) ============
  
  // Get all provinces (without kota list for performance)
  getAllProvinsi: (): Promise<ProvinsiResponseDTO[]> => 
    apiCall<ProvinsiResponseDTO[]>('/location/provinsi'),
  
  // Get all provinces with their kota list
  getAllProvinsiWithKota: (): Promise<ProvinsiResponseDTO[]> => 
    apiCall<ProvinsiResponseDTO[]>('/location/provinsi/with-kota'),
  
  // Get provinsi by ID
  getProvinsiById: (id: number): Promise<ProvinsiResponseDTO> => 
    apiCall<ProvinsiResponseDTO>(`/location/provinsi/${id}`),
  
  // Get kota by provinsi ID
  getKotaByProvinsiId: (provinsiId: number): Promise<KotaResponseDTO[]> => 
    apiCall<KotaResponseDTO[]>(`/location/provinsi/${provinsiId}/kota`),
  
  // Get kota by provinsi name
  getKotaByProvinsiNama: (provinsiNama: string): Promise<KotaResponseDTO[]> => 
    apiCall<KotaResponseDTO[]>(`/location/kota/by-provinsi?provinsiNama=${encodeURIComponent(provinsiNama)}`),
  
  // Get provinsi by name
  getProvinsiByNama: (nama: string): Promise<ProvinsiResponseDTO> => 
    apiCall<ProvinsiResponseDTO>(`/location/provinsi/by-name?nama=${encodeURIComponent(nama)}`),

  // ============ ADMIN CRUD ENDPOINTS ============
  
  // Provinsi CRUD (Admin)
  admin: {
    provinsi: {
      // Get provinsi with pagination
      getAll: (search?: string, page = 0, size = 10) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        return apiCall<{
          content: ProvinsiResponseDTO[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        }>(`/location/admin/provinsi?${params.toString()}`);
      },
      
      // Get provinsi by ID
      getById: (id: number): Promise<ProvinsiResponseDTO> => 
        apiCall<ProvinsiResponseDTO>(`/location/admin/provinsi/${id}`),
      
      // Create provinsi
      create: (data: ProvinsiRequest): Promise<ProvinsiResponseDTO> => 
        apiCall<ProvinsiResponseDTO>('/location/admin/provinsi', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      // Update provinsi
      update: (id: number, data: ProvinsiRequest): Promise<ProvinsiResponseDTO> => 
        apiCall<ProvinsiResponseDTO>(`/location/admin/provinsi/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      
      // Delete provinsi
      delete: (id: number): Promise<void> => 
        apiCall<void>(`/location/admin/provinsi/${id}`, {
          method: 'DELETE',
        }),
    },
    
    kota: {
      // Get kota with pagination
      getAll: (search?: string, provinsiId?: number, page = 0, size = 10) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (provinsiId) params.append('provinsiId', provinsiId.toString());
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        return apiCall<{
          content: KotaResponseDTO[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        }>(`/location/admin/kota?${params.toString()}`);
      },
      
      // Get kota by ID
      getById: (id: number): Promise<KotaResponseDTO> => 
        apiCall<KotaResponseDTO>(`/location/admin/kota/${id}`),
      
      // Create kota
      create: (data: KotaRequest): Promise<KotaResponseDTO> => 
        apiCall<KotaResponseDTO>('/location/admin/kota', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      // Update kota
      update: (id: number, data: KotaRequest): Promise<KotaResponseDTO> => 
        apiCall<KotaResponseDTO>(`/location/admin/kota/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      
      // Delete kota
      delete: (id: number): Promise<void> => 
        apiCall<void>(`/location/admin/kota/${id}`, {
          method: 'DELETE',
        }),    },  },
};

// Master Data Request/Response DTOs
export interface MasterAgamaRequest {
  nama: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterAgamaResponse {
  id: number;
  nama: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterPosisiJabatanRequest {
  nama: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterPosisiJabatanResponse {
  id: number;
  nama: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterSpesialisasiKedokteranRequest {
  nama: string;
  deskripsi?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MasterSpesialisasiKedokteranResponse {
  id: number;
  nama: string;
  deskripsi?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Master Data API functions
export const masterDataAPI = {
  // Spesialisasi API
  spesialisasi: {
    getAll: (search?: string, isActive?: boolean, page = 0, size = 10) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      return apiCall<{
        content: MasterSpesialisasiResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/spesialisasi?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterSpesialisasiResponse[]> => 
      apiCall<MasterSpesialisasiResponse[]>('/admin/master-data/spesialisasi/active'),
    
    getById: (id: number): Promise<MasterSpesialisasiResponse> => 
      apiCall<MasterSpesialisasiResponse>(`/admin/master-data/spesialisasi/${id}`),
    
    create: (data: MasterSpesialisasiRequest): Promise<MasterSpesialisasiResponse> => 
      apiCall<MasterSpesialisasiResponse>('/admin/master-data/spesialisasi', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterSpesialisasiRequest): Promise<MasterSpesialisasiResponse> => 
      apiCall<MasterSpesialisasiResponse>(`/admin/master-data/spesialisasi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/spesialisasi/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterSpesialisasiResponse> => 
      apiCall<MasterSpesialisasiResponse>(`/admin/master-data/spesialisasi/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Posisi API
  posisi: {
    getAll: (search?: string, kategori?: string, isActive?: boolean, page = 0, size = 10) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (kategori) params.append('kategori', kategori);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      return apiCall<{
        content: MasterPosisiResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/posisi?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterPosisiResponse[]> => 
      apiCall<MasterPosisiResponse[]>('/admin/master-data/posisi/active'),
    
    getByCategory: (kategori: string): Promise<MasterPosisiResponse[]> => 
      apiCall<MasterPosisiResponse[]>(`/admin/master-data/posisi/category/${kategori}`),
    
    getCategories: (): Promise<string[]> => 
      apiCall<string[]>('/admin/master-data/posisi/categories'),
    
    getById: (id: number): Promise<MasterPosisiResponse> => 
      apiCall<MasterPosisiResponse>(`/admin/master-data/posisi/${id}`),
    
    create: (data: MasterPosisiRequest): Promise<MasterPosisiResponse> => 
      apiCall<MasterPosisiResponse>('/admin/master-data/posisi', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterPosisiRequest): Promise<MasterPosisiResponse> => 
      apiCall<MasterPosisiResponse>(`/admin/master-data/posisi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/posisi/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterPosisiResponse> => 
      apiCall<MasterPosisiResponse>(`/admin/master-data/posisi/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Hobi API
  hobi: {
    getAll: (search?: string, kategori?: string, isActive?: boolean, page = 0, size = 10) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (kategori) params.append('kategori', kategori);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      return apiCall<{
        content: MasterHobiResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/hobi?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterHobiResponse[]> => 
      apiCall<MasterHobiResponse[]>('/admin/master-data/hobi/active'),
    
    getByCategory: (kategori: string): Promise<MasterHobiResponse[]> => 
      apiCall<MasterHobiResponse[]>(`/admin/master-data/hobi/category/${kategori}`),
    
    getCategories: (): Promise<string[]> => 
      apiCall<string[]>('/admin/master-data/hobi/categories'),
    
    getById: (id: number): Promise<MasterHobiResponse> => 
      apiCall<MasterHobiResponse>(`/admin/master-data/hobi/${id}`),
    
    create: (data: MasterHobiRequest): Promise<MasterHobiResponse> => 
      apiCall<MasterHobiResponse>('/admin/master-data/hobi', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterHobiRequest): Promise<MasterHobiResponse> => 
      apiCall<MasterHobiResponse>(`/admin/master-data/hobi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/hobi/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterHobiResponse> => 
      apiCall<MasterHobiResponse>(`/admin/master-data/hobi/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },
  // Agama API
  agama: {
    getAll: (search?: string, isActive?: boolean, page = 0, size = 10, sortBy = 'sortOrder', sortDir = 'asc') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);
      
      return apiCall<{
        content: MasterAgamaResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/agama?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterAgamaResponse[]> => 
      apiCall<MasterAgamaResponse[]>('/admin/master-data/agama/active'),
    
    getById: (id: number): Promise<MasterAgamaResponse> => 
      apiCall<MasterAgamaResponse>(`/admin/master-data/agama/${id}`),
    
    create: (data: MasterAgamaRequest): Promise<MasterAgamaResponse> => 
      apiCall<MasterAgamaResponse>('/admin/master-data/agama', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterAgamaRequest): Promise<MasterAgamaResponse> => 
      apiCall<MasterAgamaResponse>(`/admin/master-data/agama/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/agama/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterAgamaResponse> => 
      apiCall<MasterAgamaResponse>(`/admin/master-data/agama/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Posisi Jabatan API
  posisiJabatan: {
    getAll: (search?: string, isActive?: boolean, page = 0, size = 10) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      return apiCall<{
        content: MasterPosisiJabatanResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/posisi-jabatan?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterPosisiJabatanResponse[]> => 
      apiCall<MasterPosisiJabatanResponse[]>('/admin/master-data/posisi-jabatan/active'),
    
    getById: (id: number): Promise<MasterPosisiJabatanResponse> => 
      apiCall<MasterPosisiJabatanResponse>(`/admin/master-data/posisi-jabatan/${id}`),
    
    create: (data: MasterPosisiJabatanRequest): Promise<MasterPosisiJabatanResponse> => 
      apiCall<MasterPosisiJabatanResponse>('/admin/master-data/posisi-jabatan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterPosisiJabatanRequest): Promise<MasterPosisiJabatanResponse> => 
      apiCall<MasterPosisiJabatanResponse>(`/admin/master-data/posisi-jabatan/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/posisi-jabatan/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterPosisiJabatanResponse> => 
      apiCall<MasterPosisiJabatanResponse>(`/admin/master-data/posisi-jabatan/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Spesialisasi Kedokteran API
  spesialisasiKedokteran: {
    getAll: (search?: string, isActive?: boolean, page = 0, size = 10) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      return apiCall<{
        content: MasterSpesialisasiKedokteranResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
      }>(`/admin/master-data/spesialisasi-kedokteran?${params.toString()}`);
    },
    
    getAllActive: (): Promise<MasterSpesialisasiKedokteranResponse[]> => 
      apiCall<MasterSpesialisasiKedokteranResponse[]>('/admin/master-data/spesialisasi-kedokteran/active'),
    
    getById: (id: number): Promise<MasterSpesialisasiKedokteranResponse> => 
      apiCall<MasterSpesialisasiKedokteranResponse>(`/admin/master-data/spesialisasi-kedokteran/${id}`),
    
    create: (data: MasterSpesialisasiKedokteranRequest): Promise<MasterSpesialisasiKedokteranResponse> => 
      apiCall<MasterSpesialisasiKedokteranResponse>('/admin/master-data/spesialisasi-kedokteran', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: MasterSpesialisasiKedokteranRequest): Promise<MasterSpesialisasiKedokteranResponse> => 
      apiCall<MasterSpesialisasiKedokteranResponse>(`/admin/master-data/spesialisasi-kedokteran/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<void> => 
      apiCall<void>(`/admin/master-data/spesialisasi-kedokteran/${id}`, {
        method: 'DELETE',
      }),
    
    toggleActive: (id: number): Promise<MasterSpesialisasiKedokteranResponse> => 
      apiCall<MasterSpesialisasiKedokteranResponse>(`/admin/master-data/spesialisasi-kedokteran/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },
}

// Wilayah API for location codes conversion
export const wilayahAPI = {
  // Convert batch of location codes to readable names
  convertCodesToNames: async (codeMap: Record<string, string>): Promise<Record<string, string>> => {
    return apiCall<Record<string, string>>('/wilayah/names', {
      method: 'POST',
      body: JSON.stringify(codeMap),
    });
  },

  // Convert single location code to readable name
  convertCodeToName: async (code: string): Promise<string> => {
    const response = await apiCall<{ kode: string; nama: string }>(`/wilayah/name/${code}`);
    return response.nama;
  },

  // Helper function to convert biografi location data
  convertBiografiLocation: async (biografi: any): Promise<{
    provinsiNama?: string;
       kotaNama?: string;
    kecamatanNama?: string;
    kelurahanNama?: string;
  }> => {
    const codeMap: Record<string, string> = {};
    
    if (biografi.provinsi) codeMap[biografi.provinsi] = 'provinsi';
   
    if (biografi.kota) codeMap[biografi.kota] = 'kota';
    if (biografi.kecamatan) codeMap[biografi.kecamatan] = 'kecamatan';
    if (biografi.kelurahan) codeMap[biografi.kelurahan] = 'kelurahan';

    if (Object.keys(codeMap).length === 0) {
      return {};
    }

    try {
      const nameMap = await wilayahAPI.convertCodesToNames(codeMap);
      
      return {
        provinsiNama: biografi.provinsi ? nameMap[biografi.provinsi] : undefined,
        kotaNama: biografi.kota ? nameMap[biografi.kota] : undefined,
        kecamatanNama: biografi.kecamatan ? nameMap[biografi.kecamatan] : undefined,
        kelurahanNama: biografi.kelurahan ? nameMap[biografi.kelurahan] : undefined,
      };
    } catch (error) {
      console.error('Error converting location codes:', error);
      return {};
    }
  },
};

// Configuration API
export const configAPI = {
  getUploadLimits: async () => {
    const response = await fetch(`${API_BASE_URL}/api/config/upload-limits`)
    if (!response.ok) {
      throw new Error('Failed to fetch upload limits')
    }
    return response.json()
  }
}

// Laporan types and interfaces
export interface JenisLaporan {
  jenisLaporanId: number;
  nama: string;
  deskripsi: string;
  status: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  jumlahTahapan: number;
  jumlahLaporan: number;
  tahapanList?: TahapanLaporan[];
}

export interface TahapanLaporan {
  tahapanLaporanId: number;
  nama: string;
  deskripsi: string;
  templateTahapan: string;
  urutanTahapan: number;
  status: 'AKTIF' | 'TIDAK_AKTIF';
  jenisFileIzin: string[];
  jenisLaporanId: number;
  jenisLaporanNama: string;
  createdAt: string;
  updatedAt: string;
}

export interface Laporan {
  laporanId: number;
  namaLaporan: string;
  deskripsi: string;
  namaPelapor: string;
  alamatPelapor: string;
  userId: number;
  status: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';
  jenisLaporanId: number;
  jenisLaporanNama: string;
  totalTahapan: number;
  tahapanSelesai: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface JenisLaporanRequest {
  nama: string;
  deskripsi: string;
  status?: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';
  tahapanList?: TahapanLaporanRequest[];
}

export interface TahapanLaporanRequest {
  tahapanLaporanId?: number; // For update
  nama: string;
  deskripsi: string;
  templateTahapan: string;
  urutanTahapan: number;
  status?: 'AKTIF' | 'TIDAK_AKTIF';
  jenisFileIzin?: string[];
  jenisLaporanId?: number;
}

export interface LaporanRequest {
  namaLaporan: string;
  deskripsi: string;
  namaPelapor: string;
  alamatPelapor: string;
  jenisLaporanId: number;
  userId?: number;
}

export interface LaporanWizardRequest {
  namaLaporan: string;
  deskripsi: string;
  namaPelapor: string;
  alamatPelapor: string;
  jenisLaporanIds: number[];
  userId?: number;
}

export interface JenisLaporanFilterRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  nama?: string;
  status?: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';
}

export interface LaporanFilterRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  namaLaporan?: string;
  namaPelapor?: string;
  jenisLaporanId?: number;
  status?: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT';
  userId?: number;
}

export interface JenisLaporanStats {
  totalAktif: number;
  totalTidakAktif: number;
  totalDraft: number;
  total: number;
}

export interface LaporanStats {
  total: number;
  draft: number;
  aktif: number;
  tidakAktif: number;
}

// Jenis Laporan API functions
export const jenisLaporanAPI = {
  // Get all jenis laporan with pagination and filters
  search: (filterRequest: JenisLaporanFilterRequest): Promise<PagedResponse<JenisLaporan>> =>
    apiCall<PagedResponse<JenisLaporan>>('/jenis-laporan/search', {
      method: 'POST',
      body: JSON.stringify(filterRequest),
    }),

  // Get all active jenis laporan for dropdown
  getActive: (): Promise<JenisLaporan[]> =>
    apiCall<JenisLaporan[]>('/jenis-laporan/active'),

  // Get jenis laporan by ID
  getById: (id: number): Promise<JenisLaporan> =>
    apiCall<JenisLaporan>(`/jenis-laporan/${id}`),

  // Get jenis laporan with tahapan
  getWithTahapan: (id: number): Promise<JenisLaporan> =>
    apiCall<JenisLaporan>(`/jenis-laporan/${id}/with-tahapan`),

  // Create jenis laporan
  create: (jenisLaporan: JenisLaporanRequest): Promise<JenisLaporan> =>
    apiCall<JenisLaporan>('/jenis-laporan', {
      method: 'POST',
      body: JSON.stringify(jenisLaporan),
    }),

  // Update jenis laporan
  update: (id: number, jenisLaporan: JenisLaporanRequest): Promise<JenisLaporan> =>
    apiCall<JenisLaporan>(`/jenis-laporan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jenisLaporan),
    }),

  // Delete jenis laporan (soft delete)
  delete: (id: number): Promise<void> =>
    apiCall<void>(`/jenis-laporan/${id}`, {
      method: 'DELETE',
    }),

  // Hard delete jenis laporan
  hardDelete: (id: number): Promise<void> =>
    apiCall<void>(`/jenis-laporan/${id}/permanent`, {
      method: 'DELETE',
    }),

  // Get tahapan by jenis laporan
  getTahapan: (id: number): Promise<TahapanLaporan[]> =>
    apiCall<TahapanLaporan[]>(`/jenis-laporan/${id}/tahapan`),

  // Get active tahapan by jenis laporan
  getActiveTahapan: (id: number): Promise<TahapanLaporan[]> =>
    apiCall<TahapanLaporan[]>(`/jenis-laporan/${id}/tahapan/active`),

  // Create tahapan for jenis laporan
  createTahapan: (jenisLaporanId: number, tahapan: TahapanLaporanRequest): Promise<TahapanLaporan> =>
    apiCall<TahapanLaporan>(`/jenis-laporan/${jenisLaporanId}/tahapan`, {
      method: 'POST',
      body: JSON.stringify(tahapan),
    }),

  // Get next urutan for tahapan
  getNextUrutan: (id: number): Promise<{ nextUrutan: number }> =>
    apiCall<{ nextUrutan: number }>(`/jenis-laporan/${id}/tahapan/next-urutan`),

  // Get statistics
  getStats: (): Promise<JenisLaporanStats> =>
    apiCall<JenisLaporanStats>('/jenis-laporan/stats'),
};

// Laporan API functions
export const laporanAPI = {
  // Get all laporan with pagination and filters
  search: (filterRequest: LaporanFilterRequest): Promise<PagedResponse<Laporan>> =>
    apiCall<PagedResponse<Laporan>>('/laporan/search', {
      method: 'POST',
      body: JSON.stringify(filterRequest),
    }),

  // Get laporan by user
  getByUser: (userId: number, filterRequest: LaporanFilterRequest): Promise<PagedResponse<Laporan>> =>
    apiCall<PagedResponse<Laporan>>(`/laporan/user/${userId}/search`, {
      method: 'POST',
      body: JSON.stringify(filterRequest),
    }),

  // Get laporan by ID
  getById: (id: number): Promise<Laporan> =>
    apiCall<Laporan>(`/laporan/${id}`),

  // Create laporan
  create: (laporan: LaporanRequest): Promise<Laporan> =>
    apiCall<Laporan>('/laporan', {
      method: 'POST',
      body: JSON.stringify(laporan),
    }),

  // Create laporan with wizard (multiple jenis laporan)
  createWizard: (wizardData: LaporanWizardRequest): Promise<Laporan> =>
    apiCall<Laporan>('/laporan/wizard', {
      method: 'POST',
      body: JSON.stringify(wizardData),
    }),

  // Update laporan
  update: (id: number, laporan: LaporanRequest): Promise<Laporan> =>
    apiCall<Laporan>(`/laporan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(laporan),
    }),

  // Update laporan status (admin only)
  updateStatus: (id: number, status: 'AKTIF' | 'TIDAK_AKTIF' | 'DRAFT'): Promise<Laporan> =>
    apiCall<Laporan>(`/laporan/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Delete laporan (soft delete)
  delete: (id: number): Promise<void> =>
    apiCall<void>(`/laporan/${id}`, {
      method: 'DELETE',
    }),

  // Hard delete laporan
  hardDelete: (id: number): Promise<void> =>
    apiCall<void>(`/laporan/${id}/permanent`, {
      method: 'DELETE',
    }),

  // Get statistics
  getStats: (userId?: number): Promise<LaporanStats> => {
    const endpoint = userId ? `/laporan/stats?userId=${userId}` : '/laporan/stats';
    return apiCall<LaporanStats>(endpoint);
  },
};

// Tahapan Laporan API functions
export const tahapanLaporanAPI = {
  // Get tahapan by jenis laporan
  getByJenisLaporan: (jenisLaporanId: number): Promise<TahapanLaporan[]> =>
    apiCall<TahapanLaporan[]>(`/tahapan-laporan/jenis-laporan/${jenisLaporanId}`),

  // Get active tahapan by jenis laporan
  getActiveByJenisLaporan: (jenisLaporanId: number): Promise<TahapanLaporan[]> =>
    apiCall<TahapanLaporan[]>(`/tahapan-laporan/jenis-laporan/${jenisLaporanId}/active`),

  // Get tahapan by ID
  getById: (id: number): Promise<TahapanLaporan> =>
    apiCall<TahapanLaporan>(`/tahapan-laporan/${id}`),

  // Create tahapan
  create: (tahapan: TahapanLaporanRequest): Promise<TahapanLaporan> =>
    apiCall<TahapanLaporan>('/tahapan-laporan', {
      method: 'POST',
      body: JSON.stringify(tahapan),
    }),

  // Update tahapan
  update: (id: number, tahapan: TahapanLaporanRequest): Promise<TahapanLaporan> =>
    apiCall<TahapanLaporan>(`/tahapan-laporan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tahapan),
    }),

  // Delete tahapan (soft delete)
  delete: (id: number): Promise<void> =>
    apiCall<void>(`/tahapan-laporan/${id}`, {
      method: 'DELETE',
    }),

  // Hard delete tahapan
  hardDelete: (id: number): Promise<void> =>
    apiCall<void>(`/tahapan-laporan/${id}/permanent`, {
      method: 'DELETE',
    }),

  // Get next urutan for jenis laporan
  getNextUrutan: (jenisLaporanId: number): Promise<{ nextUrutan: number }> =>
    apiCall<{ nextUrutan: number }>(`/tahapan-laporan/next-urutan/${jenisLaporanId}`),
};

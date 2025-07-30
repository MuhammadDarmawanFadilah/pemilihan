"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Home,
  User2,
  ChevronUp,
  ChevronDown,
  Users,
  UserCircle,
  Newspaper,
  FileText,
  Shield,
  FolderOpen,
  Bell,
  Lightbulb,
  CheckCircle,
  LogOut,
  LogIn,
  Gift,
  Mail,
  UserCheck,
  Edit,
  Key,
  Database,
  Briefcase,
  MapPin,
  Building,
  Vote, // Added for Pemilihan
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/useMobile";
import { useToast } from "@/hooks/use-toast-simple";
import { encodeId } from "@/lib/crypto-utils";
import { imageAPI } from "@/lib/api";

const AppSidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useMobile();
  const { setOpenMobile } = useSidebar();
  // State untuk mengatur open/close status setiap section
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(!isMobile);
  const [isAlumniMenuOpen, setIsAlumniMenuOpen] = useState(!isMobile);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(!isMobile);
  // Update state ketika device berubah dari desktop ke mobile atau sebaliknya
  useEffect(() => {
    if (isMobile) {
      setIsMainMenuOpen(false);
      setIsAlumniMenuOpen(false);
      setIsProfileMenuOpen(false);
    } else {
      setIsMainMenuOpen(true);
      setIsAlumniMenuOpen(true);
      setIsProfileMenuOpen(true);
    }
  }, [isMobile]);

  // Helper function untuk menutup sidebar pada mobile ketika menu diklik
  const handleMenuClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const isAdmin = user?.role?.roleName === 'ADMIN' || user?.role?.roleName === 'MODERATOR';

  // Public items (accessible to everyone)
  const publicItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
  ];

  // User items (accessible when logged in)
  const userItems = [
    {
      title: "Laporan Pengawas",
      url: "/laporan-pengawas",
      icon: Vote,
    },
    {
      title: isAdmin ? "Kelola Laporan" : "Laporan Saya",
      url: "/laporan-saya",
      icon: FileText,
    },
    {
      title: "File Manager",
      url: "/file-manager",
      icon: FolderOpen,
    },
  ];  // Admin Pegawai items (accessible to admin/moderator)
  const adminPegawaiItems = [
    {
      title: "Pegawai",
      url: "/admin/pegawai",
      icon: Users,
    },
    {
      title: "Lokasi Pegawai",
      url: "/admin/pegawai/lokasi",
      icon: MapPin,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: Shield,
    },
    {
      title: "File Pegawai",
      url: "/admin/file-pegawai",
      icon: FileText,
    },
  ];

  // Admin Pemilihan items (accessible to admin/moderator)
  const adminPemilihanItems = [
    {
      title: "Pemilihan",
      url: "/admin/pemilihan",
      icon: Vote,
    },
    {
      title: "Laporan",
      url: "/admin/laporan",
      icon: FolderOpen,
    },
    {
      title: "Jenis Laporan",
      url: "/admin/jenis-laporan",
      icon: FileText,
    },
    {
      title: "Lokasi Pemilihan",
      url: "/admin/pemilihan/lokasi",
      icon: MapPin,
    },
  ];// Master Data items (accessible to admin/moderator)
  const masterDataItems = [
    {
      title: "Kategori File",
      url: "/admin/master-data/file-kategori",
      icon: FolderOpen,
    },
    {
      title: "Jabatan",
      url: "/admin/master-data/jabatan",
      icon: Briefcase,
    },
    {
      title: "Wilayah - Provinsi",
      url: "/admin/master-data/wilayah-provinsi",
      icon: MapPin,
    },
    {
      title: "Wilayah - Kota/Kabupaten",
      url: "/admin/master-data/wilayah-kota",
      icon: Building,
    },
    {
      title: "Wilayah - Kecamatan",
      url: "/admin/master-data/wilayah-kecamatan",
      icon: MapPin,
    },
    {
      title: "Wilayah - Kelurahan",
      url: "/admin/master-data/wilayah-kelurahan",
      icon: MapPin,
    },
  ];

  // Filter userItems to hide notifications for alumni (non-admin/non-moderator users)
  const filteredUserItems = userItems.filter(item => {
    if (item.title === 'Notifikasi' && !isAdmin) {
      return false; // Hide notifications for alumni
    }
    return true;
  });

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r bg-sidebar data-[state=collapsed]:w-14 md:data-[state=collapsed]:w-16 sidebar-mobile-optimized"
    >      <SidebarHeader className="py-3 md:py-4 px-2 md:px-4">
        <SidebarMenu>
          <SidebarMenuItem>            <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
              <Link href="/" onClick={handleMenuClick} className="flex items-center gap-2 md:gap-3">
                <Image src="/logo.svg" alt="logo" width={24} height={24} className="md:w-8 md:h-8 flex-shrink-0" />
                <span className="font-semibold text-sm md:text-base group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">Tren-Silapor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />      <SidebarContent>
        {/* PUBLIC SECTION - Always visible */}        <Collapsible open={isMainMenuOpen} onOpenChange={setIsMainMenuOpen} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2 py-1.5 text-sm font-medium transition-colors rounded-md">
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Menu Utama</span>
                  <span className="md:hidden">Menu</span>
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">                  {publicItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full">
                        <Link 
                          href={item.url}
                          onClick={handleMenuClick}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group"
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="hidden md:inline truncate">{item.title}</span>
                          <span className="md:hidden text-xs truncate max-w-[80px]">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>        {/* USER SECTION - Only visible when authenticated */}
        {isAuthenticated && (
          <Collapsible open={isAlumniMenuOpen} onOpenChange={setIsAlumniMenuOpen} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2 py-1.5 text-sm font-medium transition-colors rounded-md">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Menu Pegawai</span>
                    <span className="md:hidden">Pegawai</span>
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">                    {filteredUserItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="w-full">
                          <Link 
                            href={item.url}
                            onClick={handleMenuClick}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden md:inline truncate">{item.title}</span>
                            <span className="md:hidden text-xs truncate max-w-[80px]">
                              {item.title.split(' ')[0]}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}        {/* USER PROFILE SECTION - Only visible when authenticated */}
        {isAuthenticated && (
          <Collapsible open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-2 py-1.5 text-sm font-medium transition-colors rounded-md">
                  <span className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Profil Saya</span>
                    <span className="md:hidden">Profil</span>
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="w-full">
                        <Link 
                          href="/pegawai/edit"
                          onClick={handleMenuClick}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group"
                        >
                          <Edit className="h-4 w-4 flex-shrink-0" />
                          <span className="hidden md:inline truncate">Edit Pegawai</span>
                          <span className="md:hidden text-xs truncate">Edit</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="w-full">
                        <Link 
                          href="/reset-password" 
                          target="_blank"
                          onClick={handleMenuClick}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group"
                        >
                          <Key className="h-4 w-4 flex-shrink-0" />
                          <span className="hidden md:inline truncate">Ganti Password</span>
                          <span className="md:hidden text-xs truncate">Password</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
          {/* ADMIN PEGAWAI SECTION - Only visible for admin/moderator */}
        {isAuthenticated && isAdmin && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  <Users className="mr-2 h-4 w-4" />
                  Administrasi Pegawai
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>                    {adminPegawaiItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url} onClick={handleMenuClick}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* ADMIN PEMILIHAN SECTION - Only visible for admin/moderator */}
        {isAuthenticated && isAdmin && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  <Vote className="mr-2 h-4 w-4" />
                  Administrasi Pemilihan
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>                    {adminPemilihanItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url} onClick={handleMenuClick}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* MASTER DATA SECTION - Only visible for admin/moderator */}
        {isAuthenticated && isAdmin && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  <Database className="mr-2 h-4 w-4" />
                  Master Data
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>                    {masterDataItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url} onClick={handleMenuClick}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>      <SidebarFooter className="p-2 md:p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <div className="flex items-center space-x-2 min-w-0">                      <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                        <AvatarImage 
                          src={user?.avatarUrl || 
                               (user?.biografi?.foto ? imageAPI.getImageUrl(user.biografi.foto) : 
                                user?.biografi?.fotoProfil ? imageAPI.getImageUrl(user.biografi.fotoProfil) : undefined)} 
                          alt={user?.fullName}
                        />
                        <AvatarFallback className="bg-blue-500 text-white text-xs md:text-sm">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0 hidden group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">
                        <div className="font-medium text-xs md:text-sm truncate">{user?.fullName}</div>
                        <div className="text-xs text-muted-foreground hidden md:block">{user?.role?.roleName || 'USER'}</div>
                      </div>
                    </div>
                    <ChevronUp className="ml-auto h-3 w-3 md:h-4 md:w-4 hidden group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>                <DropdownMenuContent align="end" className="w-48 md:w-56">
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (              <SidebarMenuButton asChild className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Link href="/login" onClick={handleMenuClick} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">Masuk</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

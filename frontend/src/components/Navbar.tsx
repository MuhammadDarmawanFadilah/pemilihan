"use client";

import { LogOut, Moon, Settings, Sun, User, LogIn, UserCircle, Key, Newspaper, Home, FileText, CreditCard, Database, Users, Shield, MapPin, Building, Briefcase, Heart, Stethoscope, Gift, UserCheck, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { imageAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

const Navbar = () => {
  const { setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const isBeritaPage = pathname === "/berita" || pathname.startsWith("/berita/");

  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Semua');// Function to get page title and icon based on current path
  const getPageInfo = () => {
    if (pathname === "/") return { title: "Dashboard", icon: Home };
    if (pathname === "/documents") return { title: "Document Center", icon: FileText };
    if (pathname.startsWith("/biografi")) {
      if (pathname.includes("/edit")) return { title: "Edit Biografi", icon: UserCircle };
      if (pathname.includes("/create")) return { title: "Buat Biografi", icon: UserCircle };
      return { title: "Biografi Alumni", icon: UserCircle };
    }    if (pathname.startsWith("/berita")) return { title: "Portal Berita", icon: Newspaper };
    if (pathname.startsWith("/komunikasi")) return { title: "Komunikasi Kita", icon: MessageCircle };
    if (pathname.startsWith("/alumni-card")) return { title: "Kartu Alumni", icon: CreditCard };
    if (pathname.startsWith("/public-biografi")) return { title: "Profil Alumni", icon: UserCircle };
    if (pathname.startsWith("/admin")) {
      if (pathname.includes("/users")) return { title: "User Management", icon: Users };
      if (pathname.includes("/berita")) return { title: "Berita Management", icon: Newspaper };
      if (pathname.includes("/documents")) return { title: "Dokumen Management", icon: FileText };
      if (pathname.includes("/biografi")) return { title: "Biografi Management", icon: UserCircle };
      if (pathname.includes("/invitations")) return { title: "Histori Undangan", icon: Mail };
      if (pathname.includes("/approvals")) return { title: "Approval Undangan", icon: UserCheck };
      if (pathname.includes("/birthday")) return { title: "Birthday Admin", icon: Gift };
      if (pathname.includes("/master-data")) {
        if (pathname.includes("/spesialisasi")) return { title: "Spesialisasi Kedokteran", icon: Stethoscope };
        if (pathname.includes("/provinsi")) return { title: "Provinsi", icon: MapPin };
        if (pathname.includes("/kota")) return { title: "Kota/Kabupaten", icon: Building };
        if (pathname.includes("/posisi")) return { title: "Posisi & Pekerjaan", icon: Briefcase };
        if (pathname.includes("/hobi")) return { title: "Hobi & Minat", icon: Heart };
        if (pathname.includes("/agama")) return { title: "Agama", icon: Shield };
        return { title: "Master Data", icon: Database };
      }
      return { title: "Administration", icon: Settings };
    }
    if (pathname === "/reset-password") return { title: "Reset Password", icon: Key };
    if (pathname === "/login") return { title: "Login", icon: LogIn };
    if (pathname === "/register") return { title: "Register", icon: User };
    
    // Default fallback
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const title = segments[segments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { title, icon: FileText };
    }
    
    return { title: "Dashboard", icon: Home };
  };  // Sync search input with current search state (remove URL dependency)
  useEffect(() => {
    if (isBeritaPage && searchParams) {
      // Reset loading states
      setIsCategoryLoading(false);
    }
  }, [isBeritaPage, searchParams]);

  // Listen for category changes from BeritaPage
  useEffect(() => {
    const handleCategoryUpdate = (event: CustomEvent) => {
      setCurrentCategory(event.detail.category);
    };

    window.addEventListener('beritaCategoryChanged', handleCategoryUpdate as EventListener);
    
    return () => {
      window.removeEventListener('beritaCategoryChanged', handleCategoryUpdate as EventListener);
    };
  }, []);  const handleCategoryClick = useCallback((category: string) => {
    console.log('Navbar handleCategoryClick called with:', category);
    
    // Only work if we're on berita page
    if (!isBeritaPage) return;
    
    setIsCategoryLoading(true);
    setCurrentCategory(category); // Update local state immediately
    
    // Trigger custom event that BeritaPage can listen to
    const event = new CustomEvent('navbarCategoryChange', { 
      detail: { category: category } 
    });
    window.dispatchEvent(event);
    
    // Auto-clear loading state after a short delay
    setTimeout(() => {
      setIsCategoryLoading(false);
    }, 1000);
  }, [isBeritaPage]);
  
  return (
    <nav className={`p-4 flex items-center justify-between sticky top-0 bg-background z-10 border-b ${isBeritaPage ? 'shadow-md' : ''}`}>
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />        <div className="hidden sm:block">
          {/* Removed duplicate Portal Berita Alumni title */}
        </div>        {/* Quick Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 ml-6">
          <div className="flex items-center text-sm font-medium text-gray-800 dark:text-gray-200">
            {(() => {
              const pageInfo = getPageInfo();
              const IconComponent = pageInfo.icon;
              return (
                <>
                  <IconComponent className="h-4 w-4 mr-2" />
                  {pageInfo.title}
                </>
              );
            })()}
          </div>
        </div>        {/* News specific navigation - only shown on berita pages */}
        {isBeritaPage && (
          <div className="hidden md:flex items-center space-x-4 ml-6">
            {[
              { key: 'Semua', value: 'Semua' },
              { key: 'Akademik', value: 'AKADEMIK' },
              { key: 'Karir', value: 'KARIR' },
              { key: 'Alumni', value: 'ALUMNI' },
              { key: 'Teknologi', value: 'TEKNOLOGI' }
            ].map(({ key, value }) => {
              const isActive = currentCategory === value;
              const isLoadingThis = isCategoryLoading && currentCategory === value;
              
              return (
                <button 
                  key={key}
                  onClick={() => handleCategoryClick(value)}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-primary font-semibold border-b-2 border-primary' : 'hover:text-primary'
                  } ${isCategoryLoading ? 'opacity-50' : ''}`}
                  disabled={isCategoryLoading}
                >
                  {isLoadingThis ? (
                    <span className="flex items-center">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {key}
                    </span>
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
        {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* USER MENU */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger>              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.avatarUrl || 
                       (user?.biografi?.foto ? imageAPI.getImageUrl(user.biografi.foto) : 
                        user?.biografi?.fotoProfil ? imageAPI.getImageUrl(user.biografi.fotoProfil) : undefined)} 
                  alt={user?.fullName}
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role?.roleName || 'USER'}
                  </p>
                </div>
              </DropdownMenuLabel>              <DropdownMenuSeparator />              <DropdownMenuItem asChild>
                <Link href={`/biografi/${user?.id}/edit`}>
                  <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                  Edit Biografi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reset-password" target="_blank" rel="noopener noreferrer">
                  <Key className="h-[1.2rem] w-[1.2rem] mr-2" />
                  Reset Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default">
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

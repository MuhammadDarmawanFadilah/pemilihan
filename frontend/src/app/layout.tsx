import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientSidebarWrapper from "@/components/ClientSidebarWrapper";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import NetworkInitializer from "@/components/NetworkInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Pemilihan Bawaslu - Aplikasi Voting Online",
  description: "Sistem Pemilihan Bawaslu Online untuk Event Pemilihan - Progressive Web App",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.svg", sizes: "any", type: "image/svg+xml" }
    ],
    shortcut: "/icons/favicon-32x32.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pemilihan Bawaslu",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Sistem Pemilihan Bawaslu",
    title: "Sistem Pemilihan Bawaslu - Aplikasi Voting Online",
    description: "Sistem Pemilihan Bawaslu Online untuk Event Pemilihan",
  },
  twitter: {
    card: "summary",
    title: "Sistem Pemilihan Bawaslu",
    description: "Aplikasi Voting Online untuk Event Pemilihan",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA and Mobile Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#f69435" />
        <meta name="msapplication-navbutton-color" content="#f69435" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pemilihan Bawaslu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
  {/* Icons */}
  <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png" />
  <link rel="icon" href="/icons/favicon-16x16.png" sizes="16x16" type="image/png" />
  <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" type="image/png" />
  <link rel="shortcut icon" href="/icons/favicon-32x32.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Prevent zooming on iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        
        {/* Development scripts */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <script src="/network-filter.js" defer></script>
            <script src="/pwa-utils.js" defer></script>
          </>
        )}
        <script dangerouslySetInnerHTML={{
          __html: `
            let updateAvailable = false;
            
            // Listen for service worker messages
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATED') {
                  console.log('🔄 PWA Update Available:', event.data);
                  updateAvailable = true;
                  
                  // Show update notification
                  if (${process.env.NODE_ENV !== 'development'}) {
                    const showUpdate = () => {
                      const updateBanner = document.createElement('div');
                      updateBanner.id = 'pwa-update-banner';
                      updateBanner.style.cssText = \`
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        background: linear-gradient(135deg, #f69435, #f76b35);
                        color: white;
                        padding: 12px 20px;
                        text-align: center;
                        z-index: 9999;
                        font-family: system-ui, -apple-system, sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        cursor: pointer;
                        transition: all 0.3s ease;
                      \`;
                      updateBanner.innerHTML = \`
                        🔄 <strong>Versi Baru Tersedia!</strong> Klik untuk memperbarui aplikasi
                      \`;
                      updateBanner.onclick = () => {
                        window.location.reload();
                      };
                      
                      // Remove existing banner if any
                      const existing = document.getElementById('pwa-update-banner');
                      if (existing) existing.remove();
                      
                      document.body.appendChild(updateBanner);
                      
                      // Auto-hide after 10 seconds
                      setTimeout(() => {
                        if (updateBanner.parentNode) {
                          updateBanner.style.transform = 'translateY(-100%)';
                          setTimeout(() => updateBanner.remove(), 300);
                        }
                      }, 10000);
                    };
                    
                    // Show after a short delay to ensure page is loaded
                    setTimeout(showUpdate, 1000);
                  } else {
                    // Auto-refresh in development
                    console.log('🔄 Auto-refreshing in development mode...');
                    setTimeout(() => window.location.reload(), 1000);
                  }
                }
              });
            }
            
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered with scope: ', registration.scope);
                    
                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker installed
                            console.log('New service worker available');
                            if (${process.env.NODE_ENV === 'development'}) {
                              // Auto-refresh in development after short delay
                              setTimeout(() => window.location.reload(), 2000);
                            }
                            // In production, the message listener will handle the update notification
                          }
                        });
                      }
                    });

                    // Check for updates periodically
                    setInterval(() => {
                      registration.update();
                    }, 60000); // Check every minute
                  })
                  .catch(function(error) {
                    console.log('SW registration failed: ', error);
                  });
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
      >        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>            
            {process.env.NODE_ENV === 'development' && <NetworkInitializer />}
            <SidebarProvider defaultOpen={defaultOpen}>
              <ClientSidebarWrapper />              
              <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="w-full">{children}</div>
              </main>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardService, DashboardOverview, DashboardStats } from '@/services/dashboardService';
import OrganizationInfoCard from '@/components/dashboard/OrganizationInfoCard';
import QuickStatsCards from '@/components/dashboard/QuickStatsCards';
import MonthlyDataChart from '@/components/dashboard/MonthlyDataChart';
import ActivityFeedCard from '@/components/dashboard/ActivityFeedCard';
import RecentCommentsCard from '@/components/dashboard/RecentCommentsCard';
import { TrendingUp, Eye, MessageCircle, ThumbsUp, Download } from 'lucide-react';

const Dashboard = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Navigation functions with authentication check
  const navigateToDetail = (type: 'berita' | 'usulan' | 'documents' | 'biografi', id: number) => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login with return URL
      router.push(`/login?returnUrl=/${type}/${id}`);
      return;
    }
    
    // Navigate to the appropriate detail page
    router.push(`/${type}/${id}`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewData, statsData] = await Promise.all([
        DashboardService.getDashboardOverview(),
        DashboardService.getDashboardStats()
      ]);
      
      setOverview(overviewData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-80" />
                  <Skeleton className="h-6 w-96" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
          
          {/* Organization Info Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-1 h-8" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-1 h-8" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          </div>
          
          {/* Chart Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-1 h-8" />
              <Skeleton className="h-8 w-36" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          
          {/* Content Grid Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-1 h-8" />
              <Skeleton className="h-8 w-52" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Skeleton className="h-96 xl:col-span-2 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Terjadi Kesalahan
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gagal memuat data dashboard
                </p>
              </div>
            </div>
            <AlertDescription className="text-gray-700 dark:text-gray-300 mb-4">
              {error}
            </AlertDescription>
            <Button 
              variant="outline" 
              onClick={fetchDashboardData}
              className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Coba Lagi
            </Button>
          </Alert>
        </div>
      </div>
    );
  }
  if (!overview || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Data Tidak Tersedia
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada data yang dapat ditampilkan saat ini
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchDashboardData}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Alumni IDAU
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Selamat datang di sistem informasi alumni Unsoed
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse"></div>
                  <span>Sistem berjalan normal</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchDashboardData}
                disabled={loading}
                className="self-start sm:self-auto bg-white/50 hover:bg-white/80 dark:bg-gray-700/50 dark:hover:bg-gray-700/80 backdrop-blur-sm border-2 focus-ring"
              >
                <RefreshCw className={`w-5 h-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Organization Info Section */}
        <div className="space-y-4 fade-in-delay-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Informasi Organisasi
            </h2>
          </div>
          <OrganizationInfoCard organizationInfo={overview.organizationInfo} />
        </div>        {/* Quick Stats Section */}
        <div className="space-y-4 fade-in-delay-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Statistik Cepat
            </h2>
          </div>
          <QuickStatsCards quickStats={overview.quickStats} />
        </div>        {/* Analytics Section */}
        <div className="space-y-4 fade-in-delay-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analisis Data
            </h2>
          </div>
          <MonthlyDataChart monthlyData={overview.monthlyData} />
        </div>        {/* Content and Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Konten dan Aktivitas
            </h2>
          </div>
          
          {/* Popular Content - Full Width */}
          <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/10 to-red-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <CardHeader className="relative">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Konten Populer</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative">
              <Tabs defaultValue="news" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <TabsTrigger 
                    value="news"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 font-medium transition-all duration-200"
                  >
                    Berita Populer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="proposals"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 font-medium transition-all duration-200"
                  >
                    Usulan Terpopuler
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-600 font-medium transition-all duration-200"
                  >
                    Dokumen Populer
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="news" className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-4">
                    {stats.popularNews.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada berita populer</p>                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {stats.popularNews.map((news, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:bg-orange-50 dark:hover:bg-gray-600"
                            onClick={() => navigateToDetail('berita', news.id)}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400">
                              {news.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{news.viewCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{news.commentCount}</span>
                                </div>
                              </div>
                              <span>{news.publishDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                  <TabsContent value="proposals" className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4">
                    {stats.popularProposals.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada usulan populer</p>                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {stats.popularProposals.map((proposal, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:bg-blue-50 dark:hover:bg-gray-600"
                            onClick={() => navigateToDetail('usulan', proposal.id)}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
                              {proposal.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{proposal.voteCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{proposal.status}</span>
                                </div>
                              </div>
                              <span>{proposal.createdDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                  <TabsContent value="documents" className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4">
                    {stats.popularDocuments.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada dokumen populer</p>                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {stats.popularDocuments.map((document, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:bg-green-50 dark:hover:bg-gray-600"
                            onClick={() => navigateToDetail('documents', document.id)}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-green-600 dark:hover:text-green-400">
                              {document.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Download className="w-4 h-4" />
                                  <span>{document.downloadCount.toLocaleString()}</span>
                                </div>
                              </div>
                              <span>{document.uploadDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>          {/* Side by Side: Activity Feed and Recent Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="order-1 lg:order-1">
              <ActivityFeedCard activityFeed={overview.activityFeed} />
            </div>
            <div className="order-2 lg:order-2">
              <RecentCommentsCard recentComments={stats.recentComments} />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <p>© 2025 IDAU - Sistem Informasi Alumni Universitas Jenderal Soedirman</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthlyData } from '@/services/dashboardService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MonthlyDataChartProps {
  monthlyData: MonthlyData[];
}

export default function MonthlyDataChart({ monthlyData }: MonthlyDataChartProps) {
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#ef4444',
    accent: '#8b5cf6'
  };

  return (
    <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Analisis Data Bulanan
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Visualisasi aktivitas dan pertumbuhan sistem
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live Data</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 font-medium transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-600 font-medium transition-all duration-200"
            >
              Pengguna
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 font-medium transition-all duration-200"
            >
              Konten
            </TabsTrigger>
            <TabsTrigger 
              value="engagement"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 font-medium transition-all duration-200"
            >
              Engagement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.tertiary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.tertiary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="logins" 
                      stackId="1" 
                      stroke={chartColors.primary}
                      fill="url(#colorLogins)"
                      name="Login"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newMembers" 
                      stackId="1" 
                      stroke={chartColors.secondary}
                      fill="url(#colorMembers)"
                      name="Anggota Baru"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newsPublished" 
                      stackId="1" 
                      stroke={chartColors.tertiary}
                      fill="url(#colorNews)"
                      name="Berita"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, r: 6 }}
                      activeDot={{ r: 8, fill: chartColors.primary }}
                      name="Total Login"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newMembers" 
                      stroke={chartColors.secondary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.secondary, r: 6 }}
                      activeDot={{ r: 8, fill: chartColors.secondary }}
                      name="Anggota Baru"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="newsPublished" 
                      fill={chartColors.primary} 
                      name="Berita" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="proposalsSubmitted" 
                      fill={chartColors.secondary} 
                      name="Usulan"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="documentsUploaded" 
                      fill={chartColors.tertiary} 
                      name="Dokumen"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, r: 4 }}
                      name="Login"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newsPublished" 
                      stroke={chartColors.secondary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.secondary, r: 4 }}
                      name="Berita Dipublikasi"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="proposalsSubmitted" 
                      stroke={chartColors.tertiary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.tertiary, r: 4 }}
                      name="Usulan Diajukan"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

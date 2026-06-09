'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  BarChart3,
  TrendingUp,
  Users,
  Banknote,
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  AlertTriangle,
  Package,
  TrendingDown,
  Activity,
  Calendar,
  Star,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface WeekdayRevenue {
  day: string
  dayEn: string
  revenue: number
  cases: number
  paidCases: number
  avgRevenue: number
  weeksCount: number
}

interface AnalyticsData {
  today: {
    totalCases: number
    completedCases: number
    totalAmount: number
  }
  month: {
    totalCases: number
    completedCases: number
    totalAmount: number
  }
  statusCounts: {
    PENDING: number
    ACCEPTED: number
    EN_ROUTE: number
    INSPECTING: number
    PAID: number
  }
  messengerStats: { name: string; assigned: number; completed: number }[]
  timeline: { date: string; revenue: number; cases: number; completed: number; aov: number; maRevenue: number; maAov: number }[]
  revenueMetrics: {
    aov30d: number
    aovTrendPct: number
    revTrendPct: number
    totalRevenue30d: number
    totalPaid30d: number
    weekdayRevenue: WeekdayRevenue[]
    peakDay: string
    slowDay: string
  }
  inventorySummary: {
    totalItems: number
    lowStockCount: number
    healthyStockCount: number
    categoryVolume: { category: string; volume: number }[]
    categoryCounts: { category: string; count: number }[]
    lowStockAlerts: { sku: string; name: string; qty: number; min: number; category: string }[]
    criticalItems: { sku: string; name: string; qty: number; min: number; safetyRatio: number }[]
  }
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    fetch('/api/auth')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((userData) => {
        if (userData.role !== 'ADMIN' && userData.role !== 'MANAGER') {
          router.push('/dashboard')
          return
        }
        setUser(userData)
        fetch('/api/analytics')
          .then((res) => res.json())
          .then((d) => {
            setData(d)
            setLoading(false)
          })
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading || !user || !mounted || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 h-16 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-40 hidden sm:block" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <main className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-40 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)

  const statusMap = [
    { key: 'PENDING',    label: 'รอรับงาน (Pending)',          icon: ClipboardList, color: 'bg-amber-500' },
    { key: 'ACCEPTED',   label: 'รับงานแล้ว (Accepted)',       icon: CheckCircle2,  color: 'bg-blue-500' },
    { key: 'EN_ROUTE',   label: 'กำลังเดินทาง (En Route)',     icon: Navigation,    color: 'bg-indigo-500' },
    { key: 'INSPECTING', label: 'ตรวจสอบ (Inspecting)',        icon: ShieldAlert,   color: 'bg-purple-500' },
    { key: 'PAID',       label: 'จบงานสำเร็จ (Paid)',          icon: Banknote,      color: 'bg-emerald-500' },
  ]
  const maxStatusCount = Math.max(...Object.values(data.statusCounts))

  const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs">
        <p className="font-bold text-zinc-500 mb-1">{label}</p>
        {payload.map((e: any, i: number) => (
          <p key={i} className="font-semibold" style={{ color: e.color }}>
            {e.name.includes('รายได้') || e.name.includes('AOV')
              ? `${e.name}: ${formatCurrency(e.value)}`
              : `${e.name}: ${e.value} เคส`}
          </p>
        ))}
      </div>
    )
  }

  const rm = data.revenueMetrics

  const CriticalTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const item = payload[0].payload
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-md shadow-md text-xs space-y-0.5">
        <p className="font-bold text-zinc-900 dark:text-zinc-50">{item.name}</p>
        <p className="text-zinc-400">SKU: {item.sku}</p>
        <p className="font-semibold" style={{ color: item.safetyRatio === 0 ? '#ef4444' : item.safetyRatio <= 50 ? '#f97316' : '#f59e0b' }}>
          Safety: {item.safetyRatio}%
        </p>
        <p className="text-zinc-500">จำนวน: {item.qty} / ขั้นต่ำ: {item.min}</p>
      </div>
    )
  }

  const inv = data.inventorySummary

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased pb-16">

        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 h-16 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <BarChart3 className="size-4" />
              </span>
              <span className="font-bold text-lg tracking-tight">Executive Analytics</span>
            </div>
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">กลับหน้าบอร์ดงาน</span>
                  <span className="sm:hidden">กลับ</span>
                </Button>
              } />
              <TooltipContent side="bottom">กลับหน้าบอร์ดงาน</TooltipContent>
            </Tooltip>
          </div>
        </nav>

        <main className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">

          {/* ── KPI Row ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 slide-up">

            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-zinc-500">รายได้วันนี้</p>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Banknote className="size-5" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(data.today.totalAmount)}</h2>
                <p className="text-xs mt-2 text-zinc-500">เฉลี่ยเดือนนี้: <span className="font-semibold">{formatCurrency(data.month.totalAmount / 30)}</span>/วัน</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-zinc-500">งานวันนี้</p>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <ClipboardList className="size-5" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{data.today.totalCases} <span className="text-sm font-normal text-zinc-500">เคส</span></h2>
                <p className="text-xs mt-2 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> จบงานแล้ว {data.today.completedCases} เคส
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-zinc-500">สินค้าต้องสั่งซื้อ</p>
                  <div className={`p-2 rounded-lg ${inv.lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'}`}>
                    <AlertTriangle className="size-5" />
                  </div>
                </div>
                <h2 className={`text-3xl font-bold tracking-tight ${inv.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                  {inv.lowStockCount} <span className="text-sm font-normal text-zinc-500">รายการ</span>
                </h2>
                <p className="text-xs mt-2 text-zinc-500">จากทั้งหมด {inv.totalItems} รายการในคลัง</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-zinc-500">รายได้เดือนนี้</p>
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="size-5" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(data.month.totalAmount)}</h2>
                <p className="text-xs mt-2 text-zinc-500">งานเดือนนี้: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{data.month.totalCases} เคส</span></p>
              </CardContent>
            </Card>

          </div>

          {/* ── 💰 Financial & Revenue Trends ─────────────────────────────── */}
          <div className="slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="size-5 text-emerald-500" />
              <h2 className="text-lg font-bold tracking-tight">💰 Financial & Revenue Trends (30 วันล่าสุด)</h2>
            </div>

            {/* AOV KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

              {/* AOV 30d */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-zinc-500">AOV (เฉลี่ย/งาน)</p>
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{formatCurrency(rm.aov30d)}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    {rm.aovTrendPct >= 0
                      ? <TrendingUp className="size-3 text-emerald-500" />
                      : <TrendingDown className="size-3 text-rose-500" />}
                    <p className={`text-xs font-semibold ${rm.aovTrendPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {rm.aovTrendPct >= 0 ? '+' : ''}{rm.aovTrendPct}% vs สัปดาห์ก่อน
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Revenue 30d */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-zinc-500">รายได้รวม 30 วัน</p>
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                      <Banknote className="size-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{formatCurrency(rm.totalRevenue30d)}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    {rm.revTrendPct >= 0
                      ? <TrendingUp className="size-3 text-emerald-500" />
                      : <TrendingDown className="size-3 text-rose-500" />}
                    <p className={`text-xs font-semibold ${rm.revTrendPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {rm.revTrendPct >= 0 ? '+' : ''}{rm.revTrendPct}% (7 วันล่าสุด vs ก่อนหน้า)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Paid orders 30d */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-zinc-500">งานที่ชำระแล้ว 30 วัน</p>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="size-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{rm.totalPaid30d} <span className="text-sm font-normal text-zinc-500">เคส</span></h3>
                  <p className="text-xs mt-2 text-zinc-500">AOV รวม {formatCurrency(rm.aov30d)} ต่องาน</p>
                </CardContent>
              </Card>

            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 30-day Revenue Area Chart with 7-day MA */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="size-5 text-emerald-500" />
                      แนวโน้มรายได้รายวัน (30 วันล่าสุด)
                    </CardTitle>
                    <p className="text-xs text-zinc-500 mt-0.5">ยอดรับเงินโอนที่ชำระเสร็จสิ้น (สถานะ PAID) รายวัน + เส้นเฉลี่ย 7 วัน</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200">THB</Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-70">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev30" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                        <XAxis
                          dataKey="date"
                          stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                          width={40}
                        />
                        <ChartTooltip content={<RevenueTooltip />} />
                        <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Area
                          type="monotone" dataKey="revenue" name="รายได้ประจำวัน"
                          stroke="#10b981" strokeWidth={2}
                          fill="url(#colorRev30)" dot={false} activeDot={{ r: 5, fill: '#10b981' }}
                        />
                        <Line
                          type="monotone" dataKey="maRevenue" name="เฉลี่ย 7 วัน (MA)"
                          stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3"
                          dot={false} activeDot={{ r: 4, fill: '#f59e0b' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AOV Trend Line Chart with 7-day MA */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="size-5 text-violet-500" />
                      Average Order Value (AOV) Trend
                    </CardTitle>
                    <p className="text-xs text-zinc-500 mt-0.5">มูลค่าเฉลี่ยต่องาน PAID รายวัน + เฉลี่ย 7 วัน — เพิ่มขึ้น = deal size ใหญ่ขึ้น</p>
                  </div>
                  <Badge className="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200">AOV</Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-70">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                        <XAxis
                          dataKey="date"
                          stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                          width={40}
                        />
                        <ChartTooltip content={<RevenueTooltip />} />
                        <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Line
                          type="monotone" dataKey="aov" name="AOV รายวัน"
                          stroke="#8b5cf6" strokeWidth={2}
                          dot={false} activeDot={{ r: 5, fill: '#8b5cf6' }}
                          connectNulls
                        />
                        <Line
                          type="monotone" dataKey="maAov" name="AOV เฉลี่ย 7 วัน"
                          stroke="#ec4899" strokeWidth={2} strokeDasharray="6 3"
                          dot={false} activeDot={{ r: 4, fill: '#ec4899' }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* ── Day-of-Week Revenue Analysis ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.08s' }}>

            {/* Day-of-Week Revenue Bar Chart */}
            <Card className="lg:col-span-2 border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="size-5 text-blue-500" />
                    รายได้เฉลี่ยตามวันในสัปดาห์ (30 วัน)
                  </CardTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">ค่าเฉลี่ยรายได้ PAID แยกตามวันจันทร์–อาทิตย์ — ช่วยระบุวันที่ยอดสูงสุด</p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200">Peak Day</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-70">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={rm.weekdayRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWeekday" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"  stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis
                        dataKey="day"
                        stroke="#888" fontSize={11} tickLine={false} axisLine={false}
                      />
                      <YAxis
                        stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                        width={40}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }: any) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs space-y-1">
                              <p className="font-bold text-zinc-700 dark:text-zinc-300">{d.day} ({d.dayEn})</p>
                              <p className="text-blue-600 font-semibold">เฉลี่ย/วัน: {formatCurrency(d.avgRevenue)}</p>
                              <p className="text-zinc-500">รวมทั้งหมด: {formatCurrency(d.revenue)}</p>
                              <p className="text-zinc-500">PAID: {d.paidCases} เคส ({d.weeksCount} สัปดาห์)</p>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="avgRevenue" name="รายได้เฉลี่ย/วัน" radius={[6, 6, 0, 0]}>
                        {rm.weekdayRevenue.map((entry, i) => (
                          <Cell
                            key={`wd-${i}`}
                            fill={entry.day === rm.peakDay ? '#10b981' : entry.day === rm.slowDay ? '#f97316' : 'url(#colorWeekday)'}
                            opacity={entry.day === rm.peakDay || entry.day === rm.slowDay ? 1 : 0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Peak / Slow day insight cards */}
            <div className="flex flex-col gap-4">

              {/* Peak day */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow flex-1">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <Star className="size-4" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">วันที่ยอดสูงสุด (Peak Day)</p>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                    {rm.peakDay}
                  </h3>
                  <p className="text-xs mt-2 text-zinc-500">
                    เฉลี่ย {formatCurrency(rm.weekdayRevenue.find(d => d.day === rm.peakDay)?.avgRevenue || 0)} / วัน
                  </p>
                  <p className="text-[10px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium">ยอดรวม {rm.weekdayRevenue.find(d => d.day === rm.peakDay)?.paidCases || 0} เคส PAID</p>
                </CardContent>
              </Card>

              {/* Slow day */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow flex-1">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                      <Zap className="size-4" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">วันที่ยอดต่ำสุด (Slow Day)</p>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                    {rm.slowDay}
                  </h3>
                  <p className="text-xs mt-2 text-zinc-500">
                    เฉลี่ย {formatCurrency(rm.weekdayRevenue.find(d => d.day === rm.slowDay)?.avgRevenue || 0)} / วัน
                  </p>
                  <p className="text-[10px] mt-1 text-orange-600 dark:text-orange-400 font-medium">ยอดรวม {rm.weekdayRevenue.find(d => d.day === rm.slowDay)?.paidCases || 0} เคส PAID</p>
                </CardContent>
              </Card>

              {/* Volume summary mini card */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-zinc-900 shadow-sm hover:shadow-md transition-shadow flex-1">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      <Activity className="size-4" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">ปริมาณงานรายวัน</p>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {Math.round(rm.weekdayRevenue.reduce((s, d) => s + d.cases, 0) / 7)}
                    <span className="text-sm font-normal text-zinc-500 ml-1">เคส/วัน</span>
                  </h3>
                  <p className="text-xs mt-2 text-zinc-500">
                    รวม {rm.weekdayRevenue.reduce((s, d) => s + d.cases, 0)} เคสใน 30 วัน
                  </p>
                </CardContent>
              </Card>

            </div>

          </div>

          {/* ── Inventory Health Row ──────────────────────────────────────── */}
          <div className="slide-up" style={{ animationDelay: '0.16s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="size-5 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight">📦 Inventory & Stock Health</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── 1. Low Stock Alert Indicator (Donut) ────────────────── */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    Low Stock Indicator
                  </CardTitle>
                  <p className="text-xs text-zinc-500">สัดส่วน In Stock vs Need to Order</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="h-45 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'ปกติ (In Stock)',           value: inv.healthyStockCount },
                            { name: 'ต้องสั่งเพิ่ม (Need to Order)', value: inv.lowStockCount },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={52} outerRadius={76}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <ChartTooltip formatter={(value: any, name: any) => [`${value} รายการ`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center pointer-events-none">
                      <span className="text-2xl font-bold">
                        {inv.totalItems > 0 ? Math.round((inv.lowStockCount / inv.totalItems) * 100) : 0}%
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Need Order</span>
                    </div>
                  </div>
                  <div className="w-full flex justify-around mt-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">ปกติ: {inv.healthyStockCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                      <span className="text-zinc-600 dark:text-zinc-400">ต้องสั่ง: {inv.lowStockCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── 2. Stock Volume by Category (Donut) ─────────────────── */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="size-4 text-indigo-500" />
                    Stock Volume by Category
                  </CardTitle>
                  <p className="text-xs text-zinc-500">ปริมาณสินค้ารวมแยกตามหมวดหมู่ (ชิ้น)</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {inv.categoryVolume.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400 text-sm">ไม่มีข้อมูลสินค้า</div>
                  ) : (
                    <>
                      <div className="h-45 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <PieChart>
                            <Pie
                              data={inv.categoryVolume}
                              cx="50%" cy="50%"
                              innerRadius={52} outerRadius={76}
                              paddingAngle={4}
                              dataKey="volume"
                              nameKey="category"
                            >
                              {inv.categoryVolume.map((_, i) => (
                                <Cell key={`cv-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} ชิ้น`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center pointer-events-none">
                          <span className="text-xl font-bold">
                            {inv.categoryVolume.reduce((s, c) => s + c.volume, 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Qty</span>
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 max-h-25 overflow-y-auto pr-1">
                        {inv.categoryVolume.map((cat, i) => (
                          <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="truncate text-zinc-600 dark:text-zinc-400 font-medium">{cat.category}</span>
                            <span className="ml-auto font-bold text-zinc-500">{cat.volume.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ── 3. Critical Items Bar Chart ──────────────────────────── */}
              <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="size-4 text-rose-500" />
                    Critical Items (Safety Level %)
                  </CardTitle>
                  <p className="text-xs text-zinc-500">8 รายการใกล้หมดคลังที่สุด — ต่ำกว่า 100% = วิกฤต</p>
                </CardHeader>
                <CardContent>
                  {inv.criticalItems.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-2 text-center text-zinc-400 text-sm">
                      <CheckCircle2 className="size-8 text-emerald-500" />
                      <span>ไม่มีสินค้าคลังวิกฤต</span>
                    </div>
                  ) : (
                    <div className="h-65">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                          data={inv.criticalItems}
                          layout="vertical"
                          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                          <XAxis
                            type="number"
                            domain={[0, 'dataMax + 20']}
                            stroke="#888" fontSize={10}
                            tickLine={false} axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#888" fontSize={9}
                            tickLine={false} axisLine={false}
                            width={76}
                            tickFormatter={(v: string) => v.length > 11 ? v.slice(0, 10) + '…' : v}
                          />
                          <ChartTooltip content={<CriticalTooltip />} />
                          <Bar dataKey="safetyRatio" name="Safety Level %" radius={[0, 4, 4, 0]}>
                            {inv.criticalItems.map((entry, i) => (
                              <Cell
                                key={`crit-${i}`}
                                fill={entry.safetyRatio === 0 ? '#ef4444' : entry.safetyRatio <= 50 ? '#f97316' : '#f59e0b'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* ── Low-Stock Alert Detail List ────────────────────────────────── */}
          {inv.lowStockAlerts.length > 0 && (
            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm slide-up" style={{ animationDelay: '0.22s' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="size-5 text-amber-500" />
                    รายละเอียดสินค้าถึงจุดสั่งซื้อ (Reorder Alerts)
                  </CardTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">สินค้าที่ stock_qty ≤ min_order_point ทั้งหมด</p>
                </div>
                <Badge variant="destructive" className="animate-pulse">ต้องสั่ง {inv.lowStockCount} ชิ้น</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 pr-2">
                  <div className="space-y-2">
                    {inv.lowStockAlerts.map((item) => {
                      const pct = item.min > 0 ? Math.min((item.qty / item.min) * 100, 100) : 0
                      return (
                        <div
                          key={item.sku}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-950/30 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{item.name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.sku}</Badge>
                              <Badge className="text-[10px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{item.category}</Badge>
                            </div>
                            <p className="text-xs text-zinc-500">
                              จำนวน: <span className={`font-bold ${item.qty === 0 ? 'text-rose-500' : 'text-amber-500'}`}>{item.qty}</span>
                              {' '}/ ขั้นต่ำ: {item.min}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 sm:w-36 shrink-0">
                            <Progress value={pct} className="flex-1">
                              <ProgressTrack className="h-1.5 bg-zinc-100 dark:bg-zinc-800">
                                <ProgressIndicator className={`${item.qty === 0 ? 'bg-rose-500' : 'bg-amber-500'} rounded-full`} />
                              </ProgressTrack>
                            </Progress>
                            {item.qty === 0
                              ? <Badge className="bg-rose-500 hover:bg-rose-600 text-white shrink-0">Out of Stock</Badge>
                              : <Badge className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">Reorder</Badge>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* ── Delivery Status + Messenger ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up" style={{ animationDelay: '0.28s' }}>

            {/* Status Breakdown */}
            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="size-5 text-indigo-500" />
                  สถานะงานในระบบ
                </CardTitle>
                <p className="text-xs text-zinc-500">สัดส่วนความคืบหน้าของงานทั้งหมด</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {statusMap.map((s) => {
                  const count = data.statusCounts[s.key as keyof AnalyticsData['statusCounts']] || 0
                  const pct   = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0
                  const Icon  = s.icon
                  return (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 font-medium">
                          <Icon className="size-4 text-zinc-500" />
                          {s.label}
                        </div>
                        <Badge variant="outline" className="font-bold border-zinc-300 dark:border-zinc-700">{count} เคส</Badge>
                      </div>
                      <Progress value={pct}>
                        <ProgressTrack className="h-2 bg-zinc-100 dark:bg-zinc-800">
                          <ProgressIndicator className={`${s.color} rounded-full`} />
                        </ProgressTrack>
                      </Progress>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Messenger Performance */}
            <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="size-5 text-purple-500" />
                  อัตราทำงานสำเร็จของ Messenger
                </CardTitle>
                <p className="text-xs text-zinc-500">งานที่มอบหมาย vs งานที่จบชำระเงินแล้ว</p>
              </CardHeader>
              <CardContent>
                {data.messengerStats.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400 text-sm">ยังไม่มีข้อมูลผู้รับผิดชอบงาน</div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-50">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                          data={data.messengerStats.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                          <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} tickLine={false} axisLine={false} width={80} />
                          <ChartTooltip />
                          <Legend verticalAlign="top" height={32} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="assigned"  name="งานที่มอบหมาย" fill="#818cf8" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="completed" name="งานที่สำเร็จ"   fill="#34d399" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <ScrollArea className="max-h-35">
                      <div className="space-y-1.5">
                        {data.messengerStats.map((ms, i) => {
                          const rate = ms.assigned > 0 ? Math.round((ms.completed / ms.assigned) * 100) : 0
                          return (
                            <div key={ms.name} className="flex items-center justify-between px-3 py-2 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
                              <div className="flex items-center gap-2">
                                <Avatar size="sm">
                                  <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold">#{i + 1}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{ms.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500">เสร็จ {ms.completed}/{ms.assigned}</span>
                                <Badge className={rate >= 80 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' : 'bg-amber-500/10 text-amber-600 border border-amber-200'}>
                                  {rate}%
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </main>
      </div>
    </TooltipProvider>
  )
}

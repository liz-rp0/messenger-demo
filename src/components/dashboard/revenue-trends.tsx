'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
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

interface RevenueData {
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
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs">
      <p className="font-bold text-zinc-500 mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: e.color }}>
          {e.name.includes('รายได้') || e.name.includes('AOV') || e.name.includes('เฉลี่ย')
            ? `${e.name}: ${formatCurrency(e.value)}`
            : `${e.name}: ${e.value} เคส`}
        </p>
      ))}
    </div>
  )
}

export function RevenueTrends() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลการเงินและรายได้ (Unauthorized)')
          }
          throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (สถานะ: ${res.status})`)
        }
        return res.json()
      })
      .then((d) => {
        if (d.error) {
          throw new Error(d.error)
        }
        if (!d.revenueMetrics || !d.timeline) {
          throw new Error('ไม่พบข้อมูลรูปแบบที่ถูกต้อง')
        }
        setData({ timeline: d.timeline, revenueMetrics: d.revenueMetrics })
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 px-4 lg:px-6">
        <Skeleton className="h-6 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-70 w-full rounded-lg" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || !data.revenueMetrics || !data.timeline) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <TrendingDown className="size-10 text-rose-500 mb-3" />
            <h3 className="text-lg font-bold text-rose-500 mb-1">ไม่สามารถโหลดข้อมูลการเงินและรายได้</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const rm = data.revenueMetrics

  return (
    <div className="space-y-6 px-4 lg:px-6">

      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Banknote className="size-5 text-emerald-500" />
        <h2 className="text-lg font-bold tracking-tight">💰 Financial & Revenue Trends (30 วันล่าสุด)</h2>
      </div>

      {/* AOV KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* AOV 30d */}
        <Card className="bg-linear-to-t from-emerald-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">AOV (เฉลี่ย/งาน)</p>
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
        <Card className="bg-linear-to-t from-indigo-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">รายได้รวม 30 วัน</p>
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
        <Card className="bg-linear-to-t from-blue-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">งานที่ชำระแล้ว 30 วัน</p>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{rm.totalPaid30d} <span className="text-sm font-normal text-muted-foreground">เคส</span></h3>
            <p className="text-xs mt-2 text-muted-foreground">AOV รวม {formatCurrency(rm.aov30d)} ต่องาน</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 30-day Revenue Area Chart with 7-day MA */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="size-5 text-emerald-500" />
                แนวโน้มรายได้รายวัน (30 วัน)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">PAID รายวัน + เส้นเฉลี่ย 7 วัน</p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">THB</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-70">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={40} />
                  <ChartTooltip content={<RevenueTooltip />} />
                  <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" name="รายได้ประจำวัน" stroke="#10b981" strokeWidth={2} fill="url(#colorRevDash)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="maRevenue" name="เฉลี่ย 7 วัน (MA)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AOV Trend Line Chart with 7-day MA */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-5 text-violet-500" />
                Average Order Value (AOV) Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">AOV รายวัน + เฉลี่ย 7 วัน — เพิ่มขึ้น = deal size ใหญ่ขึ้น</p>
            </div>
            <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20">AOV</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-70">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={40} />
                  <ChartTooltip content={<RevenueTooltip />} />
                  <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="aov" name="AOV รายวัน" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#8b5cf6' }} connectNulls />
                  <Line type="monotone" dataKey="maAov" name="AOV เฉลี่ย 7 วัน" stroke="#ec4899" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: '#ec4899' }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Day-of-Week Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Day-of-Week Revenue Bar Chart */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-5 text-blue-500" />
                รายได้เฉลี่ยตามวันในสัปดาห์ (30 วัน)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">ค่าเฉลี่ยรายได้ PAID แยกตามวันจันทร์–อาทิตย์ — ช่วยระบุวันที่ยอดสูงสุด</p>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Peak Day</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-70">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={rm.weekdayRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeekdayDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="day" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={40} />
                  <ChartTooltip
                    content={({ active, payload }: any) => {
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
                        fill={entry.day === rm.peakDay ? '#10b981' : entry.day === rm.slowDay ? '#f97316' : 'url(#colorWeekdayDash)'}
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
          <Card className="bg-linear-to-t from-emerald-500/5 to-card shadow-xs flex-1">
            <CardContent className="p-5 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <Star className="size-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">วันที่ยอดสูงสุด (Peak Day)</p>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                {rm.peakDay}
              </h3>
              <p className="text-xs mt-2 text-muted-foreground">
                เฉลี่ย {formatCurrency(rm.weekdayRevenue.find(d => d.day === rm.peakDay)?.avgRevenue || 0)} / วัน
              </p>
              <p className="text-[10px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium">ยอดรวม {rm.weekdayRevenue.find(d => d.day === rm.peakDay)?.paidCases || 0} เคส PAID</p>
            </CardContent>
          </Card>

          {/* Slow day */}
          <Card className="bg-linear-to-t from-orange-500/5 to-card shadow-xs flex-1">
            <CardContent className="p-5 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                  <Zap className="size-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">วันที่ยอดต่ำสุด (Slow Day)</p>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                {rm.slowDay}
              </h3>
              <p className="text-xs mt-2 text-muted-foreground">
                เฉลี่ย {formatCurrency(rm.weekdayRevenue.find(d => d.day === rm.slowDay)?.avgRevenue || 0)} / วัน
              </p>
              <p className="text-[10px] mt-1 text-orange-600 dark:text-orange-400 font-medium">ยอดรวม {rm.weekdayRevenue.find(d => d.day === rm.slowDay)?.paidCases || 0} เคส PAID</p>
            </CardContent>
          </Card>

          {/* Volume summary */}
          <Card className="bg-linear-to-t from-blue-500/5 to-card shadow-xs flex-1">
            <CardContent className="p-5 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Activity className="size-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">ปริมาณงานรายวัน</p>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {Math.round(rm.weekdayRevenue.reduce((s, d) => s + d.cases, 0) / 7)}
                <span className="text-sm font-normal text-muted-foreground ml-1">เคส/วัน</span>
              </h3>
              <p className="text-xs mt-2 text-muted-foreground">
                รวม {rm.weekdayRevenue.reduce((s, d) => s + d.cases, 0)} เคสใน 30 วัน
              </p>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}

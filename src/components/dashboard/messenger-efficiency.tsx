'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  ClipboardList,
  Banknote,
  TrendingUp,
} from 'lucide-react'
import {
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

interface MessengerStat {
  name: string
  assigned: number
  completed: number
  revenue: number
  rate: number
  statuses: { PENDING: number; ACCEPTED: number; EN_ROUTE: number; INSPECTING: number; PAID: number }
  inProgress: number
}

interface MessengerData {
  messengerStats: MessengerStat[]
  statusCounts: { PENDING: number; ACCEPTED: number; EN_ROUTE: number; INSPECTING: number; PAID: number }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)

// Color scale for completion rate
const getRateColor = (rate: number) => {
  if (rate >= 80) return '#10b981'
  if (rate >= 60) return '#f59e0b'
  if (rate >= 40) return '#f97316'
  return '#ef4444'
}

const getRateBadge = (rate: number) => {
  if (rate >= 80) return { label: 'ยอดเยี่ยม', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
  if (rate >= 60) return { label: 'ปานกลาง', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
  return { label: 'ต้องปรับปรุง', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#3b82f6',
  EN_ROUTE: '#6366f1',
  INSPECTING: '#8b5cf6',
  PAID: '#10b981',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'รอรับงาน',
  ACCEPTED: 'รับงานแล้ว',
  EN_ROUTE: 'กำลังเดินทาง',
  INSPECTING: 'ตรวจสอบ',
  PAID: 'จบงาน',
}

export function MessengerEfficiency() {
  const [data, setData] = useState<MessengerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลประสิทธิภาพเมสเซนเจอร์ (Unauthorized)')
          }
          throw new Error(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (สถานะ: ${res.status})`)
        }
        return res.json()
      })
      .then((d) => {
        if (d.error) {
          throw new Error(d.error)
        }
        if (!d.messengerStats || !d.statusCounts) {
          throw new Error('ไม่พบข้อมูลประสิทธิภาพในรูปแบบที่ถูกต้อง')
        }
        setData({ messengerStats: d.messengerStats, statusCounts: d.statusCounts })
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-80 w-full rounded-lg" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || !data.messengerStats || !data.statusCounts) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="size-10 text-rose-500 mb-3" />
            <h3 className="text-lg font-bold text-rose-500 mb-1">ไม่สามารถโหลดข้อมูลประสิทธิภาพเมสเซนเจอร์</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const messengers = data.messengerStats
  const sc = data.statusCounts

  // Top performer
  const topPerformer = messengers.length > 0 ? messengers.reduce((best, m) => m.rate > best.rate ? m : best, messengers[0]) : null

  // Total in-progress (bottleneck)
  const totalInProgress = sc.ACCEPTED + sc.EN_ROUTE + sc.INSPECTING
  const totalAssigned = messengers.reduce((s, m) => s + m.assigned, 0)

  // Bottleneck data for funnel-style bar chart
  const bottleneckData = [
    { status: 'รอรับงาน', statusKey: 'PENDING', count: sc.PENDING, color: STATUS_COLORS.PENDING },
    { status: 'รับงานแล้ว', statusKey: 'ACCEPTED', count: sc.ACCEPTED, color: STATUS_COLORS.ACCEPTED },
    { status: 'กำลังเดินทาง', statusKey: 'EN_ROUTE', count: sc.EN_ROUTE, color: STATUS_COLORS.EN_ROUTE },
    { status: 'ตรวจสอบ', statusKey: 'INSPECTING', count: sc.INSPECTING, color: STATUS_COLORS.INSPECTING },
    { status: 'จบงาน (PAID)', statusKey: 'PAID', count: sc.PAID, color: STATUS_COLORS.PAID },
  ]

  return (
    <div className="space-y-6 px-4 lg:px-6">

      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Users className="size-5 text-purple-500" />
        <h2 className="text-lg font-bold tracking-tight">🛵 Messenger Efficiency & Performance</h2>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Top performer */}
        <Card className="bg-linear-to-t from-emerald-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">Top Performer</p>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Trophy className="size-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 truncate">
              {topPerformer?.name || '-'}
            </h3>
            <p className="text-xs mt-1.5 text-muted-foreground">
              อัตราสำเร็จ <span className="font-bold text-emerald-600">{topPerformer?.rate || 0}%</span> ({topPerformer?.completed || 0}/{topPerformer?.assigned || 0} เคส)
            </p>
          </CardContent>
        </Card>

        {/* Avg completion rate */}
        <Card className="bg-linear-to-t from-blue-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">อัตราสำเร็จเฉลี่ย</p>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              {totalAssigned > 0 ? Math.round((messengers.reduce((s, m) => s + m.completed, 0) / totalAssigned) * 100) : 0}%
            </h3>
            <p className="text-xs mt-1.5 text-muted-foreground">
              จาก {messengers.length} Messenger
            </p>
          </CardContent>
        </Card>

        {/* In-progress bottleneck */}
        <Card className={`bg-linear-to-t shadow-xs ${totalInProgress > 0 ? 'from-amber-500/5 to-card' : 'from-primary/5 to-card'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">งานค้างระหว่างทาง</p>
              <div className={`p-2 rounded-lg ${totalInProgress > 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold tracking-tight ${totalInProgress > 5 ? 'text-amber-600' : ''}`}>
              {totalInProgress} <span className="text-sm font-normal text-muted-foreground">เคส</span>
            </h3>
            <p className="text-xs mt-1.5 text-muted-foreground">
              ACCEPTED {sc.ACCEPTED} · EN_ROUTE {sc.EN_ROUTE} · INSPECTING {sc.INSPECTING}
            </p>
          </CardContent>
        </Card>

        {/* Total revenue generated */}
        <Card className="bg-linear-to-t from-indigo-500/5 to-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">รายได้จาก Messenger</p>
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Banknote className="size-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              {formatCurrency(messengers.reduce((s, m) => s + m.revenue, 0))}
            </h3>
            <p className="text-xs mt-1.5 text-muted-foreground">
              ยอดรวมทุก Messenger
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Job Completion Rate Comparison */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Job Completion Rate (มอบหมาย vs สำเร็จ)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                เปรียบเทียบจำนวนงานที่มอบหมายกับงานที่ชำระเสร็จ (PAID) ต่อ Messenger
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Rate</Badge>
          </CardHeader>
          <CardContent>
            {messengers.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">ยังไม่มีข้อมูล Messenger</div>
            ) : (
              <div className="h-85">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart
                    data={messengers.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                    <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#888" fontSize={11}
                      tickLine={false} axisLine={false}
                      width={80}
                      tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 9) + '…' : v}
                    />
                    <ChartTooltip
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload as MessengerStat
                        const badge = getRateBadge(d.rate)
                        return (
                          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs space-y-1.5">
                            <p className="font-bold text-zinc-700 dark:text-zinc-300">{d.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500">มอบหมาย: {d.assigned}</span>
                              <span className="text-emerald-500">สำเร็จ: {d.completed}</span>
                            </div>
                            <p className="font-semibold" style={{ color: getRateColor(d.rate) }}>
                              อัตราสำเร็จ: {d.rate}% — {badge.label}
                            </p>
                            <p className="text-zinc-500">รายได้: {formatCurrency(d.revenue)}</p>
                          </div>
                        )
                      }}
                    />
                    <Legend verticalAlign="top" height={32} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="assigned" name="งานที่มอบหมาย" fill="#93c5fd" radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar dataKey="completed" name="งานที่สำเร็จ (PAID)" radius={[0, 4, 4, 0]} barSize={14}>
                      {messengers.slice(0, 8).map((entry, i) => (
                        <Cell key={`rate-${i}`} fill={getRateColor(entry.rate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Bottleneck Funnel */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                Status Bottlenecks (คอขวดตามสถานะ)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                จำนวนเคสที่ค้างในแต่ละสถานะ — ยิ่ง ACCEPTED/EN_ROUTE สูง ยิ่งต้องเร่ง
              </p>
            </div>
            <Badge variant="outline" className={`${totalInProgress > 5 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse' : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'}`}>
              {totalInProgress > 0 ? `${totalInProgress} ค้าง` : 'ปกติ'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-65">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={bottleneckData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis
                    dataKey="status"
                    stroke="#888" fontSize={10} tickLine={false} axisLine={false}
                  />
                  <YAxis
                    stroke="#888" fontSize={11} tickLine={false} axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      const isBottleneck = ['ACCEPTED', 'EN_ROUTE', 'INSPECTING'].includes(d.statusKey)
                      return (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold" style={{ color: d.color }}>{d.status}</p>
                          <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{d.count} เคส</p>
                          {isBottleneck && d.count > 0 && (
                            <p className="text-amber-500 font-medium">⚠ อาจเป็นคอขวด</p>
                          )}
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" name="จำนวนเคส" radius={[6, 6, 0, 0]}>
                    {bottleneckData.map((entry, i) => (
                      <Cell key={`bn-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-messenger bottleneck breakdown */}
            {messengers.filter(m => m.inProgress > 0).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">🔍 งานค้างแยกตาม Messenger</p>
                <div className="space-y-1.5 max-h-30 overflow-y-auto pr-1">
                  {messengers
                    .filter(m => m.inProgress > 0)
                    .sort((a, b) => b.inProgress - a.inProgress)
                    .map((m) => (
                      <div key={m.name} className="flex items-center justify-between px-3 py-2 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
                        <span className="font-semibold truncate mr-2">{m.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.statuses.ACCEPTED > 0 && (
                            <span className="flex items-center gap-1 text-blue-500">
                              <ClipboardList className="size-3" />{m.statuses.ACCEPTED}
                            </span>
                          )}
                          {m.statuses.EN_ROUTE > 0 && (
                            <span className="flex items-center gap-1 text-indigo-500">
                              <Navigation className="size-3" />{m.statuses.EN_ROUTE}
                            </span>
                          )}
                          {m.statuses.INSPECTING > 0 && (
                            <span className="flex items-center gap-1 text-purple-500">
                              <ShieldAlert className="size-3" />{m.statuses.INSPECTING}
                            </span>
                          )}
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5">
                            {m.inProgress} ค้าง
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}

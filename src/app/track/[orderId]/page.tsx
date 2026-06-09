'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ClipboardList, CheckCircle2, Navigation, ShieldAlert, Banknote, ShieldCheck, AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const TRACK_STEPS = [
  { key: 'PENDING', label: 'รอแมส', fullLabel: 'รอแมสเซนเจอร์', icon: ClipboardList },
  { key: 'ACCEPTED', label: 'แมสรับงาน', fullLabel: 'แมสเซนเจอร์รับงานแล้ว', icon: CheckCircle2 },
  { key: 'EN_ROUTE', label: 'กำลังเดินทาง', fullLabel: 'กำลังเดินทางไปยังจุดหมาย', icon: Navigation },
  { key: 'INSPECTING', label: 'ตรวจเครื่อง', fullLabel: 'กำลังตรวจสอบสภาพเครื่อง', icon: ShieldAlert },
  { key: 'PAID', label: 'จบเคส', fullLabel: 'โอนเงินสำเร็จ จบเคส', icon: Banknote },
]

export default function PublicTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = React.use(params)
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStatus() {
      setError('')
      try {
        const res = await fetch(`/api/track/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setCaseData(data)
        } else {
          setError('ไม่พบหมายเลขพัสดุหรือใบงานนี้ในระบบ')
        }
      } catch {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoading(false)
      }
    }
    if (orderId && orderId !== '[orderId]') {
      fetchStatus()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased flex flex-col justify-between">
        {/* Top Bar Skeleton */}
        <nav className="w-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center">
          <div className="w-full max-w-3xl mx-auto px-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
        </nav>

        <main className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-64 mt-1" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-7 w-56 rounded-xl mt-2" />
          </div>

          {/* Stepper Timeline Skeleton */}
          <Card className="shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="relative pt-2 pb-1 flex justify-between items-center">
                <div className="absolute top-6 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0"></div>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center w-1/5">
                    <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" />
                    <Skeleton className="h-3.5 w-12 sm:w-16 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details Skeleton */}
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4">
        <Alert variant="destructive" className="max-w-sm w-full">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xl font-bold">ไม่พบข้อมูล</AlertTitle>
          <AlertDescription>{error || 'กรุณาตรวจสอบลิงก์ใหม่อีกครั้ง'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentIdx = TRACK_STEPS.findIndex(s => s.key === caseData.status)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased flex flex-col justify-between">
      {/* Top Bar คล้ายหน้า Rubphone Shop ของเดิม */}
      <nav className="w-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center">
        <div className="w-full max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Rubphone Shop</div>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-transparent font-semibold">
            เช็คสถานะ
          </Badge>
        </div>
      </nav>

      <main className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full space-y-6">
        {/* ส่วนหัวแสดงหัวข้อเคส */}
        <section className="fade-in space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-500 tracking-widest uppercase">Delivery Service Status</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{caseData.itemDetails}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">หมายเลขใบงาน: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{caseData.orderNumber}</span></p>

          <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 mt-2">
            <ShieldCheck size={16} className="text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">คุ้มครองและทำรายการผ่านระบบของ Rubphone Shop</span>
          </div>
        </section>

        {/* แถบไทม์ไลน์แสดงสถานะ (คัดลอก Logic และแอนิเมชันมาจากไฟล์ตัวอย่าง) */}
        <section className="slide-up">
          <Card className="shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-6">

              <div className="relative pt-2 pb-1">
                {/* เส้นหลังสีเทา */}
                <div className="absolute top-4 sm:top-6 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0"></div>
                {/* เส้นสีน้ำเงินวิ่งตามสถานะจริง */}
                <div
                  className="absolute top-4 sm:top-6 left-0 h-0.5 bg-blue-600 dark:bg-blue-500 transition-all duration-500 z-0"
                  style={{ width: `${(currentIdx / (TRACK_STEPS.length - 1)) * 100}%` }}
                ></div>

                <div className="relative z-10 flex justify-between items-start">
                  {TRACK_STEPS.map((step, idx) => {
                    const Icon = step.icon
                    const isCompleted = idx <= currentIdx
                    const isCurrent = idx === currentIdx
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center w-1/5">
                        {isCurrent && caseData.status !== 'PAID' && (
                          <div className="absolute top-0 -mt-1.5 w-11 h-11 bg-blue-500/20 rounded-full animate-ping"></div>
                        )}
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          isCompleted ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                        }`}>
                          <Icon size={18} className="sm:w-6 sm:h-6" />
                        </div>
                        <span className={`text-[9px] sm:text-xs mt-2 font-bold leading-tight block text-center ${
                          isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          <span className="inline sm:hidden whitespace-nowrap">{step.label}</span>
                          <span className="hidden sm:inline whitespace-nowrap">{step.fullLabel}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* บล็อกข้อมูลเพิ่มเติมของเคส */}
        <section className="slide-up">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-5 text-xs sm:text-sm space-y-0">
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500 dark:text-zinc-400">สถานะปัจจุบัน</span>
                <span className="font-bold text-blue-600 dark:text-blue-500">{TRACK_STEPS[currentIdx]?.fullLabel}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500 dark:text-zinc-400">อัปเดตล่าสุดเมื่อ</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{caseData.updatedAt}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500 dark:text-zinc-400">ราคารับซื้อพิจารณา</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50 font-mono text-base">{caseData.price} บาท</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} Rubphone Shop. All rights reserved.
      </footer>
    </div>
  )
}
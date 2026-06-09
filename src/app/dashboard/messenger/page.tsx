'use client';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"

import { DeliveryCase, PIPELINE_STATUSES } from "@/components/dashboard/messenger-types"
import { LoadingSkeleton } from "@/components/dashboard/messenger-loading-skeleton"
import { QuickDispatchForm } from "@/components/dashboard/quick-dispatch-form"
import { CaseCard } from "@/components/dashboard/case-card"

export default function MessengerServicePage() {
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<DeliveryCase[]>([])
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'send' | 'receive'>('all')
  const [sortBy, setSortBy] = useState<'desc' | 'asc'>('desc')
  const generateOrderNumber = () => `RP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const [dispatchForm, setDispatchForm] = useState({ id: '', orderNumber: '', rawDetails: '', itemDetails: '', price: '', phone: '', mapUrl: '', deliveryTime: '' })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Initialize the order number on mount
  useEffect(() => {
    setDispatchForm(prev => ({ ...prev, orderNumber: generateOrderNumber() }))
  }, [])

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases')
      if (res.ok) {
        const data = await res.json()
        setCases(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((userData) => {
        setUser(userData)
        fetchCases()
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const advanceWorkflow = async (caseId: string, currentStatus: string) => {
    const nextMap: Record<string, DeliveryCase['status']> = {
      'PENDING': 'ACCEPTED', 'ACCEPTED': 'EN_ROUTE', 'EN_ROUTE': 'INSPECTING', 'INSPECTING': 'PAID'
    }
    const nextStatus = nextMap[currentStatus]
    if (!nextStatus) return

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, ...updated } : c)))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/cases/${id}`, { method: 'DELETE' })
    fetchCases()
  }

  const handleUpdate = (updated: DeliveryCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
  }

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    
    const newCasePayload = {
      ...(dispatchForm.id ? { id: dispatchForm.id } : {}),
      orderNumber: dispatchForm.orderNumber || generateOrderNumber(),
      rawDetails: dispatchForm.rawDetails || 'N/A',
      itemDetails: dispatchForm.itemDetails || 'เคสรับส่งด่วน',
      price: dispatchForm.price || 'ไม่ระบุ',
      phone: dispatchForm.phone || 'ไม่ระบุ',
      mapUrl: dispatchForm.mapUrl || '#',
      deliveryTime: dispatchForm.deliveryTime || '',
    }

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCasePayload)
      })
      if (res.ok) {
        const created = await res.json()
        setCases((prev) => [created, ...prev])
        setDispatchForm({ 
          id: '', 
          orderNumber: generateOrderNumber(), 
          rawDetails: '', 
          itemDetails: '', 
          price: '', 
          phone: '', 
          mapUrl: '', 
          deliveryTime: '' 
        })
      }
    } catch (error) {
      console.error('Failed to dispatch case:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <LoadingSkeleton />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Messenger Service</h1>
        <p className="text-zinc-500">Track and manage active delivery cases across the logistics pipeline.</p>
      </div>

      {user.role !== 'MESSENGER' && (
        <QuickDispatchForm
          dispatchForm={dispatchForm}
          setDispatchForm={setDispatchForm}
          submitting={submitting}
          onSubmit={handleDispatch}
        />
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
          {/* Active / Inactive Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg gap-1 shrink-0">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'active'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              Active Cases ({cases.filter((c) => c.status !== 'PAID').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'inactive'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              Completed ({cases.filter((c) => c.status === 'PAID').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              All ({cases.length})
            </button>
          </div>

          {/* Category Tabs: เคสส่ง / เคสรับ */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg gap-1 shrink-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setCategoryFilter('send')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                categoryFilter === 'send'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              เคสส่ง
            </button>
            <button
              onClick={() => setCategoryFilter('receive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                categoryFilter === 'receive'
                  ? 'bg-white dark:bg-zinc-750 text-foreground shadow-xs'
                  : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              เคสรับ
            </button>
          </div>
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex gap-2 items-center w-full">
          <input
            type="text"
            placeholder="🔍 ค้นหาด้วย เลขใบงาน/SN, เบอร์โทร หรือชื่อสินค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1"
          />
          
          <button
            onClick={() => setSortBy(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors shrink-0"
            title={sortBy === 'desc' ? 'เรียงจากใหม่สุดไปเก่าสุด' : 'เรียงจากเก่าสุดไปใหม่สุด'}
          >
            📅 {sortBy === 'desc' ? 'ใหม่สุด' : 'เก่าสุด'}
          </button>
        </div>
      </div>

      <ScrollArea className="w-full">
        <TooltipProvider>
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {cases
              .filter((c) => {
                // Active/Inactive/All state filter
                if (filter === 'active') return c.status !== 'PAID';
                if (filter === 'inactive') return c.status === 'PAID';
                return true;
              })
              .filter((c) => {
                // Category filter
                if (categoryFilter === 'send') {
                  return c.itemDetails.includes('ส่ง') || c.rawDetails.includes('ส่ง')
                }
                if (categoryFilter === 'receive') {
                  return c.itemDetails.includes('รับ') || c.rawDetails.includes('รับ')
                }
                return true;
              })
              .filter((c) => {
                // Search query filter
                const query = searchQuery.toLowerCase().trim()
                if (!query) return true
                return (
                  c.orderNumber.toLowerCase().includes(query) ||
                  c.phone.toLowerCase().includes(query) ||
                  c.itemDetails.toLowerCase().includes(query) ||
                  c.rawDetails.toLowerCase().includes(query)
                )
              })
              .sort((a, b) => {
                // Date sorting
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return sortBy === 'desc' ? timeB - timeA : timeA - timeB
              })
              .map((c) => {
                const statusObj = PIPELINE_STATUSES.find(s => s.key === c.status) || PIPELINE_STATUSES[0];
                const nextStatusLabel = (() => {
                  const nextMap: Record<string, string> = {
                    'PENDING': 'แมสรับงานแล้ว',
                    'ACCEPTED': 'กำลังเดินทาง',
                    'EN_ROUTE': 'ตรวจสอบเครื่อง',
                    'INSPECTING': 'โอนเงิน จบเคส',
                  };
                  return nextMap[c.status] || '';
                })();
                return (
                  <CaseCard
                    key={c.id}
                    case={c}
                    user={user}
                    statusObj={statusObj}
                    nextStatusLabel={nextStatusLabel}
                    onAdvance={advanceWorkflow}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                );
              })}
            {cases
              .filter((c) => {
                if (filter === 'active') return c.status !== 'PAID';
                if (filter === 'inactive') return c.status === 'PAID';
                return true;
              })
              .filter((c) => {
                if (categoryFilter === 'send') {
                  return c.itemDetails.includes('ส่ง') || c.rawDetails.includes('ส่ง')
                }
                if (categoryFilter === 'receive') {
                  return c.itemDetails.includes('รับ') || c.rawDetails.includes('รับ')
                }
                return true;
              })
              .filter((c) => {
                const query = searchQuery.toLowerCase().trim()
                if (!query) return true
                return (
                  c.orderNumber.toLowerCase().includes(query) ||
                  c.phone.toLowerCase().includes(query) ||
                  c.itemDetails.toLowerCase().includes(query) ||
                  c.rawDetails.toLowerCase().includes(query)
                )
              }).length === 0 && (
              <div className="col-span-full py-8">
                <Empty className="w-full py-24 md:py-32">
                  <EmptyMedia variant="icon">
                    <Package />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>ไม่มีข้อมูลเคส</EmptyTitle>
                    <EmptyDescription>No delivery cases found in this category.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        </TooltipProvider>
      </ScrollArea>
    </div>
  )
}

import { SectionCards } from "@/components/section-cards"
import { RevenueTrends } from "@/components/dashboard/revenue-trends"
import { MessengerEfficiency } from "@/components/dashboard/messenger-efficiency"
import { PrismaClient } from "@prisma/client"
import { getSession } from "@/lib/auth"

const prisma = new PrismaClient()

export default async function DashboardOverviewPage() {
  const session = await getSession()
  const isAuthorized = session?.role === 'ADMIN' || session?.role === 'MANAGER'

  const cases = await prisma.deliveryCase.findMany()
  const inventory = await prisma.inventoryItem.findMany()

  // Calculate stats
  const totalCases = cases.length
  const completedCases = cases.filter(c => c.status === 'PAID').length
  const pendingCases = cases.filter(c => c.status === 'PENDING').length
  
  const lowStockItems = inventory.filter(i => i.stock_qty <= i.min_order_point).length

  // Messenger-specific metrics
  const myCases = cases.filter(c => 
    (session?.id && c.assignedToId === session.id) || 
    (session?.name && c.assignedTo === session.name)
  )
  const myTotalCases = myCases.length
  const myCompletedCases = myCases.filter(c => c.status === 'PAID').length
  const myActiveCases = myCases.filter(c => c.status !== 'PAID').length
  const successRate = myTotalCases > 0 ? Math.round((myCompletedCases / myTotalCases) * 100) : 0

  if (session?.role === 'MESSENGER') {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2">ยินดีต้อนรับกลับมา, {session.name} 👋</h1>
          <p className="text-muted-foreground mb-6">ติดตามข้อมูลเคสงานส่งของและอัตราความสำเร็จของคุณ</p>
        </div>
        <SectionCards 
          role="MESSENGER"
          myTotalCases={myTotalCases}
          myCompletedCases={myCompletedCases}
          myActiveCases={myActiveCases}
          successRate={successRate}
        />
        
        {/* Quick List of Active Jobs */}
        <div className="px-4 lg:px-6 mt-4">
          <h2 className="text-lg font-bold tracking-tight mb-3">📋 งานของฉันที่กำลังดำเนินการ ({myActiveCases})</h2>
          {myActiveCases > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCases.filter(c => c.status !== 'PAID').slice(0, 6).map(c => {
                const statusLabels: Record<string, string> = {
                  'PENDING': 'รอรับงาน',
                  'ACCEPTED': 'รับงานแล้ว',
                  'EN_ROUTE': 'กำลังเดินทาง',
                  'INSPECTING': 'กำลังตรวจสอบ',
                }
                return (
                  <div key={c.id} className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{c.orderNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                          {statusLabels[c.status] || c.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-1 line-clamp-1">{c.itemDetails}</p>
                      {c.deliveryTime && (
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">⏰ {c.deliveryTime}</p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.rawDetails}</p>
                    </div>
                    <div>
                      {c.mapUrl && c.mapUrl !== '#' && (
                        <div className="mb-2">
                          <a 
                            href={c.mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            📍 เปิด Google Maps
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5 mt-2">
                        <span>โทร: {c.phone}</span>
                        <span className="font-semibold text-foreground">{c.price}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center flex flex-col items-center justify-center bg-card">
              <p className="text-sm font-medium text-muted-foreground">ไม่มีงานที่ต้องจัดการในขณะนี้</p>
              <a href="/dashboard/messenger" className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                ดูประวัติงานทั้งหมด →
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Live Operations Overview</h1>
        <p className="text-muted-foreground mb-6">Real-time statistics across Messenger Service and Inventory Management.</p>
      </div>
      <SectionCards 
        totalCases={totalCases} 
        completedCases={completedCases} 
        pendingCases={pendingCases}
        lowStockItems={lowStockItems} 
        role={session?.role || 'MESSENGER'}
        myTotalCases={myTotalCases}
        myCompletedCases={myCompletedCases}
        myActiveCases={myActiveCases}
        successRate={successRate}
      />
      {isAuthorized && (
        <>
          <RevenueTrends />
          <MessengerEfficiency />
        </>
      )}
    </div>
  )
}

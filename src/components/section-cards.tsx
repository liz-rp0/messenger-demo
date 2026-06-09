"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, AlertCircleIcon, BoxIcon, ClipboardListIcon, CheckCircleIcon } from "lucide-react"

export function SectionCards({ 
  totalCases = 0, 
  completedCases = 0, 
  pendingCases = 0, 
  lowStockItems = 0,
  role = 'ADMIN',
  myTotalCases = 0,
  myCompletedCases = 0,
  myActiveCases = 0,
  successRate = 0
}: {
  totalCases?: number;
  completedCases?: number;
  pendingCases?: number;
  lowStockItems?: number;
  role?: string;
  myTotalCases?: number;
  myCompletedCases?: number;
  myActiveCases?: number;
  successRate?: number;
}) {
  if (role === 'MESSENGER') {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 sm:grid-cols-2 dark:*:data-[slot=card]:bg-card">
        {/* Messenger's own active/assigned jobs card */}
        <Card className="@container/card bg-linear-to-t from-indigo-500/5 to-card">
          <CardHeader>
            <CardDescription>งานของฉัน (My Active Jobs)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-indigo-600 dark:text-indigo-400">
              {myActiveCases}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                <ClipboardListIcon className="w-4 h-4 mr-1" />
                Active Cases
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              งานที่กำลังจัดส่ง/รอตรวจเครื่อง
            </div>
            <div className="text-muted-foreground">
              ทั้งหมดที่ได้รับมอบหมาย: {myTotalCases} เคส
            </div>
          </CardFooter>
        </Card>

        {/* Messenger's own success rate card */}
        <Card className="@container/card bg-linear-to-t from-emerald-500/5 to-card">
          <CardHeader>
            <CardDescription>อัตราความสำเร็จ (Success Rate)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-500">
              {successRate}%
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                Performance
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-emerald-500">
              ทำเสร็จสิ้นแล้ว {myCompletedCases} เคส
            </div>
            <div className="text-muted-foreground">
              คิดเป็นสัดส่วนของงานที่ปิดเคสสำเร็จ
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Delivery Cases</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalCases}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              <ClipboardListIcon className="w-4 h-4 mr-1" />
              All-Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active Logistics Operations
          </div>
          <div className="text-muted-foreground">
            Lifetime tracked cases
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completed Cases</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-500">
            {completedCases}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Paid
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-emerald-500">
            Successfully closed {" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Revenue secured
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Cases</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-500">
            {pendingCases}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              <ClipboardListIcon className="w-4 h-4 mr-1" />
              Waiting
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-amber-500">
            Awaiting Messenger
          </div>
          <div className="text-muted-foreground">Needs dispatch attention</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Low Stock Alerts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-rose-500">
            {lowStockItems}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
              <AlertCircleIcon className="w-4 h-4 mr-1" />
              Warning
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-rose-500">
            Items below minimum order point
          </div>
          <div className="text-muted-foreground">Review inventory dashboard</div>
        </CardFooter>
      </Card>
    </div>
  )
}

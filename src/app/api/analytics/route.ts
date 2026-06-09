import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cases = await prisma.deliveryCase.findMany()
    const inventory = await prisma.inventoryItem.findMany()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let totalCasesToday = 0
    let totalCasesMonth = 0
    let totalAmountToday = 0
    let totalAmountMonth = 0
    let completedCasesToday = 0
    let completedCasesMonth = 0

    const statusCounts = {
      PENDING: 0,
      ACCEPTED: 0,
      EN_ROUTE: 0,
      INSPECTING: 0,
      PAID: 0
    }

    interface MessengerStat {
      assigned: number
      completed: number
      revenue: number
      statuses: { PENDING: number; ACCEPTED: number; EN_ROUTE: number; INSPECTING: number; PAID: number }
    }
    const messengerStats: Record<string, MessengerStat> = {}

    // Initialize 30 days timeline
    const timelineData: Record<string, { date: string; revenue: number; cases: number; completed: number; aov: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
      const keyStr = d.toISOString().split('T')[0] // YYYY-MM-DD
      timelineData[keyStr] = {
        date: dateStr,
        revenue: 0,
        cases: 0,
        completed: 0,
        aov: 0
      }
    }

    for (const c of cases) {
      const createdAt = new Date(c.createdAt)
      const isToday = createdAt >= today
      const isThisMonth = createdAt >= firstDayOfMonth

      if (isToday) totalCasesToday++
      if (isThisMonth) totalCasesMonth++

      statusCounts[c.status as keyof typeof statusCounts]++

      const price = parseInt(c.price.replace(/[^0-9]/g, ''), 10) || 0

      if (c.status === 'PAID') {
        if (isToday) {
          totalAmountToday += price
          completedCasesToday++
        }
        if (isThisMonth) {
          totalAmountMonth += price
          completedCasesMonth++
        }
      }

      if (c.assignedTo) {
        if (!messengerStats[c.assignedTo]) {
          messengerStats[c.assignedTo] = { assigned: 0, completed: 0, revenue: 0, statuses: { PENDING: 0, ACCEPTED: 0, EN_ROUTE: 0, INSPECTING: 0, PAID: 0 } }
        }
        messengerStats[c.assignedTo].assigned++
        const st = c.status as keyof MessengerStat['statuses']
        if (messengerStats[c.assignedTo].statuses[st] !== undefined) {
          messengerStats[c.assignedTo].statuses[st]++
        }
        if (c.status === 'PAID') {
          messengerStats[c.assignedTo].completed++
          messengerStats[c.assignedTo].revenue += price
        }
      }

      // Add to timeline if within last 30 days
      const dateKey = createdAt.toISOString().split('T')[0]
      if (timelineData[dateKey]) {
        timelineData[dateKey].cases++
        if (c.status === 'PAID') {
          timelineData[dateKey].completed++
          timelineData[dateKey].revenue += price
        }
      }
    }

    // Inventory Stats
    const totalItems = inventory.length
    const lowStockAlerts = inventory
      .filter(item => item.stock_qty <= item.min_order_point)
      .map(item => ({
        sku: item.sku,
        name: item.product_name,
        qty: item.stock_qty,
        min: item.min_order_point,
        category: item.category
      }))
    
    const lowStockCount = lowStockAlerts.length
    const healthyStockCount = totalItems - lowStockCount

    // Stock volume by category (sum of stock_qty per category)
    const categoryVolume: Record<string, number> = {}
    // Unique item counts by category
    const categoryCounts: Record<string, number> = {}

    for (const item of inventory) {
      categoryVolume[item.category] = (categoryVolume[item.category] || 0) + item.stock_qty
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }

    // Top critical items closest to running out (sorted by safety percentage)
    const criticalItems = inventory
      .map(item => {
        let safetyRatio = 100
        if (item.min_order_point > 0) {
          safetyRatio = (item.stock_qty / item.min_order_point) * 100
        } else if (item.stock_qty === 0) {
          safetyRatio = 0
        }
        return {
          sku: item.sku,
          name: item.product_name,
          qty: item.stock_qty,
          min: item.min_order_point,
          safetyRatio: Math.round(safetyRatio)
        }
      })
      .sort((a, b) => a.safetyRatio - b.safetyRatio)
      .slice(0, 8)

    // Compute AOV per day
    const timelineArray = Object.values(timelineData).map(day => ({
      ...day,
      aov: day.completed > 0 ? Math.round(day.revenue / day.completed) : 0
    }))

    // 7-day moving average for revenue
    const timelineWithMA = timelineArray.map((day, i) => {
      const window = timelineArray.slice(Math.max(0, i - 6), i + 1)
      const maRevenue = Math.round(window.reduce((s, d) => s + d.revenue, 0) / window.length)
      const maAov = (() => {
        const totalRev = window.reduce((s, d) => s + d.revenue, 0)
        const totalComp = window.reduce((s, d) => s + d.completed, 0)
        return totalComp > 0 ? Math.round(totalRev / totalComp) : 0
      })()
      return { ...day, maRevenue, maAov }
    })

    // 30-day aggregated AOV
    const totalRevenue30d = timelineArray.reduce((s, d) => s + d.revenue, 0)
    const totalPaid30d = timelineArray.reduce((s, d) => s + d.completed, 0)
    const aov30d = totalPaid30d > 0 ? Math.round(totalRevenue30d / totalPaid30d) : 0

    // 30d revenue trend (last 7 days vs prior 7 days) for AOV delta
    const last7Rev = timelineArray.slice(-7).reduce((s, d) => s + d.revenue, 0)
    const prior7Rev = timelineArray.slice(-14, -7).reduce((s, d) => s + d.revenue, 0)
    const revTrendPct = prior7Rev > 0 ? Math.round(((last7Rev - prior7Rev) / prior7Rev) * 100) : 0
    const last7Paid = timelineArray.slice(-7).reduce((s, d) => s + d.completed, 0)
    const prior7Paid = timelineArray.slice(-14, -7).reduce((s, d) => s + d.completed, 0)
    const aovLast7 = last7Paid > 0 ? Math.round(last7Rev / last7Paid) : 0
    const aovPrior7 = prior7Paid > 0 ? Math.round(prior7Rev / prior7Paid) : 0
    const aovTrendPct = aovPrior7 > 0 ? Math.round(((aovLast7 - aovPrior7) / aovPrior7) * 100) : 0

    // Day-of-week revenue breakdown (aggregate across 30 days)
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์']
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekdayBuckets: { day: string; dayEn: string; revenue: number; cases: number; paidCases: number; avgRevenue: number; weeksCount: number }[] =
      dayNames.map((name, idx) => ({ day: name, dayEn: dayNamesEn[idx], revenue: 0, cases: 0, paidCases: 0, avgRevenue: 0, weeksCount: 0 }))

    // Iterate the 30-day date keys and bucket by day-of-week
    for (const [dateKey, dayData] of Object.entries(timelineData)) {
      const dow = new Date(dateKey).getDay() // 0=Sun … 6=Sat
      weekdayBuckets[dow].revenue += dayData.revenue
      weekdayBuckets[dow].cases += dayData.cases
      weekdayBuckets[dow].paidCases += dayData.completed
      weekdayBuckets[dow].weeksCount++
    }
    // Compute avg revenue per occurrence of that weekday
    for (const bucket of weekdayBuckets) {
      bucket.avgRevenue = bucket.weeksCount > 0 ? Math.round(bucket.revenue / bucket.weeksCount) : 0
    }
    // Reorder Mon–Sun for display
    const weekdayRevenue = [...weekdayBuckets.slice(1), weekdayBuckets[0]]

    // Best / worst day
    const peakDay = weekdayRevenue.reduce((best, d) => d.avgRevenue > best.avgRevenue ? d : best, weekdayRevenue[0])
    const slowDay = weekdayRevenue.reduce((worst, d) => d.avgRevenue < worst.avgRevenue ? d : worst, weekdayRevenue[0])

    return NextResponse.json({
      today: {
        totalCases: totalCasesToday,
        completedCases: completedCasesToday,
        totalAmount: totalAmountToday
      },
      month: {
        totalCases: totalCasesMonth,
        completedCases: completedCasesMonth,
        totalAmount: totalAmountMonth
      },
      statusCounts,
      messengerStats: Object.entries(messengerStats).map(([name, stats]) => ({
        name,
        assigned: stats.assigned,
        completed: stats.completed,
        revenue: stats.revenue,
        rate: stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0,
        statuses: stats.statuses,
        inProgress: stats.statuses.ACCEPTED + stats.statuses.EN_ROUTE + stats.statuses.INSPECTING,
      })).sort((a, b) => b.completed - a.completed),
      timeline: timelineWithMA,
      revenueMetrics: {
        aov30d,
        aovTrendPct,
        revTrendPct,
        totalRevenue30d,
        totalPaid30d,
        weekdayRevenue,
        peakDay: peakDay.day,
        slowDay: slowDay.day,
      },
      inventorySummary: {
        totalItems,
        lowStockCount,
        healthyStockCount,
        categoryVolume: Object.entries(categoryVolume).map(([category, volume]) => ({ category, volume })),
        categoryCounts: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
        lowStockAlerts,
        criticalItems
      }
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

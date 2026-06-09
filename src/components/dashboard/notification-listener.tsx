'use client'

import React, { useEffect, useRef } from 'react'

export function NotificationListener() {
  const lastCheckedTime = useRef<number>(Date.now())
  const hasRequestedPermission = useRef<boolean>(false)

  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default' && !hasRequestedPermission.current) {
        hasRequestedPermission.current = true
        Notification.requestPermission().catch(() => {})
      }
    }

    // Polling function
    const checkNewCases = async () => {
      try {
        // Fetch current user session to check role
        const authRes = await fetch('/api/auth')
        if (!authRes.ok) return
        const user = await authRes.json()

        // Notify MESSENGER and MANAGER
        if (user.role !== 'MESSENGER' && user.role !== 'MANAGER') return

        const casesRes = await fetch('/api/cases')
        if (!casesRes.ok) return
        const cases = await casesRes.json()

        if (!cases || cases.length === 0) return

        // Find cases created after lastCheckedTime
        const newCases = cases.filter((c: any) => {
          const createdTime = new Date(c.createdAt).getTime()
          return createdTime > lastCheckedTime.current
        })

        if (newCases.length > 0) {
          // Update lastCheckedTime to the latest case time to prevent double notification
          const maxTime = Math.max(...newCases.map((c: any) => new Date(c.createdAt).getTime()))
          lastCheckedTime.current = maxTime

          // Notify for each new case
          newCases.forEach((c: any) => {
            // For messenger: notify if assigned to them or unassigned pending
            if (user.role === 'MESSENGER') {
              const isAssignedToMe = c.assignedToId === user.id || c.assignedTo === user.name
              const isUnassigned = !c.assignedTo && c.status === 'PENDING'
              if (!isAssignedToMe && !isUnassigned) return
            }

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('📢 งานใหม่ถูกจัดส่ง! 📦', {
                body: `ออเดอร์: ${c.orderNumber}\nรายการ: ${c.itemDetails}\nราคา: ${c.price}`,
                icon: '/favicon.ico'
              })
            }
          })
        }
      } catch (err) {
        console.error('Error checking for new cases:', err)
      }
    }

    // Check immediately and then every 10 seconds
    checkNewCases()
    const interval = setInterval(checkNewCases, 10000)

    return () => clearInterval(interval)
  }, [])

  return null
}

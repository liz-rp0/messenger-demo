"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  FolderIcon,
  BarChart3Icon,
  Bike,
  CircleHelpIcon,
  LogOutIcon,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [user, setUser] = React.useState<{ id: string; name: string; username: string; role: string } | null>(null)
  const [hasActiveJobs, setHasActiveJobs] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/auth')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((userData) => {
        setUser(userData)
        
        // Fetch cases to check for active jobs
        fetch('/api/cases')
          .then((res) => res.json())
          .then((cases) => {
            if (Array.isArray(cases)) {
              const myActive = cases.some((c: any) => 
                (c.assignedToId === userData.id || c.assignedTo === userData.name) && 
                c.status !== 'PAID'
              )
              setHasActiveJobs(myActive)
            }
          })
          .catch(() => {})
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  // Build nav items based on user role
  const navMain = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: "Messenger Service",
        url: "/dashboard/messenger",
        icon: <ListIcon />,
        badge: user?.role === 'MESSENGER' && hasActiveJobs ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        ) : null,
      },
    ]

    // Inventory Management and Analytics only for ADMIN/MANAGER
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      items.push({
        title: "Inventory Management",
        url: "/dashboard/inventory",
        icon: <FolderIcon />,
      })
      items.push({
        title: "Executive Analytics",
        url: "/dashboard/analytics",
        icon: <BarChart3Icon />,
      })
    }

    return items
  }, [user?.role, hasActiveJobs])

  const navSecondary = [
    {
      title: "Help & Support",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Logout",
      url: "#",
      icon: <LogOutIcon />,
      onClick: handleLogout,
    },
  ]

  const roleLabel: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    MANAGER: 'ผู้จัดการ',
    MESSENGER: 'พนักงานส่งของ',
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <Bike className="size-5!" />
              <span className="text-base font-semibold">Messenger Demo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || 'Loading...',
            email: user ? `${roleLabel[user.role] || user.role} · @${user.username}` : '',
            avatar: '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2, ShieldCheck } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user)
    setPassword(pass)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white mb-2">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">RPM</CardTitle>
          <CardDescription>
            เข้าสู่ระบบเพื่อจัดการเคสรับซื้อและประสานงานขนส่งสินค้า
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold p-3 rounded-lg flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Field>
                <FieldLabel htmlFor="username">ชื่อผู้ใช้งาน (Username)</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="เช่น: admin_sayz, mass1"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>
              
              <Field>
                <div className="flex items-center justify-between w-full">
                  <FieldLabel htmlFor="password">รหัสผ่าน (Password)</FieldLabel>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              
              <Field>
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  ลงชื่อเข้าสู่ระบบ
                </Button>
              </Field>
            </FieldGroup>
          </form>

          {/* Quick Fill Accounts */}
          <div className="mt-8 space-y-3">
            <div className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              บัญชีทดสอบความพร้อม (Quick Fill)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fillCredentials('admin_sayz', '1000')}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Admin</div>
                <div className="text-xs text-zinc-400 mt-0.5">admin_sayz / ****</div>
              </button>
              <button 
                onClick={() => fillCredentials('admin', '3144')}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Admin</div>
                <div className="text-xs text-zinc-400 mt-0.5">admin / ****</div>
              </button>
              <button 
                onClick={() => fillCredentials('mass1', '1111')}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Messenger</div>
                <div className="text-xs text-zinc-400 mt-0.5">mass1 / ****</div>
              </button>
              <button 
                onClick={() => fillCredentials('mass2', '1111')}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Messenger</div>
                <div className="text-xs text-zinc-400 mt-0.5">mass2 / ****</div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FieldDescription className="px-6 text-center text-xs text-zinc-400">
        ระบบจัดการเคสรับซื้อและประสานงานขนส่งสินค้า
      </FieldDescription>
    </div>
  )
}

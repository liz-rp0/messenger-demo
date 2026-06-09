import React, { useState } from 'react'
import { CheckCircle2, Trash2, ChevronRight, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { DeliveryCase, PIPELINE_STATUSES } from "@/components/dashboard/messenger-types"

interface CaseCardProps {
  case: DeliveryCase
  user: any
  statusObj: (typeof PIPELINE_STATUSES)[number]
  nextStatusLabel: string
  onAdvance: (caseId: string, currentStatus: string) => void
  onDelete: (id: string) => void
  onUpdate: (updated: DeliveryCase) => void
}

export function CaseCard({ case: c, user, statusObj, nextStatusLabel, onAdvance, onDelete, onUpdate }: CaseCardProps) {
  const StatusIcon = statusObj.icon;
  const [openEdit, setOpenEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit Form Fields
  const [editItemDetails, setEditItemDetails] = useState(c.itemDetails)
  const [editPrice, setEditPrice] = useState(c.price)
  const [editPhone, setEditPhone] = useState(c.phone)
  const [editMapUrl, setEditMapUrl] = useState(c.mapUrl)
  const [editDeliveryTime, setEditDeliveryTime] = useState(c.deliveryTime || '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`/api/cases/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemDetails: editItemDetails,
          price: editPrice,
          phone: editPhone,
          mapUrl: editMapUrl,
          deliveryTime: editDeliveryTime
        })
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate(updated)
        setOpenEdit(false)
      }
    } catch (err) {
      console.error('Failed to save case:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDeliveryTime = (timeStr: string) => {
    if (!timeStr) return ''
    if (timeStr.includes('T')) {
      try {
        const d = new Date(timeStr)
        if (!isNaN(d.getTime())) {
          return d.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        }
      } catch (err) {}
    }
    return timeStr
  }

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className={`px-4 py-3 border-b flex items-center justify-between ${statusObj.color.split(' ').slice(1).join(' ')}`}>
        <Badge variant="secondary" className={`gap-1.5 ${statusObj.color.split(' ')[0]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusObj.label}
        </Badge>
        <Badge variant="outline" className="font-mono">{c.orderNumber}</Badge>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col gap-3 mt-2">
        <div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Item Details</div>
          <div className="font-medium text-foreground">{c.itemDetails}</div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Price</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">฿{c.price}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Contact</div>
            <div className="font-medium text-sm text-foreground">{c.phone}</div>
          </div>
        </div>
        {c.deliveryTime && (
          <>
            <Separator />
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">วัน/เวลาจัดส่ง</div>
              <div className="font-semibold text-sm text-foreground">{formatDeliveryTime(c.deliveryTime)}</div>
            </div>
          </>
        )}
        {c.mapUrl && c.mapUrl !== '#' && (
          <>
            <Separator />
            <div>
              <a 
                href={c.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                📍 เปิดแผนที่ Google Maps
              </a>
            </div>
          </>
        )}
        {c.assignedTo && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>{c.assignedTo.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Messenger</div>
                <div className="text-sm font-medium text-foreground">{c.assignedTo}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="px-5 py-4 border-t bg-muted/30 flex items-center justify-between gap-2">
        {user.role === 'ADMIN' ? (
          <div className="flex gap-1">
            {/* Edit Case Dialog */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="size-10 text-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-full flex items-center justify-center p-0 shrink-0"
                        />
                      }
                    />
                  }
                >
                  <Pencil className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>แก้ไขข้อมูลเคส</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-xl font-bold">แก้ไขรายละเอียดเคส</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    แก้ไขรายละเอียดและข้อมูลของใบงานหมายเลข {c.orderNumber}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 py-2">
                  <div className="sm:col-span-2">
                    <Field className="flex flex-col gap-2">
                      <FieldLabel htmlFor="editItemDetails" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item Details (ชื่อสินค้า/งาน)</FieldLabel>
                      <Input id="editItemDetails" className="h-10 px-3.5" value={editItemDetails} onChange={e => setEditItemDetails(e.target.value)} required />
                    </Field>
                  </div>
                  <div>
                    <Field className="flex flex-col gap-2">
                      <FieldLabel htmlFor="editPrice" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price (ราคา)</FieldLabel>
                      <Input id="editPrice" className="h-10 px-3.5" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                    </Field>
                  </div>
                  <div>
                    <Field className="flex flex-col gap-2">
                      <FieldLabel htmlFor="editPhone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone (เบอร์ติดต่อ)</FieldLabel>
                      <Input id="editPhone" className="h-10 px-3.5" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field className="flex flex-col gap-2">
                      <FieldLabel htmlFor="editMapUrl" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maps Location (ลิงก์แผนที่)</FieldLabel>
                      <Input id="editMapUrl" className="h-10 px-3.5" value={editMapUrl} onChange={e => setEditMapUrl(e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field className="flex flex-col gap-2">
                      <FieldLabel htmlFor="editDeliveryTime" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date / Time (วันเวลาจัดส่ง)</FieldLabel>
                      <Input 
                        type="datetime-local" 
                        id="editDeliveryTime" 
                        className="h-10 px-3.5 [color-scheme:light] dark:[color-scheme:dark]" 
                        value={editDeliveryTime} 
                        onChange={e => setEditDeliveryTime(e.target.value)} 
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <DialogFooter className="mt-6">
                      <DialogClose render={<Button type="button" variant="outline" className="h-10 px-4" />}>
                        ยกเลิก
                      </DialogClose>
                      <Button type="submit" disabled={isSaving} className="h-10 px-4">
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </DialogFooter>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Case Dialog */}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="size-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full flex items-center justify-center p-0 shrink-0"
                        />
                      }
                    />
                  }
                >
                  <Trash2 className="w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent>ลบเคสนี้</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณต้องการลบเคส {c.orderNumber} หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(c.id)}>ลบเคส</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : <div />}
        
        {c.status !== 'PAID' && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button onClick={() => onAdvance(c.id, c.status)} className="flex items-center gap-2 font-semibold" />
              }
            >
              Next Phase <ChevronRight className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>เลื่อนสถานะเป็น: {nextStatusLabel}</TooltipContent>
          </Tooltip>
        )}
        {c.status === 'PAID' && (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-500 text-white gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}

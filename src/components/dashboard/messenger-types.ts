import { ClipboardList, CheckCircle2, Navigation, ShieldAlert, Banknote } from 'lucide-react'

export interface DeliveryCase {
  id: string
  orderNumber: string
  rawDetails: string
  itemDetails: string
  price: string
  phone: string
  mapUrl: string
  deliveryTime?: string
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'INSPECTING' | 'PAID'
  assignedTo?: string
  createdAt?: string
  updatedAt?: string
}

export const PIPELINE_STATUSES = [
  { key: 'PENDING', label: 'รอแมสเซนเจอร์', icon: ClipboardList, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { key: 'ACCEPTED', label: 'แมสรับงานแล้ว', icon: CheckCircle2, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { key: 'EN_ROUTE', label: 'กำลังเดินทาง', icon: Navigation, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { key: 'INSPECTING', label: 'ตรวจสอบเครื่อง', icon: ShieldAlert, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { key: 'PAID', label: 'โอนเงิน จบเคส', icon: Banknote, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
] as const

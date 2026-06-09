'use client';
import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

interface DispatchFormData {
  id: string
  orderNumber: string
  rawDetails: string
  itemDetails: string
  price: string
  phone: string
  mapUrl: string
  deliveryTime: string
}

interface QuickDispatchFormProps {
  dispatchForm: DispatchFormData
  setDispatchForm: React.Dispatch<React.SetStateAction<DispatchFormData>>
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function QuickDispatchForm({ dispatchForm, setDispatchForm, submitting, onSubmit }: QuickDispatchFormProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2"><Plus className="w-5 h-5"/> Quick Dispatch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Field>
            <FieldLabel htmlFor="itemDetails">Item Details</FieldLabel>
            <Input id="itemDetails" placeholder="รายละเอียดสินค้า" value={dispatchForm.itemDetails} onChange={e=>setDispatchForm({...dispatchForm, itemDetails: e.target.value})} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="price">Price / Value</FieldLabel>
            <Input id="price" placeholder="ราคา" value={dispatchForm.price} onChange={e=>setDispatchForm({...dispatchForm, price: e.target.value})} />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" placeholder="เบอร์โทร" value={dispatchForm.phone} onChange={e=>setDispatchForm({...dispatchForm, phone: e.target.value})} />
          </Field>
          <Field>
            <FieldLabel htmlFor="mapUrl">Maps Location</FieldLabel>
            <Input id="mapUrl" placeholder="ลิงก์แผนที่ Google Maps" value={dispatchForm.mapUrl} onChange={e=>setDispatchForm({...dispatchForm, mapUrl: e.target.value})} />
          </Field>
          <Field>
            <FieldLabel htmlFor="deliveryTime">Date / Time</FieldLabel>
            <Input 
              type="datetime-local" 
              id="deliveryTime" 
              className="[color-scheme:light] dark:[color-scheme:dark]"
              value={dispatchForm.deliveryTime} 
              onChange={e=>setDispatchForm({...dispatchForm, deliveryTime: e.target.value})} 
            />
          </Field>
          <div className="lg:col-span-5 flex justify-end mt-2">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto shadow-sm">
              {submitting ? <><Spinner className="mr-2" /> Dispatching...</> : 'Dispatch Job'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

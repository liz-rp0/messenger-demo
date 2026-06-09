import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { CaseStatus } from '@prisma/client'

function formatThaiDate(date: Date): string {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const day = String(date.getDate()).padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes} น.`
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, itemDetails, price, mapUrl, phone, deliveryTime } = body

    const currentCase = await prisma.deliveryCase.findUnique({
      where: { id }
    })

    if (!currentCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const updateData: any = {}

    // 1. Status Update Validation
    if (status) {
      if (!Object.values(CaseStatus).includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = status

      // If case is being accepted, assign it to the current logged-in messenger
      if (status === 'ACCEPTED' && currentCase.status === 'PENDING') {
        updateData.assignedTo = session.name
        updateData.assignedToId = session.id
      }
    }

    // 2. Details Update Validation (ADMIN or MANAGER only)
    const isEditDetails = itemDetails !== undefined || price !== undefined || mapUrl !== undefined || phone !== undefined || deliveryTime !== undefined
    if (isEditDetails) {
      if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Forbidden: only ADMIN or MANAGER can edit case details' }, { status: 403 })
      }
      if (itemDetails !== undefined) updateData.itemDetails = itemDetails
      if (price !== undefined) updateData.price = price
      if (mapUrl !== undefined) updateData.mapUrl = mapUrl
      if (phone !== undefined) updateData.phone = phone
      if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime
    }

    const updatedCase = await prisma.deliveryCase.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      ...updatedCase,
      updatedAt: formatThaiDate(updatedCase.updatedAt)
    })
  } catch (error) {
    console.error('Update case error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden: only ADMIN or MANAGER can delete cases' }, { status: 403 })
    }

    const existing = await prisma.deliveryCase.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    await prisma.deliveryCase.delete({ where: { id } })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Delete case error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

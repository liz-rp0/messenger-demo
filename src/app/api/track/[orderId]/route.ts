import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function formatThaiDate(date: Date): string {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const day = String(date.getDate()).padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes} น.`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  
  try {
    let foundCase = await prisma.deliveryCase.findUnique({
      where: { orderNumber: orderId }
    })

    if (!foundCase) {
      foundCase = await prisma.deliveryCase.findFirst({
        where: { phone: orderId },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!foundCase) {
      return NextResponse.json({ error: 'ไม่พบหมายเลขใบงานหรือเบอร์โทรนี้ในระบบ' }, { status: 404 })
    }

    return NextResponse.json({
      ...foundCase,
      updatedAt: formatThaiDate(foundCase.updatedAt)
    })
  } catch (error) {
    console.error('Tracking fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
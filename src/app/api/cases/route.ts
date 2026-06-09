import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function formatThaiDate(date: Date): string {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const day = String(date.getDate()).padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes} น.`
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cases = await prisma.deliveryCase.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const formattedCases = cases.map(c => ({
      ...c,
      updatedAt: formatThaiDate(c.updatedAt)
    }))

    return NextResponse.json(formattedCases)
  } catch (error) {
    console.error('Fetch cases error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, orderNumber, rawDetails, itemDetails, price, phone, mapUrl, deliveryTime } = body

    if (!orderNumber || !itemDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const data: any = {
      orderNumber,
      rawDetails: rawDetails || 'Quick Dispatched',
      itemDetails,
      price: price || 'ไม่ระบุ',
      phone: phone || 'ไม่ระบุ',
      mapUrl: mapUrl || '#',
      deliveryTime: deliveryTime || '',
      status: 'PENDING'
    }

    if (id) {
      data.id = id
    }

    const newCase = await prisma.deliveryCase.create({ data })

    return NextResponse.json({
      ...newCase,
      updatedAt: formatThaiDate(newCase.updatedAt)
    })
  } catch (error) {
    console.error('Create case error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

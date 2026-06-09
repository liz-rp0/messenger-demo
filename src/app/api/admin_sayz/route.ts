import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const cases = await prisma.deliveryCase.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(cases);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (Array.isArray(data)) {
      // Import multiple from CSV
      const created = await prisma.deliveryCase.createMany({
        data: data.map(d => ({
          orderNumber: d.orderNumber || `IMP-${Math.floor(Math.random()*10000)}`,
          rawDetails: d.rawDetails || '',
          itemDetails: d.itemDetails || 'Imported Case',
          price: d.price || '0',
          phone: d.phone || '',
          mapUrl: d.mapUrl || '',
          status: d.status || 'PENDING',
        })),
        skipDuplicates: true,
      });
      return NextResponse.json({ message: 'Imported successfully', count: created.count });
    } else {
      // Create single
      const newCase = await prisma.deliveryCase.create({
        data: {
          orderNumber: data.orderNumber || `ORD-${Date.now()}`,
          rawDetails: data.rawDetails || '',
          itemDetails: data.itemDetails || '',
          price: data.price || '0',
          phone: data.phone || '',
          mapUrl: data.mapUrl || '',
          status: data.status || 'PENDING',
        }
      });
      return NextResponse.json(newCase);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

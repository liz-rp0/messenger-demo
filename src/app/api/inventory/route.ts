import { NextResponse } from 'next/server';
import { InventoryService } from '@/lib/inventory';
import { getSession } from '@/lib/auth';

/**
 * GET /api/inventory
 * Query parameters:
 *   format=json  (default)
 *   format=html  (returns HTML table)
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'json';

  if (format === 'html') {
    const html = await InventoryService.getHtml();
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const data = await InventoryService.getAll();
  return NextResponse.json(data);
}

/**
 * POST /api/inventory
 * Body JSON: { action: "updateStock", sku: string, delta: number }
 *         or { action: "processClaim", sku: string }
 *         or { action: "evaluateBattery", grade: string, months: number, health: number }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'updateStock') {
      const result = await InventoryService.updateStock(body.sku, body.delta);
      return NextResponse.json(result);
    }

    if (action === 'processClaim') {
      const result = await InventoryService.processClaim(body.sku);
      return NextResponse.json(result);
    }

    if (action === 'evaluateBattery') {
      const approved = InventoryService.evaluateBatteryClaim(body.grade, body.months, body.health);
      return NextResponse.json({ approved });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

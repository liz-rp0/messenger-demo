import { prisma } from './prisma'

export interface Item {
  sku: string;
  product_name: string;
  category: string;
  stock_qty: number;
  min_order_point: number;
  status: string;
}

export function refreshStatus(item: { stock_qty: number, min_order_point: number, status: string }): void {
  if (item.stock_qty <= item.min_order_point) {
    item.status = 'Need to Order';
  } else {
    item.status = 'In Stock';
  }
}

export async function processClaim(sku: string): Promise<{ success: boolean; message: string }> {
  const item = await prisma.inventoryItem.findUnique({ where: { sku } });
  if (!item) return { success: false, message: 'SKU ' + sku + ' not found.' };
  if (item.stock_qty <= 0) return { success: false, message: 'No stock for ' + sku + '.' };
  
  const newQty = item.stock_qty - 1;
  const tempItem = { ...item, stock_qty: newQty };
  refreshStatus(tempItem);

  await prisma.inventoryItem.update({
    where: { sku },
    data: {
      stock_qty: tempItem.stock_qty,
      status: tempItem.status,
    }
  });

  return { success: true, message: 'Claim processed for ' + sku + '. Stock now ' + tempItem.stock_qty + '.' };
}

export function evaluateBatteryClaim(
  grade: 'Premium' | 'Standard',
  monthsSinceInstall: number,
  healthPercent: number
): boolean {
  if (grade === 'Premium') return monthsSinceInstall <= 12 && healthPercent < 80;
  return monthsSinceInstall <= 6 && healthPercent < 75;
}

export async function updateStock(sku: string, delta: number): Promise<{ success: boolean; message: string }> {
  const item = await prisma.inventoryItem.findUnique({ where: { sku } });
  if (!item) return { success: false, message: 'SKU ' + sku + ' not found.' };
  
  let newQty = item.stock_qty + delta;
  if (newQty < 0) newQty = 0;

  const tempItem = { ...item, stock_qty: newQty };
  refreshStatus(tempItem);

  await prisma.inventoryItem.update({
    where: { sku },
    data: {
      stock_qty: tempItem.stock_qty,
      status: tempItem.status,
    }
  });

  return { success: true, message: 'Stock for ' + sku + ' is now ' + tempItem.stock_qty + '. Status: ' + tempItem.status };
}

export async function getInventory(): Promise<Item[]> {
  const items = await prisma.inventoryItem.findMany();
  return items.map(i => ({
    sku: i.sku,
    product_name: i.product_name,
    category: i.category,
    stock_qty: i.stock_qty,
    min_order_point: i.min_order_point,
    status: i.status
  }));
}

export async function generateHtmlTable(): Promise<string> {
  const items = await getInventory();
  const rows = items.map(i => '<tr><td>' + i.sku + '</td><td>' + i.product_name + '</td><td>' + i.stock_qty + '</td><td>' + i.status + '</td></tr>').join('');
  return '<table><thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

export const InventoryService = {
  getAll: getInventory,
  getHtml: generateHtmlTable,
  updateStock,
  processClaim,
  evaluateBatteryClaim,
};

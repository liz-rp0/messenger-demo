export interface Item {
  sku: string;
  product_name: string;
  category: string;
  stock_qty: number;
  min_order_point: number;
  status: string;
}

export interface ServiceHistory {
  id: string;
  date: string;
  sku: string;
  action: string;
  qty: number;
  notes: string;
}

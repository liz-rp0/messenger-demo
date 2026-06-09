'use client';

import { useState } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/components/dashboard/inventory-types';
import { Skeleton } from '@/components/ui/skeleton';

interface InventoryStockTableProps {
  items: Item[];
  loading: boolean;
}

type SortField = 'sku' | 'product_name' | 'stock_qty' | 'status';
type SortDirection = 'asc' | 'desc';

export function InventoryStockTable({ items, loading }: InventoryStockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('sku');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'stock_qty') {
      aVal = a.stock_qty;
      bVal = b.stock_qty;
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40 ml-1.5 inline-block shrink-0" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-primary ml-1.5 inline-block shrink-0 animate-in fade-in" />
      : <ArrowDown className="w-3.5 h-3.5 text-primary ml-1.5 inline-block shrink-0 animate-in fade-in" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle>Current Inventory</CardTitle>
        <CardDescription>Live stock levels across all items.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search SKU or product name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border border-input bg-transparent outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-input bg-background outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors cursor-pointer min-w-[140px]"
            >
              <option value="all">All Categories</option>
              <option value="Battery">Battery</option>
              <option value="Screen">Screen</option>
              <option value="Charging Port">Charging Port</option>
              <option value="Front Camera">Front Camera</option>
              <option value="Rear Camera">Rear Camera</option>
              <option value="Back Glass">Back Glass</option>
            </select>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={e => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="h-9 px-3 text-sm rounded-lg border border-input bg-background outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors cursor-pointer min-w-[155px]"
            >
              <option value="sku-asc">Sort: SKU (A-Z)</option>
              <option value="sku-desc">Sort: SKU (Z-A)</option>
              <option value="product_name-asc">Sort: Name (A-Z)</option>
              <option value="product_name-desc">Sort: Name (Z-A)</option>
              <option value="stock_qty-asc">Sort: Stock (Low-High)</option>
              <option value="stock_qty-desc">Sort: Stock (High-Low)</option>
              <option value="status-asc">Sort: Status (A-Z)</option>
              <option value="status-desc">Sort: Status (Z-A)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3">SKU</TableHead>
                  <TableHead className="py-3">Product</TableHead>
                  <TableHead className="py-3 text-center">Stock Qty</TableHead>
                  <TableHead className="text-center py-3">Min Order</TableHead>
                  <TableHead className="py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="py-4"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-5 w-36 mb-1.5" />
                      <Skeleton className="h-3.5 w-16" />
                    </TableCell>
                    <TableCell className="py-4"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead 
                    onClick={() => handleSort('sku')} 
                    className="cursor-pointer select-none hover:text-foreground transition-colors py-3"
                  >
                    <span className="flex items-center">SKU {renderSortIcon('sku')}</span>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('product_name')} 
                    className="cursor-pointer select-none hover:text-foreground transition-colors py-3"
                  >
                    <span className="flex items-center">Product {renderSortIcon('product_name')}</span>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('stock_qty')} 
                    className="cursor-pointer select-none hover:text-foreground transition-colors py-3 text-center"
                  >
                    <span className="flex items-center justify-center">Stock Qty {renderSortIcon('stock_qty')}</span>
                  </TableHead>
                  <TableHead className="text-center py-3">Min Order</TableHead>
                  <TableHead 
                    onClick={() => handleSort('status')} 
                    className="cursor-pointer select-none hover:text-foreground transition-colors py-3"
                  >
                    <span className="flex items-center">Status {renderSortIcon('status')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => {
                  const isLow = item.stock_qty <= item.min_order_point;
                  return (
                    <TableRow key={item.sku} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-primary font-medium">{item.sku}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.category}</div>
                      </TableCell>
                      <TableCell className={`text-center font-bold text-base ${isLow ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.stock_qty}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground font-medium">{item.min_order_point}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={isLow ? 'destructive' : 'secondary'} 
                          className={!isLow ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : ''}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No matching inventory items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, ArrowDownToLine, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import type { Item, ServiceHistory } from '@/components/dashboard/inventory-types';
import { InventoryStockTable } from '@/components/dashboard/inventory-stock-table';
import { InventoryActionForm } from '@/components/dashboard/inventory-action-form';
import { InventoryServiceHistory } from '@/components/dashboard/inventory-service-history';

export default function InventoryDashboard() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [skuInput, setSkuInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');

  const [historyLogs, setHistoryLogs] = useState<ServiceHistory[]>([
    { id: '1', date: '2026-06-08', sku: 'B-IP11', action: 'CLAIM/FIX', qty: 1, notes: 'Replaced battery for customer.' },
    { id: '2', date: '2026-06-07', sku: 'BG-IP17PR', action: 'RESTOCK', qty: 5, notes: 'Supplier delivery.' },
  ]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory?format=json');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch {
      showMessage('Failed to load inventory', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        if (userData.role !== 'ADMIN' && userData.role !== 'MANAGER') {
          router.replace('/dashboard');
        } else {
          setAuthLoading(false);
          fetchItems();
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAction = async (type: 'buy' | 'sell' | 'fix', overrideQty?: number) => {
    const qtyVal = overrideQty !== undefined ? overrideQty : parseInt(qtyInput);
    if (!skuInput || isNaN(qtyVal) || qtyVal <= 0) {
      showMessage('Please enter SKU and a valid quantity', 'error');
      return;
    }

    let delta = qtyVal;
    if (type === 'sell' || type === 'fix') delta = -delta;

    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStock', sku: skuInput.toUpperCase(), delta }),
      });
      const result = await res.json();

      if (result.success || result.message?.includes('Stock for')) {
        setHistoryLogs(prev => [{
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          sku: skuInput.toUpperCase(),
          action: type.toUpperCase(),
          qty: Math.abs(delta),
          notes: type === 'fix' ? 'Service/Fix applied' : (type === 'buy' ? 'Stock received' : 'Item sold')
        }, ...prev]);

        setSkuInput('');
        setQtyInput('');
        showMessage(result.message || 'Updated!', 'success');
        fetchItems();
      } else {
        showMessage(result.error || result.message, 'error');
      }
    } catch {
      showMessage('Error processing action', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="h-5 w-96 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Manage stock, purchases, sales and service history.</p>
      </div>

      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className={messageType === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}>
          {messageType === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription className="font-medium">{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="instock" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="instock" className="flex items-center gap-1.5 sm:gap-2">
            <Package className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">In Stock</span>
          </TabsTrigger>
          <TabsTrigger value="buy" className="flex items-center gap-1.5 sm:gap-2">
            <ArrowDownToLine className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Buy</span>
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex items-center gap-1.5 sm:gap-2">
            <ShoppingCart className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Sell</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5 sm:gap-2">
            <History className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* ── IN STOCK ── */}
        <TabsContent value="instock" className="mt-6">
          <InventoryStockTable items={items} loading={loading} />
        </TabsContent>

        {/* ── BUY / RECEIVE ── */}
        <TabsContent value="buy" className="mt-6">
          <InventoryActionForm
            variant="buy"
            skuInput={skuInput}
            setSkuInput={setSkuInput}
            qtyInput={qtyInput}
            setQtyInput={setQtyInput}
            onSubmit={() => handleAction('buy')}
            submitting={submitting}
          />
        </TabsContent>

        {/* ── SELL / DISPATCH ── */}
        <TabsContent value="sell" className="mt-6">
          <InventoryActionForm
            variant="sell"
            skuInput={skuInput}
            setSkuInput={setSkuInput}
            qtyInput={qtyInput}
            setQtyInput={setQtyInput}
            onSubmit={() => handleAction('sell')}
            submitting={submitting}
          />
        </TabsContent>

        {/* ── SERVICE HISTORY ── */}
        <TabsContent value="history" className="mt-6">
          <InventoryServiceHistory
            historyLogs={historyLogs}
            skuInput={skuInput}
            setSkuInput={setSkuInput}
            onLogFix={() => { setQtyInput('1'); handleAction('fix', 1); }}
            submitting={submitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

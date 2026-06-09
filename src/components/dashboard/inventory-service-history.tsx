'use client';

import { Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ServiceHistory } from '@/components/dashboard/inventory-types';
import { Spinner } from '@/components/ui/spinner';

interface InventoryServiceHistoryProps {
  historyLogs: ServiceHistory[];
  skuInput: string;
  setSkuInput: (value: string) => void;
  onLogFix: () => void;
  submitting?: boolean;
}

export function InventoryServiceHistory({ historyLogs, skuInput, setSkuInput, onLogFix, submitting = false }: InventoryServiceHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Service & Fix History</CardTitle>
            <CardDescription>Record of claims, fixes, and inventory movements.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Input placeholder="SKU…" value={skuInput} onChange={(e) => setSkuInput(e.target.value)} className="w-28 uppercase" />
            <Button variant="secondary" onClick={onLogFix} disabled={submitting} className="shrink-0">
              {submitting ? <Spinner className="mr-2 text-current" /> : <Wrench className="w-4 h-4 mr-2" />}
              Log Fix
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historyLogs.map((log) => (
            <div key={log.id} className="flex gap-4 group">
              <div className="hidden sm:flex flex-col items-center pt-1">
                <div className={`w-3 h-3 rounded-full ring-4 ring-background ${
                  log.action === 'RESTOCK' || log.action === 'BUY' ? 'bg-primary' :
                  log.action === 'CLAIM/FIX' || log.action === 'FIX' ? 'bg-purple-500' :
                  'bg-destructive'
                }`} />
                <Separator orientation="vertical" className="flex-1 mt-1" />
              </div>
              <Card className="flex-1 group-hover:bg-muted/50 transition-colors border-dashed">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        log.action === 'RESTOCK' || log.action === 'BUY' ? 'default' :
                        log.action === 'CLAIM/FIX' || log.action === 'FIX' ? 'secondary' :
                        'destructive'
                      }>
                        {log.action}
                      </Badge>
                      <span className="font-mono text-sm font-semibold">{log.sku}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.notes}
                    <span className="font-semibold text-foreground ml-1">
                      ({log.action === 'RESTOCK' || log.action === 'BUY' ? '+' : '-'}{log.qty} units)
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}

          {historyLogs.length === 0 && (
            <div className="text-muted-foreground text-center py-12 border border-dashed rounded-lg">
              No history logs found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

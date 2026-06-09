'use client';

import { ArrowDownToLine, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface InventoryActionFormProps {
  variant: 'buy' | 'sell';
  skuInput: string;
  setSkuInput: (value: string) => void;
  qtyInput: string;
  setQtyInput: (value: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
}

const variantConfig = {
  buy: {
    icon: ArrowDownToLine,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Receive Stock',
    description: 'Add incoming supplier deliveries to your inventory.',
    buttonText: 'Confirm Restock',
    buttonVariant: 'default' as const,
    skuId: 'buy-sku',
    qtyId: 'buy-qty',
  },
  sell: {
    icon: ShoppingCart,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    title: 'Dispatch / Sell',
    description: 'Deduct items for retail sales or dispatch.',
    buttonText: 'Confirm Dispatch',
    buttonVariant: 'destructive' as const,
    skuId: 'sell-sku',
    qtyId: 'sell-qty',
  },
};

export function InventoryActionForm({
  variant,
  skuInput,
  setSkuInput,
  qtyInput,
  setQtyInput,
  onSubmit,
  submitting = false
}: InventoryActionFormProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="max-w-xl md:max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className={`mx-auto w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
            <Icon className={`w-7 h-7 ${config.iconColor}`} />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor={config.skuId}>Item SKU</Label>
            <Input id={config.skuId} placeholder="e.g. B-IP11" value={skuInput} onChange={(e) => setSkuInput(e.target.value)} className="uppercase" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={config.qtyId}>Quantity</Label>
            <Input id={config.qtyId} type="number" min={1} placeholder="Amount" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant={config.buttonVariant} className="w-full" size="lg" onClick={onSubmit} disabled={submitting}>
            {submitting ? <Spinner className="text-current mr-2 animate-spin" /> : null}
            {config.buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

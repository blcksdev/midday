"use client";

import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Tabs, TabsList, TabsTrigger } from "@midday/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";

export function BillingHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams?.get("tab") || "invoices";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value === "invoices") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.push(`/billing?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Billing</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your invoices, subscription, and payment methods
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="invoices" className="gap-2">
            <Icons.ReceiptLong size={16} />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <Icons.Repeat size={16} />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <Icons.Currency size={16} />
            Payment Method
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

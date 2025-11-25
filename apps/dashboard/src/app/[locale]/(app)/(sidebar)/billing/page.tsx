"use client";

import { BillingHeader } from "@/components/billing/billing-header";
import { BillingView } from "@/components/billing/billing-view";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <BillingHeader />
      <BillingView />
    </div>
  );
}

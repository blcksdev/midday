"use client";

import { useSearchParams } from "next/navigation";
import { InvoicesTab } from "./invoices-tab";
import { SubscriptionTab } from "./subscription-tab";
import { PaymentTab } from "./payment-tab";

export function BillingView() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "invoices";

  return (
    <div className="pb-6">
      {tab === "invoices" && <InvoicesTab />}
      {tab === "subscription" && <SubscriptionTab />}
      {tab === "payment" && <PaymentTab />}
    </div>
  );
}

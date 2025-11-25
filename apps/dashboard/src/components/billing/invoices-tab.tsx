"use client";

import { useState, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { Input } from "@midday/ui/input";
import { cn } from "@midday/ui/cn";
import { formatDistance } from "date-fns";

export function InvoicesTab() {
  const trpc = useTRPC();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const infiniteQueryOptions = trpc.billing.orders.infiniteQueryOptions(
    { pageSize: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.meta.cursor,
    }
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(infiniteQueryOptions);

  const getInvoiceMutation = useMutation(
    trpc.billing.getInvoice.mutationOptions({
      onSuccess: (result) => {
        if (result.status === "ready" && result.downloadUrl) {
          window.open(result.downloadUrl, "_blank");
        } else if (result.status === "generating") {
          alert("Invoice is being generated. Please try again in a moment.");
        }
        setDownloadingId(null);
      },
      onError: (error) => {
        console.error("Failed to download invoice:", error);
        alert("Failed to download invoice. Please try again.");
        setDownloadingId(null);
      },
    })
  );

  const invoices = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    getInvoiceMutation.mutate(invoiceId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (invoices.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icons.ReceiptLong size={32} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No invoices yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your invoices will appear here once you make a purchase or subscribe to a plan.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Icons.Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icons.ReceiptLong size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{invoice.product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(new Date(invoice.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatAmount(invoice.amount.amount, invoice.amount.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Invoice #{invoice.id.slice(0, 8)}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                  {invoice.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(invoice.id)}
                  disabled={downloadingId === invoice.id || !invoice.invoiceId}
                  className="flex-1 gap-2"
                >
                  {downloadingId === invoice.id ? (
                    <>
                      <Icons.Refresh size={14} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Icons.PdfOutline size={14} />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Icons.Refresh size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Icons.ArrowDownward size={16} />
                Load More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

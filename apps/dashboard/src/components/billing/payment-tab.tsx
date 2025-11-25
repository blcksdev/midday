"use client";

import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";

export function PaymentTab() {
  const handleUpdatePayment = () => {
    // Redirect to Polar customer portal for payment method updates
    window.open("/api/portal", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Current Payment Method */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Payment Method</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your payment methods and billing information
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Verified
            </Badge>
          </div>

          {/* Card Display */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg text-white">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Icons.Currency size={24} />
                <span className="text-sm font-medium">Credit Card</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-mono tracking-wider">•••• •••• •••• 4242</p>
                <p className="text-xs opacity-70">Expires 12/25</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-70">Cardholder</p>
                  <p className="text-sm font-medium">John Doe</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">Type</p>
                  <p className="text-sm font-medium">Visa</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleUpdatePayment} className="gap-2">
              <Icons.Edit size={16} />
              Update Payment Method
            </Button>
            <Button variant="outline" className="gap-2">
              <Icons.Add size={16} />
              Add New Card
            </Button>
          </div>
        </div>
      </Card>

      {/* Billing Address */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Street Address</p>
              <p className="text-sm font-medium">123 Business Street</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="text-sm font-medium">San Francisco</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State / Province</p>
              <p className="text-sm font-medium">California</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ZIP / Postal Code</p>
              <p className="text-sm font-medium">94102</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="text-sm font-medium">United States</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" className="gap-2">
              <Icons.Edit size={14} />
              Edit Address
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        <div className="space-y-3">
          {[
            {
              date: new Date(),
              amount: "$99.00",
              status: "Succeeded",
              method: "•••• 4242",
            },
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              amount: "$99.00",
              status: "Succeeded",
              method: "•••• 4242",
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              amount: "$99.00",
              status: "Succeeded",
              method: "•••• 4242",
            },
          ].map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icons.Check size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{payment.date.toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{payment.method}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{payment.amount}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <Icons.InfoOutline size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Secure Payment Processing
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              All payment information is securely processed through Polar.sh. We never store your
              full card details on our servers. Click "Update Payment Method" to manage your
              payment information securely.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

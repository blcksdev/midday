"use client";

import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";

export function SubscriptionTab() {
  // TODO: Fetch subscription data from Polar API
  // For now, showing a placeholder

  const handleManageSubscription = () => {
    // Redirect to Polar customer portal
    window.open("/api/portal", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Current Subscription</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your subscription and billing preferences
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Details */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">Professional</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="text-lg font-semibold">Monthly</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">$99.00 / month</p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="text-lg font-semibold">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="text-lg font-semibold">
                  {new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleManageSubscription} className="gap-2">
              <Icons.Settings size={16} />
              Manage Subscription
            </Button>
            <Button variant="outline" className="gap-2">
              <Icons.Repeat size={16} />
              Change Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscription Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Unlimited projects",
            "Advanced analytics",
            "Priority support",
            "Custom integrations",
            "Team collaboration",
            "API access",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Icons.Check size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Billing History</h3>
        <div className="space-y-3">
          {[
            { date: new Date(), amount: "$99.00", status: "Paid" },
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              amount: "$99.00",
              status: "Paid",
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              amount: "$99.00",
              status: "Paid",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Icons.ReceiptLong size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.date.toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Monthly subscription</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{item.amount}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <Icons.InfoOutline size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Subscription Management
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              To upgrade, downgrade, or cancel your subscription, use the "Manage Subscription"
              button which will open our secure customer portal.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

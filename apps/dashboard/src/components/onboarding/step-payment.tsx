"use client";

import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";

interface StepPaymentProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPayment({ onNext, onBack }: StepPaymentProps) {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Setup Payment</h2>
        <p className="text-sm text-muted-foreground">
          Add a payment method to activate your subscription.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">Pro Plan</h3>
              <p className="text-muted-foreground">$299 / month</p>
            </div>
            <Badge>Selected</Badge>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Icons.Check size={16} className="text-primary" />
              Full access to Customer Portal
            </li>
            <li className="flex items-center gap-2">
              <Icons.Check size={16} className="text-primary" />
              Dedicated Support
            </li>
            <li className="flex items-center gap-2">
              <Icons.Check size={16} className="text-primary" />
              Unlimited Projects
            </li>
          </ul>
        </div>

        <Button className="w-full h-12 text-lg gap-2" onClick={() => window.open("/api/portal", "_blank")}>
          <Icons.ReceiptLong size={20} />
          Add Payment Method
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          You will be redirected to our secure payment portal powered by Polar.
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          I've Added Payment
        </Button>
      </div>
    </Card>
  );
}

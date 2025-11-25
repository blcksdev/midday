"use client";

import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Icons } from "@midday/ui/icons";

interface StepCompanyProfileProps {
  onNext: () => void;
}

export function StepCompanyProfile({ onNext }: StepCompanyProfileProps) {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Company Profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about your company so we can customize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" placeholder="Acme Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://acme.com" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Main St" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="San Francisco" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="United States" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / VAT Number</Label>
          <Input id="taxId" placeholder="Optional" />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Continue
          <Icons.ArrowForward size={16} />
        </Button>
      </div>
    </Card>
  );
}

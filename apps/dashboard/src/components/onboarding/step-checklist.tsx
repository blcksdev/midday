"use client";

import { useState } from "react";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Checkbox } from "@midday/ui/checkbox";
import { Label } from "@midday/ui/label";
import { useRouter } from "next/navigation";

interface StepChecklistProps {
  onBack: () => void;
}

export function StepChecklist({ onBack }: StepChecklistProps) {
  const router = useRouter();
  const [items, setItems] = useState([
    { id: "creds", label: "Share necessary credentials in Vault", checked: false, link: "/credentials" },
    { id: "docs", label: "Upload brand assets and documentation", checked: false, link: "/vault" },
    { id: "team", label: "Invite your team members", checked: false, link: "/settings/members" },
    { id: "slack", label: "Join our Slack channel", checked: false },
  ]);

  const allChecked = items.every(i => i.checked);

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Check size={32} />
        </div>
        <h2 className="text-2xl font-semibold">You're almost done!</h2>
        <p className="text-muted-foreground mt-2">
          Complete these final items so we can start working together effectively.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox 
              id={item.id} 
              checked={item.checked} 
              onCheckedChange={() => toggleItem(item.id)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {item.label}
              </Label>
              {item.link && (
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs text-muted-foreground justify-start"
                  onClick={() => window.open(item.link, "_blank")}
                >
                  Go to page <Icons.ExternalLink size={10} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={() => router.push("/")} 
          className="gap-2"
          variant={allChecked ? "default" : "secondary"}
        >
          Finish Onboarding
          <Icons.ArrowForward size={16} />
        </Button>
      </div>
    </Card>
  );
}

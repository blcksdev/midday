"use client";

import { useState } from "react";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { ContractDetails } from "@/components/contracts/contract-details";

interface StepContractsProps {
  onNext: () => void;
  onBack: () => void;
}

// Mock contract for onboarding
const ONBOARDING_CONTRACT = {
  id: "onboarding-msa",
  title: "Master Service Agreement",
  type: "Service Agreement",
  status: "pending_signature",
  createdAt: new Date().toISOString(),
  parties: ["Your Company", "Midday Inc"],
};

export function StepContracts({ onNext, onBack }: StepContractsProps) {
  const [isSigned, setIsSigned] = useState(false);
  const [view, setView] = useState<"list" | "details">("list");

  // Mock signing handler passed to ContractDetails would update this
  // For now, we'll simulate it with a button in the list view or just assume if they click "Sign" in details it works
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Sign Contracts</h2>
        <p className="text-sm text-muted-foreground">
          Please review and sign the necessary legal documents to proceed.
        </p>
      </div>

      {view === "list" ? (
        <Card className="p-6">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.Description size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Master Service Agreement</h3>
                <p className="text-sm text-muted-foreground">Required for all new customers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isSigned ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <Icons.Check size={14} className="mr-1" />
                  Signed
                </Badge>
              ) : (
                <Button onClick={() => setView("details")} variant="outline" className="gap-2">
                  <Icons.Edit size={16} />
                  Sign Now
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={!isSigned}>
              Continue
            </Button>
          </div>
          
          {/* Dev bypass for testing */}
          {!isSigned && (
            <div className="mt-4 text-center">
               <Button variant="link" size="sm" onClick={() => setIsSigned(true)} className="text-xs text-muted-foreground">
                 (Dev: Mark as Signed)
               </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setView("list")} className="gap-2 pl-0">
            <Icons.ArrowBack size={16} />
            Back to Contracts
          </Button>
          <ContractDetails contract={{...ONBOARDING_CONTRACT, status: isSigned ? "signed" : "pending_signature"}} />
        </div>
      )}
    </div>
  );
}

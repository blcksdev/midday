"use client";

import { useState } from "react";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { cn } from "@midday/ui/cn";
import { ContractDetails } from "./contract-details";

interface ContractsViewProps {
  view: "list" | "details";
  setView: (view: "list" | "details") => void;
  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
}

// Mock data
const MOCK_CONTRACTS = [
  {
    id: "1",
    title: "Master Service Agreement",
    type: "Service Agreement",
    status: "pending_signature",
    createdAt: "2024-03-20T10:00:00Z",
    parties: ["Acme Corp", "Midday Inc"],
  },
  {
    id: "2",
    title: "Non-Disclosure Agreement",
    type: "NDA",
    status: "signed",
    createdAt: "2024-03-15T14:30:00Z",
    signedAt: "2024-03-16T09:15:00Z",
    parties: ["John Doe", "Midday Inc"],
  },
  {
    id: "3",
    title: "Data Processing Agreement",
    type: "DPA",
    status: "draft",
    createdAt: "2024-03-22T11:20:00Z",
    parties: ["Acme Corp", "Midday Inc"],
  },
];

export function ContractsView({ 
  view, 
  setView, 
  selectedContractId, 
  setSelectedContractId 
}: ContractsViewProps) {
  
  if (view === "details" && selectedContractId) {
    const contract = MOCK_CONTRACTS.find(c => c.id === selectedContractId);
    return <ContractDetails contract={contract} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending_signature":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <Icons.Check size={16} />;
      case "pending_signature":
        return <Icons.History size={16} />;
      case "draft":
        return <Icons.Edit size={16} />;
      default:
        return <Icons.Description size={16} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
      {MOCK_CONTRACTS.map((contract) => (
        <Card 
          key={contract.id} 
          className="p-6 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => {
            setSelectedContractId(contract.id);
            setView("details");
          }}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icons.Description size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold line-clamp-1">{contract.title}</h3>
                  <p className="text-xs text-muted-foreground">{contract.type}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs gap-1", getStatusColor(contract.status))}>
                {getStatusIcon(contract.status)}
                {contract.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
              </div>
              {contract.signedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Signed</span>
                  <span>{new Date(contract.signedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {contract.status === "pending_signature" ? (
                <Button className="w-full gap-2">
                  <Icons.Edit size={16} />
                  Sign Now
                </Button>
              ) : (
                <Button variant="outline" className="w-full gap-2">
                  <Icons.Visibility size={16} />
                  View Details
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
